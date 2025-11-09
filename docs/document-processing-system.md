# Document Processing System Documentation

## Overview

A comprehensive document processing pipeline that extracts text, generates embeddings, and enables semantic search across PDFs, DOCX files, and images.

## Features

### 1. File Upload
- **Supported formats**: PDF, DOCX, PNG, JPG
- **Max file size**: 50MB
- **Upload progress**: Real-time progress tracking with time estimates
- **Validation**: Client-side file type and size validation
- **Queue management**: Multiple concurrent uploads

### 2. Document Processing Pipeline

**Processing Steps:**
1. **Upload** → Supabase Storage (30% progress)
2. **Text Extraction** → PDF parsing/OCR (30-50%)
3. **Chunking** → 500 tokens per chunk with 50 token overlap (50-60%)
4. **Embedding Generation** → OpenAI text-embedding-3-small (60-80%)
5. **Storage** → Document chunks with vectors (80-100%)

**Processing Time Estimates:**
- PDF: ~5 seconds per MB
- Images (OCR): ~10 seconds per MB
- DOCX: ~3 seconds per MB

### 3. Semantic Search
- **Cosine similarity**: Finds relevant passages across all documents
- **Threshold**: 85% similarity for cache hits
- **Vector dimensions**: 1536 (OpenAI text-embedding-3-small)
- **Search limit**: Top 5 most relevant results

### 4. Cache Integration
- 30-day TTL for cached responses
- Semantic similarity matching
- Automatic hit count tracking
- Cost savings analytics

## Architecture

### Storage Bucket
```
documents/
  {user_id}/
    {timestamp}_{filename}.pdf
    {timestamp}_{filename}.docx
    {timestamp}_{filename}.png
```

**Security:**
- Private bucket (not publicly accessible)
- RLS policies per user folder
- 50MB file size limit
- MIME type restrictions

### Database Tables

#### user_documents
Metadata for uploaded documents.

**Key Columns:**
- `storage_path`: S3 path in documents bucket
- `upload_status`: processing | completed | failed
- `processing_progress`: 0-100 percentage
- `chunks_count`: Number of chunks created
- `retry_count`: Failed processing retry attempts
- `error_message`: Failure reason

#### document_chunks
Searchable text chunks with embeddings.

**Key Columns:**
- `document_id`: Foreign key to user_documents
- `chunk_index`: Sequential chunk number
- `content`: Extracted text (500 tokens)
- `embedding_vector`: vector(1536) for similarity search
- `chunk_summary`: Brief overview
- `concepts_covered`: Related topics/concepts

### Edge Functions

#### process-document
Main processing pipeline.

**Input:**
```typescript
{
  documentId: string;
  fileName: string;
  storagePath: string;
  fileType: string;
}
```

**Process:**
1. Downloads file from storage
2. Extracts text (PDF/OCR/DOCX)
3. Chunks text semantically
4. Generates embeddings
5. Stores chunks with vectors
6. Updates processing status

**Libraries Used:**
- `pdf-parse@1.1.1`: PDF text extraction
- `mammoth@1.6.0`: DOCX text extraction
- `OCR.space API`: Image OCR
- `OpenAI API`: Embedding generation

**Error Handling:**
- Retries up to 3 times
- Detailed error logging
- Status updates in database
- User notifications

#### generate-embedding
Standalone embedding generation.

**Input:**
```typescript
{
  text: string;
  dimensions?: number; // default 1536
}
```

**Output:**
```typescript
{
  embedding: number[];
  dimensions: number;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
```

**Use Cases:**
- Query embedding for semantic search
- Real-time embedding during AI chat
- Concept similarity calculations

### React Components

#### DocumentUpload
Drag-and-drop upload interface.

**Features:**
- Drag & drop support
- Multiple file selection
- Real-time progress tracking
- Upload queue visualization
- Status indicators (uploading, processing, complete, error)
- Time estimates per file type

#### DocumentLibrary
Document management interface.

**Features:**
- Grid/list view modes
- Filter by status (all, completed, processing, failed)
- Search by filename
- Download documents
- Delete documents
- Reprocess failed documents
- Real-time status updates (Supabase Realtime)
- Statistics dashboard

#### SemanticDocumentSearch
AI-powered search interface.

**Features:**
- Natural language queries
- Similarity scoring
- Concept highlighting
- Document source attribution
- Context extraction for AI tutoring

#### DocumentManager
Tabbed interface combining upload and library.

**Tabs:**
1. Upload - DocumentUpload component
2. Library - DocumentLibrary component

## Usage Examples

### Upload Document
```typescript
import { DocumentUpload } from '@/components/student/DocumentUpload';

function MyComponent() {
  return <DocumentUpload />;
}
```

### Search Documents
```typescript
import { useDocumentSearch } from '@/hooks/useDocumentSearch';

function SearchComponent() {
  const { results, searchDocuments } = useDocumentSearch();
  
  const handleSearch = async () => {
    await searchDocuments("What is photosynthesis?", 5);
  };
  
  return (
    <div>
      {results.map(result => (
        <div key={result.document_id}>
          <p>{result.content}</p>
          <span>Similarity: {result.similarity}</span>
        </div>
      ))}
    </div>
  );
}
```

### Get Context for AI Tutor
```typescript
import { useDocumentSearch } from '@/hooks/useDocumentSearch';

const { getRelevantContext } = useDocumentSearch();

// Before calling AI tutor
const context = await getRelevantContext(userQuestion, 3);
const aiResponse = await callAITutor({
  message: userQuestion,
  conversationContext: { documentContext: context }
});
```

## Chunking Strategy

### Algorithm
```typescript
- Tokens per chunk: 500 (~2000 characters)
- Overlap: 50 tokens (~200 characters)
- Boundary detection: End at sentence/paragraph
- Minimum chunk size: 10 characters
```

### Why Overlap?
- Preserves context across chunk boundaries
- Improves semantic search accuracy
- Prevents concept splitting

### Example
```
Text: "Machine learning is... [2500 chars]"

Chunk 1: chars 0-2000    (tokens 0-500)
Chunk 2: chars 1800-3800 (tokens 450-950) ← 200 char overlap
Chunk 3: chars 3600-5600 (tokens 900-1400)
```

## Error Handling

### Upload Errors
```typescript
Validation errors:
- File too large (>50MB)
- Invalid file type
- Authentication required

Storage errors:
- Network failure
- Storage quota exceeded
- Permission denied
```

### Processing Errors
```typescript
Extraction errors:
- Corrupted PDF
- OCR failed (unreadable image)
- DOCX format error

API errors:
- OpenAI rate limit exceeded
- OCR.space API limit
- Embedding generation timeout

Database errors:
- Chunk insertion failed
- Vector index issues
```

### Retry Logic
- Automatic retry for transient errors
- Max 3 retry attempts
- Exponential backoff (1s, 2s, 4s)
- Manual reprocess option for users

## Performance Optimization

### Batching
```typescript
// Generate embeddings in batches
const batchSize = 20;
for (let i = 0; i < chunks.length; i += batchSize) {
  const batch = chunks.slice(i, i + batchSize);
  const embeddings = await generateEmbeddings(batch);
  // Process batch...
}
```

### Caching
- Cache document processing results
- Reuse embeddings for similar chunks
- Store OCR results to avoid reprocessing

### Vector Search Optimization
```sql
-- IVFFlat index for fast similarity search
CREATE INDEX idx_document_chunks_embedding 
ON document_chunks 
USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);
```

**Performance:**
- Search time: <100ms for 1000s of chunks
- Index build time: ~1 minute per 1000 vectors
- Memory usage: ~4KB per vector

## Cost Analysis

### API Costs (per document)

**OCR (OCR.space)**
- Free tier: 25,000 requests/month
- Cost: $0 for most users
- Rate limit: 10 requests/minute

**Embeddings (OpenAI)**
- Model: text-embedding-3-small
- Cost: $0.00002 per 1K tokens
- Average document (10 pages): ~5000 tokens = $0.0001
- 10,000 documents/month: ~$1.00

**Storage (Supabase)**
- First 1GB: Free
- Additional: $0.021/GB/month
- 1000 PDFs (1MB each): ~$0.021/month

**Total Monthly Cost (1000 documents):**
- OCR: $0
- Embeddings: $1.00
- Storage: $0.02
- **Total: ~$1.02**

### Cost Savings via Caching
- Cache hit rate: 40-60% for common questions
- Embedding cost savings: $0.40-$0.60 per 1000 queries
- Response time improvement: 10x faster

## Security

### Data Protection
- Documents stored in private bucket
- RLS policies enforce user isolation
- Embeddings accessible only by owner
- No cross-user data leakage

### Input Validation
```typescript
// File validation
- Max size: 50MB
- Allowed types: PDF, DOCX, PNG, JPG
- Filename sanitization
- Content scanning (future)

// Query validation
- Max length: 1000 characters
- Rate limiting: 20 searches/day (free)
- SQL injection prevention
```

## Monitoring

### Key Metrics
```typescript
- Documents processed per hour
- Average processing time
- Error rate by file type
- Cache hit rate
- Storage usage
- API cost per user
```

### Alerts
```typescript
- Processing failure rate >10%
- API error rate >5%
- Storage approaching limit
- Unusual cost spikes
```

## Future Enhancements

1. **Multi-format Support**
   - Excel/CSV data extraction
   - PowerPoint slide text
   - Audio transcription
   - Video caption extraction

2. **Advanced NLP**
   - Named entity recognition
   - Topic modeling
   - Summarization
   - Key phrase extraction

3. **Collaborative Features**
   - Shared document libraries
   - Annotations and highlights
   - Group study materials
   - Teacher-assigned readings

4. **Enhanced Search**
   - Filters (date, subject, difficulty)
   - Boolean operators (AND, OR, NOT)
   - Phrase matching
   - Faceted search

5. **Performance**
   - Parallel chunk processing
   - Background job queue
   - Incremental indexing
   - CDN for document delivery

## Troubleshooting

### Issue: Processing stuck at 0%
**Solution:**
1. Check edge function logs
2. Verify API keys are configured
3. Try reprocessing document
4. Check file isn't corrupted

### Issue: OCR returns empty text
**Solution:**
1. Verify image quality (min 150 DPI)
2. Check image contains readable text
3. Try different image format
4. Manually verify OCR.space API key

### Issue: Vector search returns no results
**Solution:**
1. Ensure embeddings were generated
2. Check pgvector extension enabled
3. Verify IVFFlat index created
4. Try broader search query

### Issue: High API costs
**Solution:**
1. Enable aggressive caching
2. Reduce embedding dimensions (768 instead of 1536)
3. Use smaller chunks (250 tokens)
4. Implement request throttling
5. Batch process during off-peak hours

## API Reference

### useDocuments Hook
```typescript
const {
  documents,      // List of user documents
  stats,          // Processing statistics
  loading,        // Loading state
  deleteDocument, // Delete document
  reprocessDocument, // Retry processing
  downloadDocument,  // Download file
  searchDocuments,   // Filter by name
  refreshDocuments,  // Reload list
  refreshStats      // Reload stats
} = useDocuments();
```

### useDocumentSearch Hook
```typescript
const {
  results,           // Search results
  loading,           // Search in progress
  searchDocuments,   // Perform search
  getRelevantContext // Get AI tutor context
} = useDocumentSearch();
```

## Support

For issues:
1. Check edge function logs in backend
2. Verify API keys are configured
3. Review document processing status
4. Contact support with document ID
