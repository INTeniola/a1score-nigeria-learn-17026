// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Shield, 
  TrendingUp, 
  Clock, 
  Star, 
  AlertTriangle,
  BookOpen,
  Settings,
  Bell,
  Users,
  Award,
  Activity,
  Calendar,
  FileText,
  Lock,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParentDashboardProps {
  user: {
    type: 'parent';
    name: string;
  };
  onLogout: () => void;
}

interface ChildData {
  id: string;
  name: string;
  class: string;
  profilePicture?: string;
}

interface StudentReport {
  id: string;
  student_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  subjects: any;
  overall_grade: number;
  attendance_rate: number;
  ai_usage_hours: number;
  achievements: string[];
  areas_for_improvement: string[];
  teacher_comments: string;
}

interface ParentalControl {
  id: string;
  daily_time_limit: number;
  allowed_subjects: string[];
  content_filter_level: string;
  ai_assistance_level: string;
  weekend_restrictions: boolean;
  notification_preferences: any;
}

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  content: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

const EnhancedParentDashboard = ({ user, onLogout }: ParentDashboardProps) => {
  const [selectedChild, setSelectedChild] = useState<string>('child1');
  const [children] = useState<ChildData[]>([
    { id: 'child1', name: 'Amina Hassan', class: 'JSS 2' },
    { id: 'child2', name: 'Ibrahim Hassan', class: 'SS 1' }
  ]);
  
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [parentalControls, setParentalControls] = useState<ParentalControl | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedChild]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student reports
      const { data: reportsData } = await supabase
        .from('student_reports')
        .select('*')
        .eq('student_id', selectedChild)
        .order('generated_at', { ascending: false })
        .limit(5);

      // Fetch parental controls
      const { data: controlsData } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('student_id', selectedChild)
        .single();

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('parent_notifications')
        .select('*')
        .eq('student_id', selectedChild)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('parent_teacher_messages')
        .select('*')
        .eq('student_id', selectedChild)
        .order('created_at', { ascending: false })
        .limit(5);

      setReports(reportsData || []);
      setParentalControls(controlsData);
      setNotifications(notificationsData || []);
      setMessages(messagesData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('parent_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const updateParentalControls = async (updates: Partial<ParentalControl>) => {
    try {
      const { error } = await supabase
        .from('parental_controls')
        .upsert({
          parent_id: user.name, // This would be actual user ID in real app
          student_id: selectedChild,
          ...updates
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Parental controls updated successfully"
      });
      
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parental controls",
        variant: "destructive"
      });
    }
  };

  const currentChild = children.find(child => child.id === selectedChild);
  const latestReport = reports[0];
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Parent Portal</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground" />
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Child Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Child</h2>
          <div className="flex gap-3">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? "default" : "outline"}
                onClick={() => setSelectedChild(child.id)}
              >
                {child.name} ({child.class})
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Grade</p>
                  <p className="text-2xl font-bold text-primary">
                    {latestReport?.overall_grade || 'N/A'}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Usage (This Week)</p>
                  <p className="text-2xl font-bold text-primary">
                    {latestReport?.ai_usage_hours || 0}h
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {latestReport?.attendance_rate || 0}%
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold text-primary">
                    {latestReport?.achievements?.length || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="safety">Safety Controls</TabsTrigger>
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Weekly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestReport ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">Achievements</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {latestReport.achievements?.map((achievement, index) => (
                            <li key={index} className="text-sm">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-600 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {latestReport.areas_for_improvement?.map((area, index) => (
                            <li key={index} className="text-sm">{area}</li>
                          ))}
                        </ul>
                      </div>
                      {latestReport.teacher_comments && (
                        <div>
                          <h4 className="font-semibold mb-2">Teacher Comments</h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {latestReport.teacher_comments}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reports available yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.is_read ? 'bg-background' : 'bg-muted'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                            {notification.notification_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {latestReport && latestReport.subjects ? (
                  <div className="space-y-4">
                    {Object.entries(latestReport.subjects).map(([subject, data]: [string, any]) => (
                      <div key={subject}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{subject}</span>
                          <span className="text-sm text-muted-foreground">{data.grade}%</span>
                        </div>
                        <Progress value={data.grade} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No progress data available yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Teacher Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{message.subject}</h4>
                          <Badge variant="outline">
                            {message.message_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {message.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No messages yet.</p>
                  )}
                  <Button className="w-full">Send Message to Teacher</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Parental Controls & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Time Limits */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Time Limits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Study Time Limit</span>
                      <Badge variant="outline">
                        {parentalControls?.daily_time_limit || 120} minutes
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateParentalControls({ daily_time_limit: 90 })}
                    >
                      Update Time Limits
                    </Button>
                  </div>
                </div>

                {/* Content Filtering */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Content & AI Assistance Level
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Content Filter</span>
                      <Badge variant="outline">
                        {parentalControls?.content_filter_level || 'Age Appropriate'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Assistance</span>
                      <Badge variant="outline">
                        {parentalControls?.ai_assistance_level || 'Guided'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Notification Preferences
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Email Notifications</span>
                      <Badge variant="outline">
                        {parentalControls?.notification_preferences?.email ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SMS Alerts</span>
                      <Badge variant="outline">
                        {parentalControls?.notification_preferences?.sms ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Home Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Supporting Your Child's Math Journey",
                      type: "Guide",
                      duration: "15 min read",
                      description: "Tips for helping with homework and building confidence"
                    },
                    {
                      title: "Healthy Study Habits",
                      type: "Article",
                      duration: "10 min read",
                      description: "Creating an effective study environment at home"
                    },
                    {
                      title: "Understanding AI in Education",
                      type: "Video",
                      duration: "8 min watch",
                      description: "How AI tutors complement traditional learning"
                    },
                    {
                      title: "Family Learning Activities",
                      type: "Activity Pack",
                      duration: "30 min",
                      description: "Fun educational activities for the whole family"
                    }
                  ].map((resource, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{resource.title}</h4>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {resource.duration}
                        </span>
                        <Button size="sm" variant="outline">
                          Access
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  All Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        notification.is_read ? 'bg-background' : 'bg-muted'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            notification.priority === 'high' ? 'destructive' : 
                            notification.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedParentDashboard;