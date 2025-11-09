// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StudentPerformance {
  studentId: string;
  studentName: string;
  averageScore: number;
  totalQuizzes: number;
  lastActivity: string;
  status: 'excellent' | 'good' | 'average' | 'needs_attention';
  subjects: {
    [subject: string]: {
      score: number;
      quizCount: number;
    };
  };
}

interface SubjectAnalytics {
  subject: string;
  averageScore: number;
  totalStudents: number;
  topPerformers: number;
  strugglingStudents: number;
  improvement: number;
}

interface ClassStats {
  totalStudents: number;
  classAverage: number;
  topPerformers: number;
  needsAttention: number;
  weeklyProgress: Array<{
    week: string;
    average: number;
    participation: number;
  }>;
}

export const useClassAnalytics = (classId?: string) => {
  const { user } = useAuth();
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(classId);
  const [teacherClasses, setTeacherClasses] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (user) {
      loadTeacherClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      loadClassAnalytics();
    }
  }, [selectedClass]);

  const loadTeacherClasses = async () => {
    if (!user) return;

    try {
      const { data: classes } = await supabase
        .from('class_groups')
        .select('id, name, subject_id, subjects(name)')
        .eq('teacher_id', user.id)
        .eq('is_active', true);

      setTeacherClasses(classes?.map(c => ({
        id: c.id,
        name: `${c.name} - ${c.subjects?.name || 'Unknown Subject'}`
      })) || []);

      // Auto-select first class if none selected
      if (!selectedClass && classes?.length) {
        setSelectedClass(classes[0].id);
      }
    } catch (error) {
      console.error('Error loading teacher classes:', error);
    }
  };

  const loadClassAnalytics = async () => {
    if (!selectedClass || !user) return;

    try {
      setLoading(true);

      // Get class enrollments and student profiles separately
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', selectedClass)
        .eq('is_active', true);

      // Get student profiles
      const studentIds = enrollments?.map(e => e.student_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', studentIds);

      if (!enrollments?.length) {
        setClassStats({
          totalStudents: 0,
          classAverage: 0,
          topPerformers: 0,
          needsAttention: 0,
          weeklyProgress: []
        });
        setStudentPerformance([]);
        setSubjectAnalytics([]);
        setLoading(false);
        return;
      }

      // Get student quiz performance
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .in('user_id', studentIds)
        .order('created_at', { ascending: false });

      // Get class subject
      const { data: classInfo } = await supabase
        .from('class_groups')
        .select('subjects(name)')
        .eq('id', selectedClass)
        .single();

      // Process student performance
      const studentPerformanceData: StudentPerformance[] = enrollments.map(enrollment => {
        const studentQuizzes = quizAttempts?.filter(qa => qa.user_id === enrollment.student_id) || [];
        const averageScore = studentQuizzes.length > 0 
          ? studentQuizzes.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / studentQuizzes.length
          : 0;

        let status: StudentPerformance['status'] = 'average';
        if (averageScore >= 90) status = 'excellent';
        else if (averageScore >= 75) status = 'good';
        else if (averageScore < 60) status = 'needs_attention';

        // Group by subject
        const subjects: { [key: string]: { score: number; quizCount: number } } = {};
        studentQuizzes.forEach(quiz => {
          if (!subjects[quiz.subject]) {
            subjects[quiz.subject] = { score: 0, quizCount: 0 };
          }
          subjects[quiz.subject].score += quiz.score_percentage;
          subjects[quiz.subject].quizCount++;
        });

        // Calculate averages
        Object.keys(subjects).forEach(subject => {
          subjects[subject].score = subjects[subject].score / subjects[subject].quizCount;
        });

        // Find student profile
        const profile = profiles?.find(p => p.user_id === enrollment.student_id);

        return {
          studentId: enrollment.student_id,
          studentName: profile?.display_name || 'Unknown Student',
          averageScore: Math.round(averageScore),
          totalQuizzes: studentQuizzes.length,
          lastActivity: studentQuizzes.length > 0 ? studentQuizzes[0].created_at : 'Never',
          status,
          subjects
        };
      });

      // Calculate class stats
      const totalStudents = studentPerformanceData.length;
      const classAverage = totalStudents > 0 
        ? Math.round(studentPerformanceData.reduce((sum, student) => sum + student.averageScore, 0) / totalStudents)
        : 0;
      const topPerformers = studentPerformanceData.filter(s => s.status === 'excellent' || s.status === 'good').length;
      const needsAttention = studentPerformanceData.filter(s => s.status === 'needs_attention').length;

      // Mock weekly progress (in real app, this would be calculated from actual data)
      const weeklyProgress = Array.from({ length: 4 }, (_, i) => ({
        week: `Week ${i + 1}`,
        average: classAverage + Math.random() * 10 - 5,
        participation: Math.round(70 + Math.random() * 30)
      }));

      // Calculate subject analytics
      const subjectData: { [key: string]: { scores: number[]; studentCount: number } } = {};
      
      studentPerformanceData.forEach(student => {
        Object.entries(student.subjects).forEach(([subject, data]) => {
          if (!subjectData[subject]) {
            subjectData[subject] = { scores: [], studentCount: 0 };
          }
          subjectData[subject].scores.push(data.score);
          subjectData[subject].studentCount++;
        });
      });

      const subjectAnalyticsData: SubjectAnalytics[] = Object.entries(subjectData).map(([subject, data]) => {
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
        const topPerformersCount = data.scores.filter(score => score >= 85).length;
        const strugglingCount = data.scores.filter(score => score < 60).length;

        return {
          subject,
          averageScore: Math.round(averageScore),
          totalStudents: data.studentCount,
          topPerformers: topPerformersCount,
          strugglingStudents: strugglingCount,
          improvement: Math.round(Math.random() * 20 - 10) // Mock improvement percentage
        };
      });

      setClassStats({
        totalStudents,
        classAverage,
        topPerformers,
        needsAttention,
        weeklyProgress
      });
      setStudentPerformance(studentPerformanceData);
      setSubjectAnalytics(subjectAnalyticsData);

    } catch (error) {
      console.error('Error loading class analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    classStats,
    studentPerformance,
    subjectAnalytics,
    loading,
    teacherClasses,
    selectedClass,
    setSelectedClass,
    refreshData: loadClassAnalytics
  };
};