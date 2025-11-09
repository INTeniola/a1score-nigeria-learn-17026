import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X, Sparkles } from 'lucide-react';

interface LearningInsight {
  id: string;
  insight_type: string;
  insight_text: string;
  confidence_score: number;
  data_points: any;
  generated_at: string;
  is_read: boolean;
}

interface LearningInsightsPanelProps {
  insights: LearningInsight[];
  onMarkAsRead: (id: string) => void;
  onGenerateNew: () => void;
  loading?: boolean;
}

export function LearningInsightsPanel({ 
  insights, 
  onMarkAsRead, 
  onGenerateNew,
  loading = false 
}: LearningInsightsPanelProps) {
  const unreadInsights = insights.filter(i => !i.is_read);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'time_of_day': return '🕐';
      case 'retention_pattern': return '🧠';
      case 'subject_comparison': return '📊';
      case 'study_duration': return '⏱️';
      case 'performance_trend': return '📈';
      default: return '💡';
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return { label: 'High confidence', variant: 'default' as const };
    if (score >= 0.5) return { label: 'Medium confidence', variant: 'secondary' as const };
    return { label: 'Low confidence', variant: 'outline' as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Learning Insights
            </CardTitle>
            <CardDescription>
              Personalized insights from your study patterns
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerateNew}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights yet. Keep studying to discover patterns!</p>
          </div>
        ) : (
          <>
            {unreadInsights.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Badge variant="secondary">{unreadInsights.length}</Badge>
                <span>new insight{unreadInsights.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {insights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={() => onMarkAsRead(insight.id)}
                icon={getInsightIcon(insight.insight_type)}
                confidenceBadge={getConfidenceBadge(insight.confidence_score)}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  insight: LearningInsight;
  onMarkAsRead: () => void;
  icon: string;
  confidenceBadge: { label: string; variant: 'default' | 'secondary' | 'outline' };
}

function InsightCard({ insight, onMarkAsRead, icon, confidenceBadge }: InsightCardProps) {
  return (
    <div 
      className={`p-4 border rounded-lg transition-colors ${
        insight.is_read ? 'bg-muted/20' : 'bg-accent/10 border-accent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">{insight.insight_text}</p>
          <div className="flex items-center justify-between">
            <Badge variant={confidenceBadge.variant} className="text-xs">
              {confidenceBadge.label}
            </Badge>
            {!insight.is_read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMarkAsRead}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
