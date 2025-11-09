import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudyGoal {
  id: string;
  user_id: string;
  goal_type: 'study_hours' | 'topic_mastery' | 'exam_prep' | 'quiz_score';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  time_period: 'daily' | 'weekly' | 'monthly' | 'custom';
  start_date: string;
  end_date: string;
  subject?: string;
  topic?: string;
  status: 'active' | 'completed' | 'cancelled';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useStudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals((data || []) as unknown as StudyGoal[]);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<StudyGoal, 'id' | 'user_id' | 'current_value' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('study_goals')
        .insert({
          ...goal,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Goal created!');
      await loadGoals();
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
      return null;
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error } = await supabase
        .from('study_goals')
        .update({ 
          current_value: newValue,
          status: newValue >= goal.target_value ? 'completed' : 'active'
        })
        .eq('id', goalId);

      if (error) throw error;

      // Check for achievement
      if (newValue >= goal.target_value) {
        await createAchievement(goal);
      }

      await loadGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Goal deleted');
      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const cancelGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('study_goals')
        .update({ status: 'cancelled' })
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Goal cancelled');
      await loadGoals();
    } catch (error) {
      console.error('Error cancelling goal:', error);
      toast.error('Failed to cancel goal');
    }
  };

  const createAchievement = async (goal: StudyGoal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_type: 'goal_completed',
        title: `Completed: ${goal.title}`,
        description: `Successfully achieved ${goal.target_value} ${goal.goal_type.replace('_', ' ')}`,
        icon: '🎯',
        metadata: { goal_id: goal.id, goal_type: goal.goal_type }
      });

      toast.success('🎉 Achievement unlocked!', {
        description: `You completed: ${goal.title}`
      });
    } catch (error) {
      console.error('Error creating achievement:', error);
    }
  };

  const calculateGoalProgress = (goal: StudyGoal): number => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getDaysRemaining = (goal: StudyGoal): number => {
    const end = new Date(goal.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const getActiveGoals = () => goals.filter(g => g.status === 'active');
  
  const getCompletedGoals = () => goals.filter(g => g.status === 'completed');

  const getGoalsByType = (type: StudyGoal['goal_type']) => goals.filter(g => g.goal_type === type && g.status === 'active');

  return {
    goals,
    loading,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    cancelGoal,
    calculateGoalProgress,
    getDaysRemaining,
    getActiveGoals,
    getCompletedGoals,
    getGoalsByType,
    refreshGoals: loadGoals
  };
}
