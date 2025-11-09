import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStudyGoals, type StudyGoal } from '@/hooks/useStudyGoals';
import { Plus, Target, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function GoalManager() {
  const {
    goals,
    loading,
    createGoal,
    deleteGoal,
    calculateGoalProgress,
    getDaysRemaining,
    getActiveGoals
  } = useStudyGoals();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const activeGoals = getActiveGoals();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Goals
            </CardTitle>
            <CardDescription>
              Set and track your learning objectives
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Goal</DialogTitle>
              </DialogHeader>
              <GoalForm onSuccess={() => setIsCreateOpen(false)} onCreate={createGoal} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading goals...</div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active goals yet. Create your first one!</p>
          </div>
        ) : (
          activeGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={calculateGoalProgress(goal)}
              daysRemaining={getDaysRemaining(goal)}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface GoalCardProps {
  goal: StudyGoal;
  progress: number;
  daysRemaining: number;
  onDelete: () => void;
}

function GoalCard({ goal, progress, daysRemaining, onDelete }: GoalCardProps) {
  const isCompleted = goal.status === 'completed';

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{goal.title}</h4>
            {isCompleted && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {goal.current_value} / {goal.target_value} {goal.goal_type.replace('_', ' ')}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{daysRemaining} days remaining</span>
        </div>
        <Badge variant="outline">{goal.time_period}</Badge>
      </div>
    </div>
  );
}

interface GoalFormProps {
  onSuccess: () => void;
  onCreate: (goal: any) => Promise<any>;
}

function GoalForm({ onSuccess, onCreate }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<StudyGoal['goal_type']>('study_hours');
  const [targetValue, setTargetValue] = useState('');
  const [timePeriod, setTimePeriod] = useState<StudyGoal['time_period']>('weekly');
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const endDate = new Date();
    
    switch (timePeriod) {
      case 'daily':
        endDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(now.getMonth() + 1);
        break;
    }

    await onCreate({
      title,
      description,
      goal_type: goalType,
      target_value: parseFloat(targetValue),
      time_period: timePeriod,
      start_date: now.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      subject: subject || undefined,
      metadata: {}
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Goal Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Study 10 hours this week"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Goal Type</Label>
          <Select value={goalType} onValueChange={(v: any) => setGoalType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="study_hours">Study Hours</SelectItem>
              <SelectItem value="topic_mastery">Topic Mastery</SelectItem>
              <SelectItem value="quiz_score">Quiz Score</SelectItem>
              <SelectItem value="exam_prep">Exam Prep</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Time Period</Label>
          <Select value={timePeriod} onValueChange={(v: any) => setTimePeriod(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Target Value</Label>
          <Input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="e.g., 10"
            required
            min="0"
            step="0.1"
          />
        </div>

        <div className="space-y-2">
          <Label>Subject (optional)</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Mathematics"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Goal
      </Button>
    </form>
  );
}
