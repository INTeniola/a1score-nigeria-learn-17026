-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to document_chunks for vector search
ALTER TABLE public.document_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to search document chunks using vector similarity
CREATE OR REPLACE FUNCTION public.search_document_chunks(
  p_user_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INTEGER,
  content TEXT,
  similarity FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    1 - (dc.embedding <=> p_query_embedding) as similarity
  FROM public.document_chunks dc
  INNER JOIN public.user_documents ud ON dc.document_id = ud.id
  WHERE ud.user_id = p_user_id
    AND dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_document_chunks TO authenticated;

-- Add RLS policies for document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document chunks"
ON public.document_chunks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_documents ud
    WHERE ud.id = document_chunks.document_id
    AND ud.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own document chunks"
ON public.document_chunks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_documents ud
    WHERE ud.id = document_chunks.document_id
    AND ud.user_id = auth.uid()
  )
);