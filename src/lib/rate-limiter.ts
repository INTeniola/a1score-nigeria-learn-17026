import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  tier: 'free' | 'premium';
  dailyLimit: number;
  requestsUsed: number;
  resetTime: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: string;
  tier: 'free' | 'premium';
}

/**
 * Check if user is within rate limits
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    // Check user tier (default to free)
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    const tier: 'free' | 'premium' = (profile as any)?.user_type === 'premium' ? 'premium' : 'free';
    const dailyLimit = tier === 'free' ? 20 : 1000; // 20 for free, 1000 for premium

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usage, error } = await supabase
      .from('user_ai_usage' as any)
      .select('requests_count')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate limit check error:', error);
      return {
        allowed: true,
        remaining: dailyLimit,
        resetTime: getNextResetTime(),
        tier
      };
    }

    const requestsUsed = (usage as any)?.requests_count || 0;
    const remaining = Math.max(0, dailyLimit - requestsUsed);

    return {
      allowed: requestsUsed < dailyLimit,
      remaining,
      resetTime: getNextResetTime(),
      tier
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      allowed: true,
      remaining: 20,
      resetTime: getNextResetTime(),
      tier: 'free'
    };
  }
}

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(userId: string, tokensUsed: number = 0): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate cost based on Lovable AI pricing
    const costPer1kTokens = 0.001; // google/gemini-2.5-flash
    const cost = (tokensUsed / 1000) * costPer1kTokens;

    const { error } = await supabase
      .from('user_ai_usage' as any)
      .upsert({
        user_id: userId,
        usage_date: today,
        requests_count: 1,
        tokens_used: tokensUsed,
        cost_usd: cost
      }, {
        onConflict: 'user_id,usage_date',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Rate limit increment error:', error);
    }
  } catch (error) {
    console.error('Rate limit tracking error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalCached: number;
  totalHits: number;
  cacheHitRate: number;
  totalTokensSaved: number;
}> {
  try {
    const { data: cacheData } = await supabase
      .from('ai_response_cache' as any)
      .select('hit_count, tokens_used');

    if (!cacheData) {
      return {
        totalCached: 0,
        totalHits: 0,
        cacheHitRate: 0,
        totalTokensSaved: 0
      };
    }

    const totalCached = cacheData.length;
    const totalHits = (cacheData as any[]).reduce((sum, entry) => sum + (entry.hit_count - 1), 0); // Subtract initial cache
    const totalTokensSaved = (cacheData as any[]).reduce(
      (sum, entry) => sum + (entry.tokens_used * (entry.hit_count - 1)),
      0
    );

    // Get total AI requests
    const { data: usageData } = await supabase
      .from('user_ai_usage' as any)
      .select('requests_count');

    const totalRequests = (usageData as any[])?.reduce((sum, entry) => sum + entry.requests_count, 0) || 0;
    const cacheHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    return {
      totalCached,
      totalHits,
      cacheHitRate,
      totalTokensSaved
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      totalCached: 0,
      totalHits: 0,
      cacheHitRate: 0,
      totalTokensSaved: 0
    };
  }
}

/**
 * Get next rate limit reset time (midnight UTC)
 */
function getNextResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Get user's rate limit status display
 */
export function getRateLimitMessage(result: RateLimitResult): string {
  if (result.tier === 'premium') {
    return `Premium tier: ${result.remaining} requests remaining today`;
  }
  
  if (result.remaining === 0) {
    const resetTime = new Date(result.resetTime);
    const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60));
    return `Daily limit reached. Resets in ${hoursUntilReset}h. Upgrade to Premium for unlimited access!`;
  }
  
  return `Free tier: ${result.remaining}/20 requests remaining today`;
}
