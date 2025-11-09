import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpacedRepetitionReview } from './SpacedRepetitionReview';
import { SpacedRepetitionAnalytics } from './SpacedRepetitionAnalytics';
import { StudySessionStarter, SessionConfig } from './StudySessionStarter';
import { StudySessionActive, SessionStats } from './StudySessionActive';
import { StudySessionSummary } from './StudySessionSummary';
import { StudySessionHistory } from './StudySessionHistory';
import { Brain, Clock, BarChart3, Calendar } from 'lucide-react';

type ViewState = 'starter' | 'active' | 'summary' | 'history';

export function StudyHub() {
  const [viewState, setViewState] = useState<ViewState>('starter');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setViewState('active');
  };

  const handleEndSession = (stats: SessionStats) => {
    setSessionStats(stats);
    setViewState('summary');
  };

  const handleNewSession = () => {
    setSessionConfig(null);
    setSessionStats(null);
    setViewState('starter');
  };

  const handleViewHistory = () => {
    setViewState('history');
  };

  if (viewState === 'active' && sessionConfig) {
    return (
      <StudySessionActive
        config={sessionConfig}
        onEndSession={handleEndSession}
        onQuickAction={(action) => {
          console.log('Quick action:', action);
        }}
      />
    );
  }

  if (viewState === 'summary' && sessionConfig && sessionStats) {
    return (
      <StudySessionSummary
        config={sessionConfig}
        stats={sessionStats}
        onNewSession={handleNewSession}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (viewState === 'history') {
    return (
      <div className="space-y-6">
        <StudySessionHistory />
      </div>
    );
  }

  return (
    <Tabs defaultValue="session" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="session" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">Study Session</span>
        </TabsTrigger>
        <TabsTrigger value="review" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Review Cards</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="session">
        <StudySessionStarter onStartSession={handleStartSession} />
      </TabsContent>

      <TabsContent value="review">
        <SpacedRepetitionReview />
      </TabsContent>

      <TabsContent value="analytics">
        <SpacedRepetitionAnalytics />
      </TabsContent>

      <TabsContent value="history">
        <StudySessionHistory />
      </TabsContent>
    </Tabs>
  );
}