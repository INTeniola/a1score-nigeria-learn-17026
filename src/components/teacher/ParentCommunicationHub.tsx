// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Send, 
  Search, 
  FileText, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  children: Array<{
    id: string;
    name: string;
    class: string;
  }>;
  unreadMessages: number;
  lastContact: string;
  preferredContact: 'email' | 'sms' | 'whatsapp';
}

interface Message {
  id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  message: string;
  message_type: 'message' | 'announcement' | 'alert' | 'report';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  parent_name: string;
  student_name: string;
}

interface StudentReport {
  id: string;
  student_id: string;
  parent_id: string;
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
  sent_to_parent: boolean;
}

const ParentCommunicationHub = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New message composition state
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    type: 'message' as 'message' | 'announcement' | 'alert' | 'report',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  // Report generation state
  const [reportForm, setReportForm] = useState({
    reportType: 'weekly',
    periodStart: '',
    periodEnd: '',
    subjects: {} as any,
    overallGrade: '',
    attendanceRate: '',
    aiUsageHours: '',
    achievements: '',
    areasForImprovement: '',
    teacherComments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedParent && selectedParent.children.length > 0) {
      setSelectedStudent(selectedParent.children[0].id);
    }
  }, [selectedParent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock parent data - in real app, this would come from database
      const mockParents: Parent[] = [
        {
          id: 'parent1',
          name: 'Mrs. Aisha Ibrahim',
          email: 'aisha.ibrahim@email.com',
          phone: '+234 802 123 4567',
          children: [
            { id: 'student1', name: 'Amina Ibrahim', class: 'JSS 2' },
            { id: 'student2', name: 'Ibrahim Ibrahim Jr.', class: 'JSS 1' }
          ],
          unreadMessages: 2,
          lastContact: '2024-01-15',
          preferredContact: 'whatsapp'
        },
        {
          id: 'parent2',
          name: 'Mr. Chinedu Okafor',
          email: 'chinedu.okafor@email.com',
          phone: '+234 803 987 6543',
          children: [
            { id: 'student3', name: 'Chioma Okafor', class: 'SS 1' }
          ],
          unreadMessages: 0,
          lastContact: '2024-01-12',
          preferredContact: 'email'
        },
        {
          id: 'parent3',
          name: 'Mrs. Fatima Yusuf',
          email: 'fatima.yusuf@email.com',
          phone: '+234 805 555 7777',
          children: [
            { id: 'student4', name: 'Usman Yusuf', class: 'SS 2' },
            { id: 'student5', name: 'Zainab Yusuf', class: 'JSS 3' }
          ],
          unreadMessages: 1,
          lastContact: '2024-01-10',
          preferredContact: 'sms'
        }
      ];

      // Fetch actual messages from database
      const { data: messagesData } = await supabase
        .from('parent_teacher_messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch reports from database
      const { data: reportsData } = await supabase
        .from('student_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      setParents(mockParents);
      setMessages((messagesData || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type as "message" | "alert" | "report" | "announcement") || "message",
        priority: (msg.priority as "low" | "normal" | "high" | "urgent") || "normal",
        parent_name: 'Parent Name', // Would be fetched from join in real app
        student_name: 'Student Name' // Would be fetched from join in real app
      })));
      setReports(reportsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communication data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedParent || !selectedStudent || !newMessage.subject || !newMessage.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('parent_teacher_messages')
        .insert({
          parent_id: selectedParent.id,
          teacher_id: 'current_teacher_id', // Would be actual teacher ID
          student_id: selectedStudent,
          subject: newMessage.subject,
          message: newMessage.message,
          message_type: newMessage.type,
          priority: newMessage.priority
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully"
      });

      setNewMessage({
        subject: '',
        message: '',
        type: 'message',
        priority: 'normal'
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const generateReport = async () => {
    if (!selectedParent || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a parent and student",
        variant: "destructive"
      });
      return;
    }

    try {
      const reportData = {
        student_id: selectedStudent,
        parent_id: selectedParent.id,
        report_type: reportForm.reportType,
        period_start: reportForm.periodStart,
        period_end: reportForm.periodEnd,
        subjects: reportForm.subjects,
        overall_grade: parseFloat(reportForm.overallGrade),
        attendance_rate: parseFloat(reportForm.attendanceRate),
        ai_usage_hours: parseFloat(reportForm.aiUsageHours),
        achievements: reportForm.achievements.split('\n').filter(a => a.trim()),
        areas_for_improvement: reportForm.areasForImprovement.split('\n').filter(a => a.trim()),
        teacher_comments: reportForm.teacherComments,
        sent_to_parent: true
      };

      const { error } = await supabase
        .from('student_reports')
        .insert(reportData);

      if (error) throw error;

      // Also send notification to parent
      await supabase
        .from('parent_notifications')
        .insert({
          parent_id: selectedParent.id,
          student_id: selectedStudent,
          notification_type: 'report',
          title: `${reportForm.reportType} Report Available`,
          content: `A new ${reportForm.reportType} report for ${selectedParent.children.find(c => c.id === selectedStudent)?.name} is now available.`,
          priority: 'normal'
        });

      toast({
        title: "Success",
        description: "Report generated and sent to parent"
      });

      setReportForm({
        reportType: 'weekly',
        periodStart: '',
        periodEnd: '',
        subjects: {},
        overallGrade: '',
        attendanceRate: '',
        aiUsageHours: '',
        achievements: '',
        areasForImprovement: '',
        teacherComments: ''
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('parent_teacher_messages')
        .update({ is_read: true, teacher_read_at: new Date().toISOString() })
        .eq('id', messageId);

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive"
      });
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.children.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const selectedStudentMessages = messages.filter(
    message => message.student_id === selectedStudent
  );

  const selectedStudentReports = reports.filter(
    report => report.student_id === selectedStudent
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'whatsapp': return '📱';
      case 'sms': return '💬';
      case 'email': return '📧';
      default: return '📧';
    }
  };

  if (loading) {
    return <div className="p-6">Loading communication hub...</div>;
  }

  return (
    <div className="h-full flex">
      {/* Parent List Sidebar */}
      <div className="w-1/3 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Parent Communications</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parents or students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredParents.map((parent) => (
            <div
              key={parent.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                selectedParent?.id === parent.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedParent(parent)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{parent.name}</h3>
                    {parent.unreadMessages > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {parent.unreadMessages}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{parent.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">{getContactIcon(parent.preferredContact)}</span>
                    <span className="text-xs text-muted-foreground">
                      {parent.children.map(child => child.name).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(parent.lastContact).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Panel */}
      <div className="flex-1 flex flex-col">
        {selectedParent ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedParent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Children: {selectedParent.children.map(child => `${child.name} (${child.class})`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getContactIcon(selectedParent.preferredContact)} Preferred
                  </Badge>
                </div>
              </div>

              {/* Student Selector */}
              {selectedParent.children.length > 1 && (
                <div className="mt-3">
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedParent.children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} ({child.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="compose" className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-4 pt-4">
                  <TabsTrigger value="compose">Compose Message</TabsTrigger>
                  <TabsTrigger value="history">Message History</TabsTrigger>
                  <TabsTrigger value="reports">Generate Report</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="flex-1 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="messageType">Message Type</Label>
                      <Select value={newMessage.type} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message">Regular Message</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="report">Report Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newMessage.priority} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter message subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newMessage.message}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your message"
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Will be sent via {selectedParent.preferredContact}
                    </div>
                    <Button onClick={sendMessage} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedStudentMessages.length > 0 ? (
                      selectedStudentMessages.map((message) => (
                        <Card key={message.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{message.subject}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(message.priority) as any}>
                                  {message.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {message.message_type}
                                </Badge>
                                {!message.is_read && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markMessageAsRead(message.id)}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {message.message}
                            </p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{new Date(message.created_at).toLocaleDateString()}</span>
                              <span>{message.is_read ? 'Read' : 'Unread'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No messages yet. Start a conversation above.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Generate Progress Report</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Report Type</Label>
                            <Select value={reportForm.reportType} onValueChange={(value) => setReportForm(prev => ({ ...prev, reportType: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Overall Grade (%)</Label>
                            <Input
                              type="number"
                              value={reportForm.overallGrade}
                              onChange={(e) => setReportForm(prev => ({ ...prev, overallGrade: e.target.value }))}
                              placeholder="85"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Period Start</Label>
                            <Input
                              type="date"
                              value={reportForm.periodStart}
                              onChange={(e) => setReportForm(prev => ({ ...prev, periodStart: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Period End</Label>
                            <Input
                              type="date"
                              value={reportForm.periodEnd}
                              onChange={(e) => setReportForm(prev => ({ ...prev, periodEnd: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Attendance Rate (%)</Label>
                            <Input
                              type="number"
                              value={reportForm.attendanceRate}
                              onChange={(e) => setReportForm(prev => ({ ...prev, attendanceRate: e.target.value }))}
                              placeholder="95"
                            />
                          </div>
                          <div>
                            <Label>AI Usage Hours</Label>
                            <Input
                              type="number"
                              value={reportForm.aiUsageHours}
                              onChange={(e) => setReportForm(prev => ({ ...prev, aiUsageHours: e.target.value }))}
                              placeholder="5.5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Achievements (one per line)</Label>
                          <Textarea
                            value={reportForm.achievements}
                            onChange={(e) => setReportForm(prev => ({ ...prev, achievements: e.target.value }))}
                            placeholder="Improved math performance&#10;Completed extra reading assignments"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Areas for Improvement (one per line)</Label>
                          <Textarea
                            value={reportForm.areasForImprovement}
                            onChange={(e) => setReportForm(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                            placeholder="Focus on essay writing&#10;Practice more algebra problems"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Teacher Comments</Label>
                          <Textarea
                            value={reportForm.teacherComments}
                            onChange={(e) => setReportForm(prev => ({ ...prev, teacherComments: e.target.value }))}
                            placeholder="Overall comments about the student's progress..."
                            rows={4}
                          />
                        </div>

                        <Button onClick={generateReport} className="w-full">
                          Generate & Send Report
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Previous Reports */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Previous Reports</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedStudentReports.length > 0 ? (
                            selectedStudentReports.map((report) => (
                              <div key={report.id} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{report.report_type} Report</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {report.overall_grade}%
                                    </Badge>
                                    {report.sent_to_parent && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-center py-4">
                              No reports generated yet.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="flex-1 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Communication Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Total Messages</span>
                            <Badge variant="outline">{selectedStudentMessages.length}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Unread Messages</span>
                            <Badge variant="destructive">
                              {selectedStudentMessages.filter(m => !m.is_read).length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Reports Sent</span>
                            <Badge variant="outline">{selectedStudentReports.length}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Contact</span>
                            <span className="text-sm text-muted-foreground">
                              {selectedParent.lastContact}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Parent Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Response Rate</span>
                            <Badge variant="outline">85%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Response Time</span>
                            <span className="text-sm text-muted-foreground">2.5 hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Preferred Contact</span>
                            <span className="text-sm">
                              {getContactIcon(selectedParent.preferredContact)} {selectedParent.preferredContact}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Meeting Requests</span>
                            <Badge variant="outline">3</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Parent</h3>
              <p className="text-muted-foreground">
                Choose a parent from the list to start communicating
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentCommunicationHub;