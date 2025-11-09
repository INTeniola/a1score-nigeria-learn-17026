// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StudySession {
  id: string;
  subject_id: string;
  session_type: string;
  duration_minutes: number;
  points_earned: number;
  started_at: string;
  ended_at: string | null;
  metadata: any;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  criteria: any;
  points: number;
  earned_at?: string;
}

interface ProgressStats {
  totalQuizzes: number;
  averageScore: number;
  streakDays: number;
  totalStudyHours: number;
  totalPoints: number;
  leagueRank?: number;
  leagueName?: string;
  achievements: Achievement[];
  weeklyProgress: { subject: string; hours: number; points: number }[];
}

export const useProgressTracking = () => {
  const { user } = useAuth();
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  useEffect(() => {
    if (user) {
      loadProgressStats();
    }
  }, [user]);

  const loadProgressStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', user.id);

      // Get study sessions for weekly progress
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select(`
          *,
          subjects (name)
        `)
        .eq('user_id', user.id)
        .gte('started_at', oneWeekAgo.toISOString());

      // Calculate total study hours from sessions
      const totalStudyHours = recentSessions?.reduce((total, session) => 
        total + (session.duration_minutes || 0), 0) || 0;

      // Calculate total points
      const totalPoints = recentSessions?.reduce((total, session) => 
        total + (session.points_earned || 0), 0) || 0;

      // Group weekly progress by subject
      const weeklyProgress = recentSessions?.reduce((acc: any[], session: any) => {
        const subjectName = session.subjects?.name || 'Unknown';
        const existing = acc.find(item => item.subject === subjectName);
        
        if (existing) {
          existing.hours += session.duration_minutes || 0;
          existing.points += session.points_earned || 0;
        } else {
          acc.push({
            subject: subjectName,
            hours: session.duration_minutes || 0,
            points: session.points_earned || 0
          });
        }
        
        return acc;
      }, []) || [];

      // Calculate streak (simplified - count consecutive days with activity)
      const streakDays = calculateStreakDays(recentSessions || []);

      // Calculate league rank based on total points (using points from sessions since user_progress doesn't have total_points)
      const { data: allUsers } = await supabase
        .from('study_sessions')
        .select('user_id, points_earned');

      // Aggregate points by user
      const userPointsMap = new Map<string, number>();
      allUsers?.forEach(session => {
        const current = userPointsMap.get(session.user_id) || 0;
        userPointsMap.set(session.user_id, current + (session.points_earned || 0));
      });

      // Sort users by points
      const sortedUsers = Array.from(userPointsMap.entries())
        .sort((a, b) => b[1] - a[1]);

      const userRank = sortedUsers.findIndex(([userId]) => userId === user.id);
      const leagueName = totalPoints < 500 ? 'Bronze League' :
                        totalPoints < 1500 ? 'Silver League' :
                        totalPoints < 3000 ? 'Gold League' : 'Diamond League';

      setProgressStats({
        totalQuizzes: userProgress?.total_quizzes || 0,
        averageScore: userProgress?.average_score || 0,
        streakDays,
        totalStudyHours: Math.round(totalStudyHours / 60), // Convert to hours
        totalPoints,
        leagueRank: userRank >= 0 ? userRank + 1 : undefined,
        leagueName,
        achievements: userAchievements?.map(ua => ({
          ...ua.achievements,
          earned_at: ua.earned_at
        })) || [],
        weeklyProgress
      });

    } catch (error) {
      console.error('Error loading progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreakDays = (sessions: any[]) => {
    if (!sessions.length) return 0;

    const uniqueDays = [...new Set(sessions.map(session => 
      new Date(session.started_at).toDateString()
    ))].sort();

    let streak = 0;
    const today = new Date().toDateString();
    
    // Count consecutive days ending with today or yesterday
    for (let i = uniqueDays.length - 1; i >= 0; i--) {
      const daysDiff = Math.floor((new Date(today).getTime() - new Date(uniqueDays[i]).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const startStudySession = async (subjectId: string, sessionType: string) => {
    if (!user) return null;

    try {
      const { data: session, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          session_type: sessionType,
          started_at: new Date().toISOString(),
          duration_minutes: 0,
          points_earned: 0
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  };

  const endStudySession = async (pointsEarned: number = 0) => {
    if (!currentSession || !user) return;

    try {
      const endTime = new Date();
      const startTime = new Date(currentSession.started_at);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      await supabase
        .from('study_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration_minutes: durationMinutes,
          points_earned: pointsEarned
        })
        .eq('id', currentSession.id);

      setCurrentSession(null);
      loadProgressStats(); // Refresh stats
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!user || !progressStats) return;

    try {
      // Get all available achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      // Check which achievements haven't been earned yet
      const earnedAchievementIds = progressStats.achievements.map(a => a.id);
      const unearned = allAchievements?.filter(a => !earnedAchievementIds.includes(a.id)) || [];

      for (const achievement of unearned) {
        const criteria = achievement.criteria as any;
        let shouldAward = false;

        switch (criteria?.type) {
          case 'quiz_completed':
            shouldAward = progressStats.totalQuizzes >= (criteria?.target || 0);
            break;
          case 'quiz_streak':
            shouldAward = progressStats.streakDays >= (criteria?.target || 0);
            break;
          case 'study_hours':
            shouldAward = progressStats.totalStudyHours >= (criteria?.target || 0);
            break;
          // Add more achievement types as needed
        }

        if (shouldAward) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id
            });
        }
      }

      // Refresh progress stats to include new achievements
      loadProgressStats();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  return {
    progressStats,
    loading,
    currentSession,
    startStudySession,
    endStudySession,
    checkAndAwardAchievements,
    refreshStats: loadProgressStats
  };
};