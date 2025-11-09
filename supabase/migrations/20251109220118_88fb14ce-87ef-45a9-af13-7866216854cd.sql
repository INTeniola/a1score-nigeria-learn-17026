-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB in bytes
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add processing status columns to user_documents table
ALTER TABLE public.user_documents
  ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS chunks_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Create indexes for efficient document queries
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON public.user_documents(upload_status, user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_created ON public.user_documents(user_id, created_at DESC);

-- Function to get document processing statistics
CREATE OR REPLACE FUNCTION public.get_document_stats(p_user_id UUID)
RETURNS TABLE (
  total_documents INTEGER,
  processing INTEGER,
  completed INTEGER,
  failed INTEGER,
  total_chunks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_documents,
    COUNT(*) FILTER (WHERE upload_status = 'processing')::INTEGER as processing,
    COUNT(*) FILTER (WHERE upload_status = 'completed')::INTEGER as completed,
    COUNT(*) FILTER (WHERE upload_status = 'failed')::INTEGER as failed,
    COALESCE(SUM(chunks_count), 0)::INTEGER as total_chunks
  FROM public.user_documents
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_document_stats IS 'Returns document processing statistics for a user';
