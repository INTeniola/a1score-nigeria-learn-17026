import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Brain, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface Session {
  id: string;
  started_at: string;
  duration_minutes: number;
  subject?: string;
  topic?: string;
  questions_answered: number;
  session_type: string;
}

export function StudySessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
      generateHeatmap(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmap = (sessions: Session[]) => {
    const heatmap: Record<string, number> = {};
    
    sessions.forEach(session => {
      const date = format(new Date(session.started_at), 'yyyy-MM-dd');
      heatmap[date] = (heatmap[date] || 0) + (session.duration_minutes || 0);
    });

    setHeatmapData(heatmap);
  };

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return 'bg-muted';
    if (minutes < 30) return 'bg-green-200 dark:bg-green-900';
    if (minutes < 60) return 'bg-green-300 dark:bg-green-800';
    if (minutes < 120) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  const selectedDateSessions = sessions.filter(session =>
    isSameDay(new Date(session.started_at), selectedDate)
  );

  const totalHours = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const avgSessionLength = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length
    : 0;

  const currentMonth = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthDays = eachDayOfInterval({ start: currentMonth, end: monthEnd });

  if (loading) {
    return <div>Loading session history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-3xl font-bold">{Math.round(avgSessionLength)}m</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{sessions.length}</p>
              </div>
              <Brain className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Study Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {monthDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const minutes = heatmapData[dateStr] || 0;
              return (
                <div
                  key={dateStr}
                  className={`aspect-square rounded ${getHeatmapColor(minutes)} cursor-pointer transition-all hover:scale-110`}
                  title={`${format(day, 'MMM d')}: ${minutes}m`}
                  onClick={() => setSelectedDate(day)}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded bg-green-300 dark:bg-green-800" />
              <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded bg-green-500 dark:bg-green-600" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sessions on {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No study sessions on this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{session.session_type}</Badge>
                      {session.subject && <Badge>{session.subject}</Badge>}
                      {session.topic && <span className="text-sm">• {session.topic}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration_minutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {session.questions_answered} questions
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(session.started_at), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}