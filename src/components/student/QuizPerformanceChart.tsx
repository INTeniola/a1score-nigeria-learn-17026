import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface QuizPerformanceChartProps {
  data: Array<{ date: string; score: number; subject: string }>;
}

export function QuizPerformanceChart({ data }: QuizPerformanceChartProps) {
  // Group by subject for multiple lines
  const subjects = [...new Set(data.map(d => d.subject))];
  
  // Aggregate by date for each subject
  const dateMap = new Map<string, any>();
  data.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, { date: item.date });
    }
    const dateData = dateMap.get(item.date)!;
    if (!dateData[item.subject]) {
      dateData[item.subject] = [];
    }
    dateData[item.subject].push(item.score);
  });

  // Calculate averages
  const chartData = Array.from(dateMap.values()).map(dateData => {
    const result: any = { date: dateData.date };
    subjects.forEach(subject => {
      if (dateData[subject]) {
        const avg = dateData[subject].reduce((a: number, b: number) => a + b, 0) / dateData[subject].length;
        result[subject] = Math.round(avg * 10) / 10;
      }
    });
    return result;
  });

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    '#10b981',
    '#f59e0b',
    '#ef4444'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quiz Performance
        </CardTitle>
        <CardDescription>
          Your scores over time by subject
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Take some quizzes to see your performance
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ 
                  value: 'Score (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'hsl(var(--muted-foreground))'
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend />
              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length] }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
