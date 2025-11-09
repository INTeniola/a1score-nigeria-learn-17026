# RAG (Retrieval Augmented Generation) System

## Overview

The RAG system enhances the AI Tutor by allowing it to answer questions based on the user's uploaded documents. It combines vector search with AI generation to provide accurate, context-aware responses grounded in the student's learning materials.

## Architecture

### 1. Document Processing Pipeline

1. **Upload**: Students upload PDFs, DOCX, or images
2. **Text Extraction**: 
   - PDFs: `pdf-parse` library extracts text
   - DOCX: `mammoth` library converts to plain text
   - Images: OCR.space API performs OCR
3. **Chunking**: Text split into 500-token chunks with 50-token overlap
4. **Embedding Generation**: OpenAI `text-embedding-3-small` generates 1536-dimensional vectors
5. **Storage**: Chunks stored in `document_chunks` table with embeddings in `pgvector` format

### 2. Retrieval Process

When a user asks a question with "Search My Documents" enabled:

1. **Query Embedding**: Convert user's question to embedding using same model
2. **Vector Search**: Use pgvector's cosine similarity to find top 5 most relevant chunks
3. **Metadata Enrichment**: Fetch document names and similarity scores
4. **Context Assembly**: Format chunks with source information

### 3. AI Generation

The retrieved context is injected into the AI prompt:

```
System Prompt: You are a tutor. Answer using ONLY information from the provided context. 
If context doesn't contain the answer, say so clearly.

--- CONTEXT FROM YOUR DOCUMENTS ---
[Source 1: Biology Textbook - 92% relevant]
<chunk content>

[Source 2: Chemistry Notes - 87% relevant]
<chunk content>
---

QUESTION: <user question>
```

### 4. Response Display

- AI response is shown with source citations
- Sources displayed below with:
  - Document name
  - Confidence indicator (similarity %)
  - Preview of relevant content
  - Expandable view for all sources

## Database Schema

### document_chunks Table

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES user_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- pgvector extension
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_chunks_embedding 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops);
```

### Vector Search Function

```sql
CREATE OR REPLACE FUNCTION search_document_chunks(
  p_user_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  document_id UUID,
  chunk_index INTEGER,
  content TEXT,
  similarity FLOAT,
  concepts_covered TEXT[],
  chunk_summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.document_id,
    dc.chunk_index,
    dc.content,
    1 - (dc.embedding <=> p_query_embedding) AS similarity,
    (dc.metadata->>'concepts_covered')::TEXT[] AS concepts_covered,
    dc.metadata->>'chunk_summary' AS chunk_summary
  FROM document_chunks dc
  INNER JOIN user_documents ud ON dc.document_id = ud.id
  WHERE ud.user_id = p_user_id
    AND ud.upload_status = 'completed'
    AND 1 - (dc.embedding <=> p_query_embedding) > 0.7  -- Similarity threshold
  ORDER BY dc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

## Components

### Frontend Components

- **AITutorChat**: Main chat interface with document search toggle
- **ChatMessage**: Displays messages with optional source citations
- **DocumentSources**: Expandable source viewer with confidence indicators
- **DocumentManager**: Upload and manage documents

### Backend Functions

- **ai-tutor-chat**: Main edge function handling RAG flow
- **process-document**: Processes uploaded documents
- **generate-embedding**: Generates OpenAI embeddings

## Usage

### Student Workflow

1. Upload documents via Document Manager
2. Wait for processing to complete
3. In AI Tutor, enable "Search My Documents" toggle
4. Ask questions related to uploaded materials
5. View AI response with source citations
6. Expand sources to see relevant excerpts

### Toggle Modes

**Search My Documents (RAG Mode)**
- AI answers from uploaded documents only
- Shows sources and confidence
- Best for: Study materials, textbooks, lecture notes

**General Knowledge (Standard Mode)**
- AI uses general training data
- Broader knowledge but not personalized
- Best for: General concepts, exam preparation, explanations

## Performance Optimizations

### 1. Vector Index

Using IVFFlat index for fast approximate nearest neighbor search:
- Training on 100k+ vectors
- Lists parameter: sqrt(total_vectors)
- Probes parameter: 10 for query time

### 2. Similarity Threshold

- Minimum similarity: 0.7 (70%)
- Ensures relevant results only
- Reduces noise in context

### 3. Context Window Management

- Top 5 chunks (configurable)
- ~2500 tokens of context
- Leaves room for conversation history and AI response

### 4. Caching

- Embeddings cached in database
- Reuse for multiple queries
- No regeneration needed

## Error Handling

### No Relevant Documents

When no documents match (similarity < 0.7):

```
System: NO RELEVANT DOCUMENTS FOUND
AI Response: "I couldn't find information about that in your uploaded documents. 
Would you like me to explain using general knowledge instead?"
```

### Document Processing Failures

- Retry logic (max 3 attempts)
- Graceful degradation to general mode
- Clear error messages to user

### Rate Limiting

- 20 queries/day (free tier)
- Embeddings API rate limits handled
- Queue system for high volume

## Cost Optimization

### Embedding Costs

- Model: `text-embedding-3-small`
- Cost: $0.00002 per 1k tokens
- Average query: 50 tokens = $0.000001
- Average document chunk: 500 tokens = $0.00001

### Caching Strategy

- Semantic cache for similar queries (>85% similarity)
- 40-60% cost reduction
- 30-day TTL on cached responses

## Future Enhancements

1. **Multi-document reasoning**: Answer questions spanning multiple documents
2. **Citation generation**: Automatic in-text citations in AI responses
3. **Visual search**: Search by uploaded images/diagrams
4. **Concept mapping**: Link related concepts across documents
5. **Question generation**: Auto-generate practice questions from documents
6. **Summarization**: Auto-summarize long documents
7. **Translation**: Multi-language document support

## Monitoring

Track these metrics:

- Documents processed: Total count
- Average processing time: Per document
- Search latency: p50, p95, p99
- Cache hit rate: Embeddings and responses
- Cost per query: OpenAI API costs
- User satisfaction: Based on source relevance feedback

## Security

- RLS policies: Users can only search their own documents
- Document isolation: Vector search scoped to user_id
- Embedding security: Not exposed to frontend
- Content filtering: Scan for inappropriate content

## API Reference

### Edge Function: ai-tutor-chat

**Request:**
```typescript
{
  message: string;
  tutorId: string;
  subject: string;
  useDocuments: boolean;  // Enable RAG
  conversationContext?: object;
}
```

**Response:**
```typescript
{
  response: string;
  conversationId: string;
  tokensUsed: number;
  model: string;
  sources?: Array<{
    documentName: string;
    similarity: number;
    chunkIndex: number;
    content: string;
  }>;
  usedDocuments?: boolean;
}
```

## Troubleshooting

### Low Similarity Scores

- Check document quality (OCR errors, formatting)
- Verify embedding model consistency
- Adjust similarity threshold
- Review chunking strategy

### Slow Search Performance

- Check vector index health
- Monitor database CPU/memory
- Optimize query complexity
- Consider read replicas

### Context Window Overflow

- Reduce chunk size
- Decrease number of retrieved chunks
- Implement dynamic context sizing
