import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingDown,
  Users,
  Zap,
  Database,
  Activity,
  AlertCircle
} from 'lucide-react';
import { getCacheStats } from '@/lib/rate-limiter';

interface UserCostData {
  user_id: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  profile?: {
    full_name?: string;
    user_type?: string;
  };
}

interface CostMetrics {
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  averageCostPerRequest: number;
  topUsers: UserCostData[];
  cacheStats: {
    totalCached: number;
    totalHits: number;
    cacheHitRate: number;
    totalTokensSaved: number;
  };
}

export function AICostsDashboard() {
  const [metrics, setMetrics] = useState<CostMetrics>({
    totalCost: 0,
    totalRequests: 0,
    totalTokens: 0,
    averageCostPerRequest: 0,
    topUsers: [],
    cacheStats: {
      totalCached: 0,
      totalHits: 0,
      cacheHitRate: 0,
      totalTokensSaved: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      let dateFilter = '';
      if (timeRange === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateFilter = sevenDaysAgo.toISOString().split('T')[0];
      } else if (timeRange === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
      }

      // Get usage data
      let query = supabase
        .from('user_ai_usage' as any)
        .select('user_id, requests_count, tokens_used, cost_usd');

      if (dateFilter) {
        query = query.gte('usage_date', dateFilter);
      }

      const { data: usageData, error: usageError } = await query;

      if (usageError) throw usageError;

      // Aggregate data
      const userMap = new Map<string, UserCostData>();
      let totalCost = 0;
      let totalRequests = 0;
      let totalTokens = 0;

      usageData?.forEach((entry: any) => {
        const existing = userMap.get(entry.user_id) || {
          user_id: entry.user_id,
          total_requests: 0,
          total_tokens: 0,
          total_cost: 0
        };

        existing.total_requests += entry.requests_count;
        existing.total_tokens += entry.tokens_used;
        existing.total_cost += parseFloat(String(entry.cost_usd || 0));

        userMap.set(entry.user_id, existing);

        totalCost += parseFloat(String(entry.cost_usd || 0));
        totalRequests += entry.requests_count;
        totalTokens += entry.tokens_used;
      });

      // Get profile data for top users
      const topUsers = Array.from(userMap.values())
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 10);

      for (const user of topUsers) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name, user_type')
          .eq('user_id', user.user_id)
          .single();

        if (profile) {
          user.profile = profile as any;
        }
      }

      // Get cache statistics
      const cacheStats = await getCacheStats();

      // Calculate cost savings from cache
      const costPer1kTokens = 0.001;
      const costSavings = (cacheStats.totalTokensSaved / 1000) * costPer1kTokens;

      setMetrics({
        totalCost,
        totalRequests,
        totalTokens,
        averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
        topUsers,
        cacheStats: {
          ...cacheStats,
          totalTokensSaved: cacheStats.totalTokensSaved
        }
      });
    } catch (error) {
      console.error('Error loading cost metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const costPer1kTokens = 0.001; // google/gemini-2.5-flash
  const costSavings = (metrics.cacheStats.totalTokensSaved / 1000) * costPer1kTokens;
  const savingsPercentage = metrics.totalCost > 0 
    ? (costSavings / (metrics.totalCost + costSavings)) * 100 
    : 0;

  if (loading) {
    return <div className="text-center py-12">Loading cost analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Costs Dashboard</h2>
          <p className="text-muted-foreground">Monitor AI usage and optimize costs</p>
        </div>

        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${metrics.averageCostPerRequest.toFixed(4)} per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${costSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsPercentage.toFixed(1)}% saved via caching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalTokens.toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheStats.cacheHitRate.toFixed(1)}%
            </div>
            <Progress value={metrics.cacheStats.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Performance
          </CardTitle>
          <CardDescription>Semantic similarity caching effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cached Responses</p>
              <p className="text-2xl font-bold">{metrics.cacheStats.totalCached}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cache Hits</p>
              <p className="text-2xl font-bold">{metrics.cacheStats.totalHits}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tokens Saved</p>
              <p className="text-2xl font-bold">
                {(metrics.cacheStats.totalTokensSaved / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Money Saved</p>
              <p className="text-2xl font-bold text-green-500">${costSavings.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Semantic Caching Active</h4>
                <p className="text-sm text-muted-foreground">
                  Questions with 85%+ similarity are served from cache, saving API costs and
                  improving response time. Average hit rate: {metrics.cacheStats.cacheHitRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Users by Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Users by Cost
          </CardTitle>
          <CardDescription>Users with highest AI usage costs</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.topUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No usage data available</p>
          ) : (
            <div className="space-y-4">
              {metrics.topUsers.map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.profile?.full_name || `User ${user.user_id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.total_requests} requests · {(user.total_tokens / 1000).toFixed(1)}k tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${user.total_cost.toFixed(2)}</p>
                    {user.profile?.user_type && (
                      <Badge variant={user.profile.user_type === 'premium' ? 'default' : 'secondary'}>
                        {user.profile.user_type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Cost Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span>✅</span>
              <p>
                <strong>Semantic caching enabled:</strong> Similar questions (85%+ match) are served
                from cache, saving {savingsPercentage.toFixed(1)}% of costs
              </p>
            </div>
            <div className="flex gap-2">
              <span>🎯</span>
              <p>
                <strong>Rate limiting active:</strong> Free users limited to 20 requests/day prevents
                abuse and controls costs
              </p>
            </div>
            <div className="flex gap-2">
              <span>⏰</span>
              <p>
                <strong>30-day cache TTL:</strong> Popular questions remain cached for a month,
                maximizing reuse
              </p>
            </div>
            <div className="flex gap-2">
              <span>💎</span>
              <p>
                <strong>Using google/gemini-2.5-flash:</strong> Cost-effective model at $0.001 per
                1k tokens (70% cheaper than GPT-4)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
