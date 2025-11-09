import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OCR_SPACE_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ProcessDocumentRequest {
  documentId: string;
  fileName: string;
  storagePath: string;
  fileType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, fileName, storagePath, fileType }: ProcessDocumentRequest = await req.json();
    
    console.log(`Starting document processing: ${documentId}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update status to processing
    await supabase
      .from('user_documents')
      .update({ upload_status: 'processing', processing_progress: 10 })
      .eq('id', documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath);

    if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);

    console.log(`File downloaded: ${fileName}, type: ${fileType}`);

    // Update progress
    await supabase
      .from('user_documents')
      .update({ processing_progress: 30 })
      .eq('id', documentId);

    // Extract text based on file type
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      extractedText = await extractPDFText(fileData);
    } else if (fileType.startsWith('image/')) {
      extractedText = await extractImageText(fileData, OCR_SPACE_API_KEY);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX, we'll use a simple text extraction
      extractedText = await extractDOCXText(fileData);
    }

    console.log(`Text extracted: ${extractedText.length} characters`);

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('No text could be extracted from document');
    }

    // Update progress
    await supabase
      .from('user_documents')
      .update({ processing_progress: 50 })
      .eq('id', documentId);

    // Chunk text into semantic units (500 tokens with 50 token overlap)
    const chunks = chunkText(extractedText, 500, 50);
    console.log(`Created ${chunks.length} chunks`);

    // Update progress
    await supabase
      .from('user_documents')
      .update({ processing_progress: 60 })
      .eq('id', documentId);

    // Generate embeddings for each chunk
    const embeddings = await generateEmbeddings(chunks, OPENAI_API_KEY);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Update progress
    await supabase
      .from('user_documents')
      .update({ processing_progress: 80 })
      .eq('id', documentId);

    // Store chunks with embeddings in database
    const chunkRecords = chunks.map((chunk, index) => ({
      document_id: documentId,
      chunk_index: index,
      content: chunk,
      embedding_vector: embeddings[index],
      chunk_summary: chunk.substring(0, 200) + '...',
      metadata: {
        total_chunks: chunks.length,
        chunk_length: chunk.length
      }
    }));

    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords);

    if (insertError) throw new Error(`Chunk insertion failed: ${insertError.message}`);

    // Update document status to completed
    await supabase
      .from('user_documents')
      .update({
        upload_status: 'completed',
        processing_progress: 100,
        chunks_count: chunks.length,
        processing_metadata: {
          chunks: chunks.length,
          characters: extractedText.length,
          completed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    console.log(`Document processing completed: ${documentId}`);

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksCreated: chunks.length,
        message: 'Document processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to update document status to failed
    try {
      const { documentId } = await req.json();
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      await supabase
        .from('user_documents')
        .update({
          upload_status: 'failed',
          error_message: errorMessage,
          retry_count: supabase.from('user_documents').select('retry_count').eq('id', documentId).single().then(d => (d.data?.retry_count || 0) + 1)
        })
        .eq('id', documentId);
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Extract text from PDF using pdf-parse
 */
async function extractPDFText(fileData: Blob): Promise<string> {
  try {
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use pdf-parse from esm.sh
    const pdfParse = (await import('https://esm.sh/pdf-parse@1.1.1')).default;
    const data = await pdfParse(uint8Array);
    
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Extract text from image using OCR.space API
 */
async function extractImageText(fileData: Blob, apiKey: string | undefined): Promise<string> {
  if (!apiKey) throw new Error('OCR_SPACE_API_KEY not configured');

  try {
    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
    }

    return result.ParsedResults?.[0]?.ParsedText || '';
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Extract text from DOCX (simplified)
 */
async function extractDOCXText(fileData: Blob): Promise<string> {
  try {
    // For DOCX, we'll convert to text using mammoth
    const mammoth = await import('https://esm.sh/mammoth@1.6.0');
    const arrayBuffer = await fileData.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Chunk text into semantic units
 * Approximate tokens: 1 token ≈ 4 characters
 */
function chunkText(text: string, tokensPerChunk: number, overlapTokens: number): string[] {
  const charsPerChunk = tokensPerChunk * 4;
  const overlapChars = overlapTokens * 4;
  const chunks: string[] = [];
  
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + charsPerChunk, text.length);
    let chunk = text.substring(startIndex, endIndex);
    
    // Try to end at sentence boundary
    if (endIndex < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const boundary = Math.max(lastPeriod, lastNewline);
      
      if (boundary > charsPerChunk * 0.7) {
        chunk = chunk.substring(0, boundary + 1);
      }
    }
    
    chunks.push(chunk.trim());
    startIndex = endIndex - overlapChars;
  }
  
  return chunks.filter(c => c.length > 0);
}

/**
 * Generate embeddings using OpenAI text-embedding-3-small
 */
async function generateEmbeddings(texts: string[], apiKey: string | undefined): Promise<number[][]> {
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
        dimensions: 1536
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}
