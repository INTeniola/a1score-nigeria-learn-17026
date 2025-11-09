import { supabase } from '@/integrations/supabase/client';

/**
 * Normalize question text for consistent caching
 */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .replace(/\b(please|kindly|could you|can you|would you)\b/g, '') // Remove politeness words
    .trim();
}

/**
 * Generate simple text hash for exact matching
 */
export function generateQuestionHash(question: string): string {
  const normalized = normalizeQuestion(question);
  return Array.from(normalized)
    .reduce((hash, char) => {
      const charCode = char.charCodeAt(0);
      return ((hash << 5) - hash) + charCode;
    }, 0)
    .toString(36);
}

/**
 * Calculate cosine similarity between two text strings
 * Uses simple bag-of-words approach without embeddings
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => normalizeQuestion(text).split(' ');
  
  const words1 = normalize(text1);
  const words2 = normalize(text2);
  
  // Create word frequency vectors
  const allWords = new Set([...words1, ...words2]);
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  allWords.forEach(word => {
    vector1.push(words1.filter(w => w === word).length);
    vector2.push(words2.filter(w => w === word).length);
  });
  
  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Search cache for semantically similar questions
 */
export async function searchSemanticCache(
  question: string,
  similarityThreshold: number = 0.85,
  subject?: string
): Promise<{
  response: string;
  similarity: number;
  cacheId: string;
  tokensUsed: number;
} | null> {
  try {
    // First try exact match
    const questionHash = generateQuestionHash(question);
    
    const { data: exactMatch } = await supabase
      .from('ai_response_cache' as any)
      .select('*')
      .eq('query_hash', questionHash)
      .maybeSingle();

    if (exactMatch) {
      // Update hit count
      await supabase
        .from('ai_response_cache' as any)
        .update({
          hit_count: (exactMatch as any).hit_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', (exactMatch as any).id);

      return {
        response: (exactMatch as any).response_text,
        similarity: 1.0,
        cacheId: (exactMatch as any).id,
        tokensUsed: 0
      };
    }

    // Semantic similarity search
    const { data: candidates } = await supabase
      .from('ai_response_cache' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Check recent 100 entries

    if (!candidates || candidates.length === 0) return null;

    // Find best semantic match
    let bestMatch: any = null;
    let bestSimilarity = 0;

    for (const candidate of candidates) {
      const similarity = calculateTextSimilarity(question, (candidate as any).query_text);
      
      if (similarity > bestSimilarity && similarity >= similarityThreshold) {
        bestSimilarity = similarity;
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      // Update hit count
      await supabase
        .from('ai_response_cache' as any)
        .update({
          hit_count: bestMatch.hit_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', bestMatch.id);

      return {
        response: bestMatch.response_text,
        similarity: bestSimilarity,
        cacheId: bestMatch.id,
        tokensUsed: 0
      };
    }

    return null;
  } catch (error) {
    console.error('Semantic cache search error:', error);
    return null;
  }
}

/**
 * Store response in cache with metadata
 */
export async function cacheResponse(
  question: string,
  response: string,
  metadata: {
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    language?: string;
    model: string;
    tokensUsed: number;
  }
): Promise<void> {
  try {
    const questionHash = generateQuestionHash(question);
    const ttlDays = 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    await supabase
      .from('ai_response_cache' as any)
      .upsert({
        query_hash: questionHash,
        query_text: question,
        response_text: response,
        model: metadata.model,
        tokens_used: metadata.tokensUsed,
        hit_count: 1,
        metadata: {
          topic: metadata.topic,
          difficulty: metadata.difficulty,
          language: metadata.language || 'en',
          expires_at: expiresAt.toISOString()
        }
      }, {
        onConflict: 'query_hash',
        ignoreDuplicates: false
      });
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const { data } = await supabase
      .from('ai_response_cache' as any)
      .select('id, metadata')
      .not('metadata', 'is', null);

    if (!data) return 0;

    const now = new Date();
    const expiredIds = (data as any[])
      .filter(entry => {
        const expiresAt = entry.metadata?.expires_at;
        return expiresAt && new Date(expiresAt) < now;
      })
      .map(entry => entry.id);

    if (expiredIds.length > 0) {
      await supabase
        .from('ai_response_cache' as any)
        .delete()
        .in('id', expiredIds);
    }

    return expiredIds.length;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}
