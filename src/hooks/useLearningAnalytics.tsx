import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningSession {
  id: string;
  session_type: string;
  subject: string;
  topic?: string | null;
  duration_minutes?: number | null;
  questions_answered: number;
  correct_answers: number;
  performance_score?: number | null;
  concepts_covered?: string[] | null;
  started_at: string;
  ended_at?: string | null;
}

interface ConceptMastery {
  concept: string;
  masteryLevel: number; // 0-100
  lastPracticed: string;
  practiceCount: number;
}

interface StudyEffectiveness {
  averageAccuracy: number;
  averageDuration: number;
  totalSessions: number;
  conceptsMastered: number;
  weakAreas: string[];
  strongAreas: string[];
  studyStreak: number;
}

export function useLearningAnalytics() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [conceptMastery, setConceptMastery] = useState<ConceptMastery[]>([]);
  const [effectiveness, setEffectiveness] = useState<StudyEffectiveness>({
    averageAccuracy: 0,
    averageDuration: 0,
    totalSessions: 0,
    conceptsMastered: 0,
    weakAreas: [],
    strongAreas: [],
    studyStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load learning sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      // Calculate concept mastery
      const conceptMap = new Map<string, { correct: number; total: number; lastPracticed: string }>();
      
      sessionsData?.forEach(session => {
        if (session.concepts_covered) {
          session.concepts_covered.forEach((concept: string) => {
            const existing = conceptMap.get(concept) || { correct: 0, total: 0, lastPracticed: session.started_at };
            conceptMap.set(concept, {
              correct: existing.correct + (session.correct_answers || 0),
              total: existing.total + (session.questions_answered || 1),
              lastPracticed: session.started_at > existing.lastPracticed ? session.started_at : existing.lastPracticed
            });
          });
        }
      });

      const masteryData: ConceptMastery[] = Array.from(conceptMap.entries()).map(([concept, data]) => ({
        concept,
        masteryLevel: Math.round((data.correct / data.total) * 100),
        lastPracticed: data.lastPracticed,
        practiceCount: data.total
      }));

      setConceptMastery(masteryData);

      // Calculate effectiveness metrics
      const completedSessions = sessionsData?.filter(s => s.ended_at) || [];
      const totalAccuracy = completedSessions.reduce((sum, s) => {
        if (s.questions_answered > 0) {
          return sum + (s.correct_answers / s.questions_answered);
        }
        return sum;
      }, 0);

      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      
      const strongAreas = masteryData.filter(m => m.masteryLevel >= 80).map(m => m.concept);
      const weakAreas = masteryData.filter(m => m.masteryLevel < 60).map(m => m.concept);

      // Calculate study streak
      const streak = calculateStudyStreak(sessionsData || []);

      setEffectiveness({
        averageAccuracy: completedSessions.length > 0 ? (totalAccuracy / completedSessions.length) * 100 : 0,
        averageDuration: completedSessions.length > 0 ? totalDuration / completedSessions.length : 0,
        totalSessions: completedSessions.length,
        conceptsMastered: strongAreas.length,
        weakAreas,
        strongAreas,
        studyStreak: streak
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load learning analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateStudyStreak = (sessions: LearningSession[]): number => {
    if (sessions.length === 0) return 0;

    const dates = sessions
      .map(s => new Date(s.started_at).toISOString().split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split('T')[0];
      
      if (dates[i] === expected) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const startSession = async (
    sessionType: 'quiz' | 'ai_chat' | 'document_study' | 'practice',
    subject: string,
    topic?: string
  ): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          subject,
          topic,
          questions_answered: 0,
          correct_answers: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data.id);
      return data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  };

  const endSession = async (
    sessionId: string,
    questionsAnswered: number,
    correctAnswers: number,
    conceptsCovered?: string[]
  ): Promise<void> => {
    try {
      const startTime = sessions.find(s => s.id === sessionId)?.started_at;
      const durationMinutes = startTime 
        ? Math.round((Date.now() - new Date(startTime).getTime()) / 60000)
        : 0;

      const performanceScore = questionsAnswered > 0 
        ? (correctAnswers / questionsAnswered) * 100 
        : 0;

      const { error } = await supabase
        .from('learning_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          questions_answered: questionsAnswered,
          correct_answers: correctAnswers,
          performance_score: performanceScore,
          concepts_covered: conceptsCovered || []
        })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentSession(null);
      await loadAnalytics();
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to save session data');
    }
  };

  return {
    sessions,
    conceptMastery,
    effectiveness,
    loading,
    currentSession,
    startSession,
    endSession,
    refreshAnalytics: loadAnalytics
  };
}
