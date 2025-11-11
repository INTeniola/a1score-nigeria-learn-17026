-- Fix search path for search_document_chunks function
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
SECURITY DEFINER
SET search_path = public
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