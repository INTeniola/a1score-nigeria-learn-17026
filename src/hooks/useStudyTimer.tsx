import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudySession {
  id: string;
  user_id: string;
  session_type: 'focus' | 'short-break' | 'long-break';
  subject?: string;
  topic?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  metadata?: any;
}

export function useStudyTimer() {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && currentSession) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentSession]);

  const startSession = async (
    sessionType: 'focus' | 'short-break' | 'long-break',
    subject?: string,
    topic?: string,
    metadata?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          subject,
          topic,
          started_at: new Date().toISOString(),
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data as StudySession);
      setIsRunning(true);
      setTimeElapsed(0);
      
      toast.success('Study session started!');
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
      return null;
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    if (currentSession) {
      setIsRunning(true);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    try {
      const durationMinutes = Math.round(timeElapsed / 60);
      
      const { error } = await supabase
        .from('learning_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes: durationMinutes
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setIsRunning(false);
      setCurrentSession(null);
      setTimeElapsed(0);
      
      toast.success(`Session completed! ${durationMinutes} minutes logged.`);
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to save session');
    }
  };

  const getRecentSessions = async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as StudySession[];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  };

  const getTodayStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalMinutes: 0, sessionCount: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('learning_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', today.toISOString());

      if (error) throw error;

      const totalMinutes = data?.reduce((sum, session) => 
        sum + (session.duration_minutes || 0), 0) || 0;

      return {
        totalMinutes,
        sessionCount: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching today stats:', error);
      return { totalMinutes: 0, sessionCount: 0 };
    }
  };

  return {
    currentSession,
    isRunning,
    timeElapsed,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    getRecentSessions,
    getTodayStats
  };
}