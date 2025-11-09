import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConceptMastery {
  subject: string;
  mastery: number;
}

interface StudyTimeTrend {
  date: string;
  hours: number;
  sessions: number;
}

interface QuizPerformance {
  date: string;
  score: number;
  subject: string;
}

interface ExamReadiness {
  readiness_score: number;
  mastery_score: number;
  practice_count: number;
  study_hours: number;
  days_remaining: number;
  status: 'ready' | 'almost_ready' | 'needs_work' | 'not_ready';
  recommendation: string;
}

interface LearningInsight {
  id: string;
  insight_type: string;
  insight_text: string;
  confidence_score: number;
  data_points: any;
  generated_at: string;
  is_read: boolean;
}

interface WeakConcept {
  subject: string;
  topic: string;
  mastery: number;
  last_studied: string;
}

export function useProgressAnalytics() {
  const [loading, setLoading] = useState(true);
  const [conceptMastery, setConceptMastery] = useState<ConceptMastery[]>([]);
  const [studyTimeTrends, setStudyTimeTrends] = useState<StudyTimeTrend[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyHours, setTotalStudyHours] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await Promise.all([
        loadConceptMastery(user.id),
        loadStudyTimeTrends(user.id),
        loadQuizPerformance(user.id),
        loadInsights(user.id),
        loadWeakConcepts(user.id),
        loadStudyStreak(user.id),
        loadTotalStudyHours(user.id)
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadConceptMastery = async (userId: string) => {
    // Get unique subjects from recent activity
    const { data: subjects } = await supabase
      .from('learning_sessions')
      .select('subject')
      .eq('user_id', userId)
      .not('subject', 'is', null);

    if (!subjects) return;

    const uniqueSubjects = [...new Set(subjects.map(s => s.subject))];
    
    const masteryData = await Promise.all(
      uniqueSubjects.map(async (subject) => {
        const { data, error } = await supabase.rpc('calculate_concept_mastery', {
          p_user_id: userId,
          p_subject: subject
        });

        if (error) {
          console.error('Error calculating mastery:', error);
          return { subject, mastery: 0 };
        }

        return { subject, mastery: data || 0 };
      })
    );

    setConceptMastery(masteryData);
  };

  const loadStudyTimeTrends = async (userId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('learning_sessions')
      .select('started_at, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at', { ascending: true });

    if (error) {
      console.error('Error loading study trends:', error);
      return;
    }

    // Group by date
    const trendsByDate = new Map<string, { hours: number; sessions: number }>();
    
    data?.forEach(session => {
      const date = new Date(session.started_at).toLocaleDateString();
      const existing = trendsByDate.get(date) || { hours: 0, sessions: 0 };
      
      trendsByDate.set(date, {
        hours: existing.hours + ((session.duration_minutes || 0) / 60),
        sessions: existing.sessions + 1
      });
    });

    const trends = Array.from(trendsByDate.entries()).map(([date, data]) => ({
      date,
      ...data
    }));

    setStudyTimeTrends(trends);
  };

  const loadQuizPerformance = async (userId: string) => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('completed_at, score, subject')
      .eq('user_id', userId)
      .order('completed_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading quiz performance:', error);
      return;
    }

    const performance = data?.map(attempt => ({
      date: new Date(attempt.completed_at).toLocaleDateString(),
      score: attempt.score,
      subject: attempt.subject
    })) || [];

    setQuizPerformance(performance);
  };

  const loadInsights = async (userId: string) => {
    const { data, error } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading insights:', error);
      return;
    }

    setInsights(data || []);
  };

  const loadWeakConcepts = async (userId: string) => {
    // Find topics with low mastery in spaced repetition
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select('subject, topic, mastery_level, last_reviewed_at')
      .eq('user_id', userId)
      .order('mastery_level', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error loading weak concepts:', error);
      return;
    }

    // Group by subject/topic and calculate average mastery
    const conceptMap = new Map<string, { subject: string; topic: string; mastery: number; last_studied: string; count: number }>();
    
    data?.forEach(card => {
      const key = `${card.subject}-${card.topic}`;
      const existing = conceptMap.get(key);
      
      if (existing) {
        existing.mastery = (existing.mastery * existing.count + (card.mastery_level || 0)) / (existing.count + 1);
        existing.count++;
        if (card.last_reviewed_at && card.last_reviewed_at > existing.last_studied) {
          existing.last_studied = card.last_reviewed_at;
        }
      } else {
        conceptMap.set(key, {
          subject: card.subject,
          topic: card.topic,
          mastery: card.mastery_level || 0,
          last_studied: card.last_reviewed_at || '',
          count: 1
        });
      }
    });

    const weak = Array.from(conceptMap.values())
      .filter(c => c.mastery < 50)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5);

    setWeakConcepts(weak);
  };

  const loadStudyStreak = async (userId: string) => {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(365);

    if (error || !data) {
      setStudyStreak(0);
      return;
    }

    // Calculate consecutive days
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const studyDates = new Set(
      data.map(s => {
        const date = new Date(s.started_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    while (studyDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    setStudyStreak(streak);
  };

  const loadTotalStudyHours = async (userId: string) => {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('duration_minutes')
      .eq('user_id', userId);

    if (error || !data) {
      setTotalStudyHours(0);
      return;
    }

    const total = data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    setTotalStudyHours(total / 60);
  };

  const getExamReadiness = async (subject: string, examDate: Date): Promise<ExamReadiness | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('calculate_exam_readiness', {
        p_user_id: user.id,
        p_subject: subject,
        p_exam_date: examDate.toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error calculating exam readiness:', error);
        return null;
      }

      return data as unknown as ExamReadiness;
    } catch (error) {
      console.error('Error getting exam readiness:', error);
      return null;
    }
  };

  const generateTimeOfDayInsight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_sessions')
        .select('started_at, performance_score')
        .eq('user_id', user.id)
        .not('performance_score', 'is', null)
        .limit(100);

      if (error || !data || data.length < 5) return;

      // Analyze performance by time of day
      const timeSlots = {
        morning: { scores: [] as number[], label: 'morning (6am-12pm)' },
        afternoon: { scores: [] as number[], label: 'afternoon (12pm-6pm)' },
        evening: { scores: [] as number[], label: 'evening (6pm-12am)' },
        night: { scores: [] as number[], label: 'night (12am-6am)' }
      };

      data.forEach(session => {
        const hour = new Date(session.started_at).getHours();
        const score = session.performance_score as number;
        
        if (hour >= 6 && hour < 12) timeSlots.morning.scores.push(score);
        else if (hour >= 12 && hour < 18) timeSlots.afternoon.scores.push(score);
        else if (hour >= 18 && hour < 24) timeSlots.evening.scores.push(score);
        else timeSlots.night.scores.push(score);
      });

      // Find best time
      let bestTime = '';
      let bestAvg = 0;

      Object.entries(timeSlots).forEach(([key, slot]) => {
        if (slot.scores.length >= 3) {
          const avg = slot.scores.reduce((a, b) => a + b, 0) / slot.scores.length;
          if (avg > bestAvg) {
            bestAvg = avg;
            bestTime = slot.label;
          }
        }
      });

      if (bestTime) {
        await supabase.from('learning_insights').insert({
          user_id: user.id,
          insight_type: 'time_of_day',
          insight_text: `You learn best in the ${bestTime}`,
          confidence_score: Math.min(data.length / 50, 1),
          data_points: { timeSlots, bestTime, bestAvg }
        });

        await loadInsights(user.id);
      }
    } catch (error) {
      console.error('Error generating time of day insight:', error);
    }
  };

  const markInsightAsRead = async (insightId: string) => {
    const { error } = await supabase
      .from('learning_insights')
      .update({ is_read: true })
      .eq('id', insightId);

    if (error) {
      console.error('Error marking insight as read:', error);
      return;
    }

    setInsights(insights.map(i => 
      i.id === insightId ? { ...i, is_read: true } : i
    ));
  };

  return {
    loading,
    conceptMastery,
    studyTimeTrends,
    quizPerformance,
    insights,
    weakConcepts,
    studyStreak,
    totalStudyHours,
    getExamReadiness,
    generateTimeOfDayInsight,
    markInsightAsRead,
    refreshAnalytics: loadAnalytics
  };
}
