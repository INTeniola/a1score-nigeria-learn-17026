-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] DEFAULT '{}',
  session_count INTEGER DEFAULT 0,
  learning_subjects TEXT[],
  exam_date DATE,
  learning_style TEXT,
  explanation_preference TEXT,
  has_uploaded_document BOOLEAN DEFAULT false,
  has_asked_question BOOLEAN DEFAULT false,
  notification_preferences_set BOOLEAN DEFAULT false,
  goals_set BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  last_session_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own onboarding progress"
  ON public.onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
  ON public.onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to increment session count
CREATE OR REPLACE FUNCTION public.increment_session_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.onboarding_progress
  SET 
    session_count = session_count + 1,
    last_session_at = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles table to remove required fields for simplified signup
ALTER TABLE public.profiles 
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN user_type DROP NOT NULL;

-- Add updated_at trigger for onboarding_progress
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();