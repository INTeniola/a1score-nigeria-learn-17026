import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface UsageStats {
  today: {
    requests: number;
    tokens: number;
    cost: number;
  };
  thisWeek: {
    requests: number;
    tokens: number;
    cost: number;
  };
  thisMonth: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

export function AIUsageDashboard() {
  const [stats, setStats] = useState<UsageStats>({
    today: { requests: 0, tokens: 0, cost: 0 },
    thisWeek: { requests: 0, tokens: 0, cost: 0 },
    thisMonth: { requests: 0, tokens: 0, cost: 0 }
  });
  const [loading, setLoading] = useState(true);

  const DAILY_LIMIT = 100;

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Today's usage
      const { data: todayData } = await supabase
        .from('user_ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .single();

      // This week's usage
      const { data: weekData } = await supabase
        .from('user_ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('usage_date', weekAgo);

      // This month's usage
      const { data: monthData } = await supabase
        .from('user_ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('usage_date', monthAgo);

      setStats({
        today: {
          requests: todayData?.requests_count || 0,
          tokens: todayData?.tokens_used || 0,
          cost: parseFloat(String(todayData?.cost_usd || 0))
        },
        thisWeek: {
          requests: weekData?.reduce((sum, d) => sum + d.requests_count, 0) || 0,
          tokens: weekData?.reduce((sum, d) => sum + d.tokens_used, 0) || 0,
          cost: weekData?.reduce((sum, d) => sum + parseFloat(String(d.cost_usd || 0)), 0) || 0
        },
        thisMonth: {
          requests: monthData?.reduce((sum, d) => sum + d.requests_count, 0) || 0,
          tokens: monthData?.reduce((sum, d) => sum + d.tokens_used, 0) || 0,
          cost: monthData?.reduce((sum, d) => sum + parseFloat(String(d.cost_usd || 0)), 0) || 0
        }
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
      toast.error('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = (stats.today.requests / DAILY_LIMIT) * 100;
  const remaining = DAILY_LIMIT - stats.today.requests;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Usage Dashboard</h2>
        <p className="text-muted-foreground">Track your AI assistant usage and limits</p>
      </div>

      {/* Daily Limit Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Usage
          </CardTitle>
          <CardDescription>
            Free tier: {DAILY_LIMIT} requests per day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {stats.today.requests} / {DAILY_LIMIT} requests
              </span>
              <Badge variant={remaining > 20 ? 'default' : remaining > 10 ? 'secondary' : 'destructive'}>
                {remaining} remaining
              </Badge>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {usagePercentage > 80 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
              ⚠️ You're approaching your daily limit. Consider upgrading for unlimited access!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Tokens Used
              </p>
              <p className="text-2xl font-bold">{stats.today.tokens.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Cost Saved
              </p>
              <p className="text-2xl font-bold">${stats.today.cost.toFixed(4)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Week
          </CardTitle>
          <CardDescription>Last 7 days of AI usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Requests</p>
              <p className="text-2xl font-bold">{stats.thisWeek.requests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold">{stats.thisWeek.tokens.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="text-2xl font-bold">${stats.thisWeek.cost.toFixed(3)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle>This Month</CardTitle>
          <CardDescription>Last 30 days of AI usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Requests</p>
              <p className="text-2xl font-bold">{stats.thisMonth.requests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold">{stats.thisMonth.tokens.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${stats.thisMonth.cost.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Cache Performance</CardTitle>
          <CardDescription>
            Cached responses save time and reduce costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Common queries are cached automatically. When you ask similar questions, 
            you'll get instant responses without using your daily quota!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
