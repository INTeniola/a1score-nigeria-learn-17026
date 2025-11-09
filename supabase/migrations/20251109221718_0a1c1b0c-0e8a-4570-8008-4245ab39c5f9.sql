-- Add session settings and achievements to learning_sessions
ALTER TABLE learning_sessions 
ADD COLUMN IF NOT EXISTS session_settings jsonb DEFAULT '{"duration_minutes": 25, "focus_mode": false, "music_enabled": false}'::jsonb,
ADD COLUMN IF NOT EXISTS achievements_unlocked text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS distractions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_questions_asked integer DEFAULT 0;

-- Add analytics fields to spaced_repetition_cards
ALTER TABLE spaced_repetition_cards
ADD COLUMN IF NOT EXISTS mastery_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_document_id uuid REFERENCES user_documents(id) ON DELETE SET NULL;

-- Create index for efficient due card queries
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_next_review 
ON spaced_repetition_cards(user_id, next_review_date) 
WHERE next_review_date IS NOT NULL;

-- Create index for session analytics
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_date 
ON learning_sessions(user_id, started_at DESC);

COMMENT ON COLUMN learning_sessions.session_settings IS 'Settings for the study session (duration, focus mode, music)';
COMMENT ON COLUMN learning_sessions.achievements_unlocked IS 'Achievements earned during this session';
COMMENT ON COLUMN spaced_repetition_cards.mastery_level IS 'Overall mastery level (0-100) based on SM-2 performance';
COMMENT ON COLUMN spaced_repetition_cards.source_document_id IS 'Reference to document from which this card was generated';