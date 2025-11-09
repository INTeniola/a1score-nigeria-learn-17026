import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { OnboardingProgress, OnboardingStep } from '@/types/onboarding';
import { toast } from 'sonner';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding progress:', error);
        return;
      }

      if (!data) {
        // Create initial onboarding progress
        const { data: newProgress, error: insertError } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            current_step: 'welcome',
            session_count: 1,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating onboarding progress:', insertError);
          return;
        }

        setProgress(newProgress as OnboardingProgress);
        setShouldShowOnboarding(true);
      } else {
        setProgress(data as OnboardingProgress);
        
        // Show onboarding if not completed
        setShouldShowOnboarding(!data.onboarding_completed);

        // Progressive profiling: Show goals during 3rd session
        if (data.session_count === 3 && !data.goals_set) {
          setShouldShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error in fetchProgress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress({ ...progress, ...updates } as OnboardingProgress);
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const completeStep = async (step: OnboardingStep) => {
    if (!progress) return;

    const completedSteps = [...new Set([...progress.completed_steps, step])];
    await updateProgress({ 
      completed_steps: completedSteps,
      current_step: step,
    });
  };

  const setCurrentStep = async (step: OnboardingStep) => {
    await updateProgress({ current_step: step });
  };

  const completeOnboarding = async () => {
    await updateProgress({ 
      onboarding_completed: true,
      current_step: 'completed',
    });
    setShouldShowOnboarding(false);
  };

  const incrementSessionCount = async () => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .update({ 
          session_count: (progress.session_count || 0) + 1,
          last_session_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh progress
      await fetchProgress();
    } catch (error) {
      console.error('Error incrementing session count:', error);
    }
  };

  return {
    progress,
    loading,
    shouldShowOnboarding,
    updateProgress,
    completeStep,
    setCurrentStep,
    completeOnboarding,
    incrementSessionCount,
    setShouldShowOnboarding,
  };
};
