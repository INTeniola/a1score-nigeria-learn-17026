import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * AI API error types
 */
export type AIErrorType = 'rate_limit' | 'payment_required' | 'auth_error' | 'network_error' | 'unknown' | 'daily_limit_exceeded';

/**
 * AI API error with type classification
 */
export interface AIError {
  type: AIErrorType;
  message: string;
  statusCode?: number;
  originalError?: any;
}

/**
 * AI API response wrapper
 */
export interface AIResponse<T = any> {
  data?: T;
  error?: AIError;
}

/**
 * Classify error type from response
 */
function classifyError(statusCode: number, message: string): AIErrorType {
  if (statusCode === 429) return 'rate_limit';
  if (statusCode === 402) return 'payment_required';
  if (statusCode === 401 || statusCode === 403) return 'auth_error';
  if (statusCode >= 500) return 'network_error';
  return 'unknown';
}

/**
 * Generate hash for cache key using Web Crypto API
 */
async function generateCacheKey(query: string, context?: any): Promise<string> {
  const content = JSON.stringify({ query, context });
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check and update rate limit
 */
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('user_ai_usage')
    .select('requests_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: 100 };
  }

  const currentCount = data?.requests_count || 0;
  const DAILY_LIMIT = 100;
  
  return {
    allowed: currentCount < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - currentCount)
  };
}

/**
 * Update usage tracking
 */
async function trackUsage(userId: string, tokensUsed: number, costUsd: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('user_ai_usage')
    .upsert({
      user_id: userId,
      usage_date: today,
      requests_count: 1,
      tokens_used: tokensUsed,
      cost_usd: costUsd
    }, {
      onConflict: 'user_id,usage_date',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('Usage tracking error:', error);
  }
}

/**
 * Try to get response from cache
 */
async function getCachedResponse(queryHash: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('ai_response_cache')
    .select('response_text, hit_count')
    .eq('query_hash', queryHash)
    .single();

  if (error || !data) return null;

  // Update hit count and last accessed
  await supabase
    .from('ai_response_cache')
    .update({
      hit_count: data.hit_count + 1,
      last_accessed_at: new Date().toISOString()
    })
    .eq('query_hash', queryHash);

  return data.response_text;
}

/**
 * Cache AI response
 */
async function cacheResponse(
  queryHash: string,
  queryText: string,
  responseText: string,
  model: string,
  tokensUsed: number
): Promise<void> {
  await supabase
    .from('ai_response_cache')
    .upsert({
      query_hash: queryHash,
      query_text: queryText,
      response_text: responseText,
      model,
      tokens_used: tokensUsed,
      hit_count: 1
    }, {
      onConflict: 'query_hash',
      ignoreDuplicates: true
    });
}

/**
 * Handle AI API errors with user-friendly messages
 */
export function handleAIError(error: AIError): void {
  switch (error.type) {
    case 'rate_limit':
      toast.error('Too many requests', {
        description: 'Please wait a moment before trying again. Our AI is getting lots of love right now! 💙',
      });
      break;
    
    case 'payment_required':
      toast.error('Service temporarily unavailable', {
        description: 'AI credits are being replenished. Please try again shortly or contact support.',
      });
      break;
    
    case 'daily_limit_exceeded':
      toast.error('Daily limit reached', {
        description: 'You\'ve reached your free tier limit of 100 requests today. Resets at midnight!',
      });
      break;
    
    case 'auth_error':
      toast.error('Authentication required', {
        description: 'Please sign in to use AI features.',
      });
      break;
    
    case 'network_error':
      toast.error('Connection error', {
        description: 'Unable to reach AI service. Please check your connection and try again.',
      });
      break;
    
    default:
      toast.error('Something went wrong', {
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
  }
}

/**
 * Call AI Tutor Chat edge function with caching and rate limiting
 */
export async function callAITutor(params: {
  message: string;
  tutorId: string;
  subject: string;
  conversationContext?: any;
}): Promise<AIResponse<{ response: string; conversationId: string; tokensUsed: number; cached?: boolean }>> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        error: {
          type: 'auth_error',
          message: 'User not authenticated'
        }
      };
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      return {
        error: {
          type: 'daily_limit_exceeded',
          message: `Daily limit of 100 requests exceeded. ${rateLimitCheck.remaining} remaining.`
        }
      };
    }

    // Check cache for common queries
    const cacheKey = await generateCacheKey(params.message, { tutorId: params.tutorId, subject: params.subject });
    const cachedResponse = await getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return {
        data: {
          response: cachedResponse,
          conversationId: crypto.randomUUID(),
          tokensUsed: 0,
          cached: true
        }
      };
    }

    const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
      body: params
    });

    if (error) {
      const statusCode = error.context?.status || 500;
      const aiError: AIError = {
        type: classifyError(statusCode, error.message),
        message: error.message,
        statusCode,
        originalError: error,
      };
      return { error: aiError };
    }

    // Track usage
    if (data.tokensUsed) {
      const costPer1kTokens = 0.001; // google/gemini-2.5-flash cost
      const cost = (data.tokensUsed / 1000) * costPer1kTokens;
      await trackUsage(user.id, data.tokensUsed, cost);
    }

    // Cache response for common patterns
    if (data.response) {
      await cacheResponse(
        cacheKey,
        params.message,
        data.response,
        'google/gemini-2.5-flash',
        data.tokensUsed || 0
      );
    }

    return { data: { ...data, cached: false } };
  } catch (error) {
    const aiError: AIError = {
      type: 'network_error',
      message: error instanceof Error ? error.message : 'Network error',
      originalError: error,
    };
    return { error: aiError };
  }
}

/**
 * Call Quiz Generator edge function
 */
export async function generateQuiz(params: {
  subject: string;
  topic: string;
  examType?: 'jamb' | 'waec' | 'neco' | 'general';
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}): Promise<AIResponse<{ questions: any[]; source: string; tokensUsed?: number }>> {
  try {
    const { data, error } = await supabase.functions.invoke('quiz-generator', {
      body: params
    });

    if (error) {
      const statusCode = error.context?.status || 500;
      const aiError: AIError = {
        type: classifyError(statusCode, error.message),
        message: error.message,
        statusCode,
        originalError: error,
      };
      return { error: aiError };
    }

    return { data };
  } catch (error) {
    const aiError: AIError = {
      type: 'network_error',
      message: error instanceof Error ? error.message : 'Network error',
      originalError: error,
    };
    return { error: aiError };
  }
}

/**
 * Call PDF Analysis edge function
 */
export async function analyzePDF(params: {
  fileName: string;
  filePath: string;
}): Promise<AIResponse<{
  id: string;
  fileName: string;
  breakdown: {
    summary: string;
    keyPoints: string[];
    concepts: string[];
    studyGuide: string[];
    questions: string[];
  };
  createdAt: string;
}>> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-pdf', {
      body: params
    });

    if (error) {
      const statusCode = error.context?.status || 500;
      const aiError: AIError = {
        type: classifyError(statusCode, error.message),
        message: error.message,
        statusCode,
        originalError: error,
      };
      return { error: aiError };
    }

    return { data };
  } catch (error) {
    const aiError: AIError = {
      type: 'network_error',
      message: error instanceof Error ? error.message : 'Network error',
      originalError: error,
    };
    return { error: aiError };
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<AIResponse<T>>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<AIResponse<T>> {
  let lastError: AIError | undefined;

  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    
    if (!result.error) {
      return result;
    }

    lastError = result.error;

    // Don't retry on auth errors or payment required
    if (result.error.type === 'auth_error' || result.error.type === 'payment_required') {
      return result;
    }

    // Don't retry on last attempt
    if (i === maxRetries - 1) {
      break;
    }

    // Exponential backoff
    const delay = initialDelay * Math.pow(2, i);
    console.log(`Retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return { error: lastError };
}
