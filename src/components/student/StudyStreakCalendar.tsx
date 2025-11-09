import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudyStreakCalendarProps {
  currentStreak: number;
}

export function StudyStreakCalendar({ currentStreak }: StudyStreakCalendarProps) {
  const [studyDates, setStudyDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStudyDates();
  }, []);

  const loadStudyDates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data } = await supabase
      .from('learning_sessions')
      .select('started_at')
      .eq('user_id', user.id)
      .gte('started_at', ninetyDaysAgo.toISOString());

    if (data) {
      const dates = new Set(
        data.map(s => new Date(s.started_at).toLocaleDateString())
      );
      setStudyDates(dates);
    }
  };

  // Generate calendar for last 90 days
  const generateCalendar = () => {
    const weeks: Date[][] = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 89);

    // Align to start of week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let currentWeek: Date[] = [];
    for (let i = 0; i < 13 * 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      currentWeek.push(date);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  };

  const weeks = generateCalendar();
  const today = new Date();

  const getCellColor = (date: Date): string => {
    const dateStr = date.toLocaleDateString();
    const isToday = date.toDateString() === today.toDateString();
    const isFuture = date > today;
    const hasStudied = studyDates.has(dateStr);

    if (isFuture) return 'bg-muted/20';
    if (isToday && hasStudied) return 'bg-primary border-2 border-primary-foreground';
    if (isToday) return 'bg-muted border-2 border-primary';
    if (hasStudied) return 'bg-primary/80';
    return 'bg-muted/40';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Study Streak
            </CardTitle>
            <CardDescription>
              Your consistency over the last 90 days
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Flame className="h-4 w-4 mr-1 text-orange-500" />
            {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
            <div className="text-center">Sun</div>
            <div className="text-center">Mon</div>
            <div className="text-center">Tue</div>
            <div className="text-center">Wed</div>
            <div className="text-center">Thu</div>
            <div className="text-center">Fri</div>
            <div className="text-center">Sat</div>
          </div>

          {/* Calendar grid */}
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`aspect-square rounded-sm transition-colors ${getCellColor(date)}`}
                  title={date.toLocaleDateString()}
                />
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-muted/40" />
              <span>No study</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary/80" />
              <span>Studied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary border-2 border-primary-foreground" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
