import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Target, Plus, Calendar, Clock, CheckCircle, AlertCircle,
  Trophy, Star, TrendingUp, BookOpen, Calculator, FlaskConical,
  Atom, Globe, Edit2, Trash2, Flag
} from "lucide-react";
import { toast } from "sonner";
import { useStudyGoals, type StudyGoal } from "@/hooks/useStudyGoals";

const StudyGoals = () => {
  const {
    goals,
    loading,
    createGoal: createGoalDB,
    updateGoalProgress: updateProgressDB,
    deleteGoal: deleteGoalDB,
    calculateGoalProgress,
    getDaysRemaining,
    getActiveGoals
  } = useStudyGoals();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal_type: 'study_hours' as StudyGoal['goal_type'],
    subject: '',
    target_value: 0,
    time_period: 'weekly' as StudyGoal['time_period'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    metadata: {}
  });

  const subjects = [
    { name: 'Mathematics', icon: Calculator, color: 'text-blue-600' },
    { name: 'Physics', icon: FlaskConical, color: 'text-purple-600' },
    { name: 'Chemistry', icon: Atom, color: 'text-green-600' },
    { name: 'English', icon: Globe, color: 'text-orange-600' },
    { name: 'All Subjects', icon: BookOpen, color: 'text-gray-600' }
  ];

  const getCategoryIcon = (timePeriod: string) => {
    switch (timePeriod) {
      case 'daily': return Calendar;
      case 'weekly': return Clock;
      case 'monthly': return TrendingUp;
      case 'custom': return Trophy;
      default: return Target;
    }
  };

  const getSubjectIcon = (subject?: string) => {
    if (!subject) return BookOpen;
    const subjectData = subjects.find(s => s.name === subject);
    return subjectData?.icon || BookOpen;
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.end_date) {
      toast.error("Please fill in required fields");
      return;
    }

    await createGoalDB(newGoal);
    setNewGoal({
      title: '',
      description: '',
      goal_type: 'study_hours',
      subject: '',
      target_value: 0,
      time_period: 'weekly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      metadata: {}
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    await updateProgressDB(goalId, newValue);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoalDB(goalId);
    }
  };

  const activeGoals = getActiveGoals();
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getGoalTypeLabel = (type: StudyGoal['goal_type']) => {
    const labels = {
      'study_hours': 'Study Hours',
      'topic_mastery': 'Topic Mastery',
      'exam_prep': 'Exam Prep',
      'quiz_score': 'Quiz Score'
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600" />
            Study Goals
          </h2>
          <p className="text-gray-600 mt-1">Track your progress and stay motivated</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Study Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Master Quadratic Equations"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal_type">Goal Type *</Label>
                  <Select
                    value={newGoal.goal_type}
                    onValueChange={(value: StudyGoal['goal_type']) => setNewGoal({ ...newGoal, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study_hours">Study Hours</SelectItem>
                      <SelectItem value="topic_mastery">Topic Mastery</SelectItem>
                      <SelectItem value="exam_prep">Exam Prep</SelectItem>
                      <SelectItem value="quiz_score">Quiz Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newGoal.subject}
                    onValueChange={(value) => setNewGoal({ ...newGoal, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target Value *</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="e.g., 10"
                    value={newGoal.target_value || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="period">Time Period *</Label>
                  <Select
                    value={newGoal.time_period}
                    onValueChange={(value: StudyGoal['time_period']) => setNewGoal({ ...newGoal, time_period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">End Date *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.end_date}
                  onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-3xl font-bold text-blue-600">{activeGoals.length}</p>
              </div>
              <Target className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900">{goals.length}</p>
              </div>
              <Star className="h-10 w-10 text-gray-900 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
              <Trophy className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Active Goals
        </h3>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">No active goals yet. Create your first goal to get started!</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const CategoryIcon = getCategoryIcon(goal.time_period);
              const SubjectIcon = getSubjectIcon(goal.subject);
              const progress = calculateGoalProgress(goal);
              const daysLeft = getDaysRemaining(goal);

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <SubjectIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {goal.time_period}
                      </Badge>
                      {goal.subject && (
                        <Badge variant="secondary">{goal.subject}</Badge>
                      )}
                      <Badge variant="outline">{getGoalTypeLabel(goal.goal_type)}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">
                          {goal.current_value} / {goal.target_value}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{Math.round(progress)}% complete</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysLeft} days left
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Label htmlFor={`progress-${goal.id}`} className="text-sm mb-2">
                        Update Progress
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`progress-${goal.id}`}
                          type="number"
                          placeholder="Enter value"
                          defaultValue={goal.current_value}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              handleUpdateProgress(goal.id, parseFloat(input.value));
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                            if (input) {
                              handleUpdateProgress(goal.id, parseFloat(input.value));
                            }
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Completed Goals
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedGoals.map((goal) => {
              const SubjectIcon = getSubjectIcon(goal.subject);
              return (
                <Card key={goal.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <SubjectIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{goal.title}</p>
                        <p className="text-sm text-gray-600">
                          {goal.current_value} / {goal.target_value} completed
                        </p>
                      </div>
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGoals;