-- Create study goals table
CREATE TABLE IF NOT EXISTS public.study_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('study_hours', 'topic_mastery', 'exam_prep', 'quiz_score')),
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  subject TEXT,
  topic TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study goals
CREATE POLICY "Users can manage their own goals"
  ON public.study_goals
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_study_goals_user_id ON public.study_goals(user_id);
CREATE INDEX idx_study_goals_status ON public.study_goals(status);
CREATE INDEX idx_study_goals_end_date ON public.study_goals(end_date);

-- Add updated_at trigger
CREATE TRIGGER update_study_goals_updated_at
  BEFORE UPDATE ON public.study_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (true);

-- Create index
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);

-- Create learning insights table
CREATE TABLE IF NOT EXISTS public.learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('time_of_day', 'retention_pattern', 'subject_comparison', 'study_duration', 'performance_trend')),
  insight_text TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_points JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.learning_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
  ON public.learning_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.learning_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_learning_insights_user_id ON public.learning_insights(user_id);
CREATE INDEX idx_learning_insights_generated_at ON public.learning_insights(generated_at DESC);

-- Create quiz attempts table for tracking performance
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID,
  subject TEXT NOT NULL,
  topic TEXT,
  questions_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score NUMERIC NOT NULL,
  duration_seconds INTEGER,
  exam_type TEXT,
  difficulty TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own quiz attempts"
  ON public.quiz_attempts
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);
CREATE INDEX idx_quiz_attempts_subject ON public.quiz_attempts(subject);

-- Function to calculate concept mastery
CREATE OR REPLACE FUNCTION public.calculate_concept_mastery(
  p_user_id UUID,
  p_subject TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mastery_score NUMERIC;
BEGIN
  -- Calculate mastery based on multiple factors
  WITH recent_performance AS (
    SELECT 
      AVG(score) as avg_score,
      COUNT(*) as attempt_count
    FROM quiz_attempts
    WHERE user_id = p_user_id 
      AND subject = p_subject
      AND completed_at > NOW() - INTERVAL '30 days'
  ),
  spaced_rep_mastery AS (
    SELECT AVG(mastery_level) as avg_mastery
    FROM spaced_repetition_cards
    WHERE user_id = p_user_id 
      AND subject = p_subject
  ),
  study_time AS (
    SELECT COUNT(*) as session_count
    FROM learning_sessions
    WHERE user_id = p_user_id 
      AND subject = p_subject
      AND started_at > NOW() - INTERVAL '30 days'
  )
  SELECT 
    COALESCE(
      (COALESCE(rp.avg_score, 0) * 0.4) +
      (COALESCE(srm.avg_mastery, 0) * 0.4) +
      (LEAST(st.session_count * 2, 20) * 0.2),
      0
    )
  INTO mastery_score
  FROM recent_performance rp
  CROSS JOIN spaced_rep_mastery srm
  CROSS JOIN study_time st;
  
  RETURN ROUND(mastery_score, 2);
END;
$$;

-- Function to calculate exam readiness
CREATE OR REPLACE FUNCTION public.calculate_exam_readiness(
  p_user_id UUID,
  p_subject TEXT,
  p_exam_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  readiness_data JSONB;
  mastery NUMERIC;
  practice_count INTEGER;
  study_hours NUMERIC;
  days_remaining INTEGER;
  readiness_score NUMERIC;
BEGIN
  -- Calculate days remaining
  days_remaining := p_exam_date - CURRENT_DATE;
  
  -- Get mastery score
  SELECT calculate_concept_mastery(p_user_id, p_subject) INTO mastery;
  
  -- Get practice count
  SELECT COUNT(*) INTO practice_count
  FROM quiz_attempts
  WHERE user_id = p_user_id 
    AND subject = p_subject
    AND completed_at > NOW() - INTERVAL '30 days';
  
  -- Get study hours
  SELECT COALESCE(SUM(duration_minutes) / 60.0, 0) INTO study_hours
  FROM learning_sessions
  WHERE user_id = p_user_id 
    AND subject = p_subject
    AND started_at > NOW() - INTERVAL '30 days';
  
  -- Calculate readiness score (0-100)
  readiness_score := LEAST(
    (mastery * 0.5) +
    (LEAST(practice_count * 2, 30) * 0.3) +
    (LEAST(study_hours * 2, 20) * 0.2),
    100
  );
  
  -- Build result
  readiness_data := jsonb_build_object(
    'readiness_score', ROUND(readiness_score, 1),
    'mastery_score', mastery,
    'practice_count', practice_count,
    'study_hours', ROUND(study_hours, 1),
    'days_remaining', days_remaining,
    'status', CASE
      WHEN readiness_score >= 80 THEN 'ready'
      WHEN readiness_score >= 60 THEN 'almost_ready'
      WHEN readiness_score >= 40 THEN 'needs_work'
      ELSE 'not_ready'
    END,
    'recommendation', CASE
      WHEN days_remaining < 7 AND readiness_score < 60 THEN 'Focus on practice tests and weak areas'
      WHEN readiness_score < 40 THEN 'Increase study time and practice frequency'
      WHEN readiness_score >= 80 THEN 'Maintain current pace with regular reviews'
      ELSE 'Continue steady progress with focused practice'
    END
  );
  
  RETURN readiness_data;
END;
$$;