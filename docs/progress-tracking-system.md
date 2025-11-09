# Progress Tracking System Documentation

## Overview

The Progress Tracking System provides comprehensive analytics and insights into student learning patterns, progress, and performance. It includes goal setting, predictive analytics, and detailed visualizations.

## Database Schema

### Tables

#### 1. study_goals
Tracks user-defined learning goals.

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- goal_type: TEXT ('study_hours', 'topic_mastery', 'exam_prep', 'quiz_score')
- title: TEXT
- description: TEXT
- target_value: NUMERIC
- current_value: NUMERIC
- time_period: TEXT ('daily', 'weekly', 'monthly', 'custom')
- start_date: DATE
- end_date: DATE
- subject: TEXT
- topic: TEXT
- status: TEXT ('active', 'completed', 'cancelled')
- metadata: JSONB
```

#### 2. user_achievements
Records earned achievements and milestones.

```sql
- id: UUID (primary key)
- user_id: UUID
- achievement_type: TEXT
- title: TEXT
- description: TEXT
- icon: TEXT
- earned_at: TIMESTAMPTZ
- metadata: JSONB
```

#### 3. learning_insights
Stores AI-generated insights about learning patterns.

```sql
- id: UUID (primary key)
- user_id: UUID
- insight_type: TEXT ('time_of_day', 'retention_pattern', 'subject_comparison', 'study_duration', 'performance_trend')
- insight_text: TEXT
- confidence_score: NUMERIC (0-1)
- data_points: JSONB
- generated_at: TIMESTAMPTZ
- is_read: BOOLEAN
```

#### 4. quiz_attempts
Tracks all quiz attempt history for performance analysis.

```sql
- id: UUID (primary key)
- user_id: UUID
- quiz_id: UUID
- subject: TEXT
- topic: TEXT
- questions_count: INTEGER
- correct_count: INTEGER
- score: NUMERIC
- duration_seconds: INTEGER
- exam_type: TEXT
- difficulty: TEXT
- completed_at: TIMESTAMPTZ
```

## Database Functions

### calculate_concept_mastery(user_id, subject)

Calculates mastery score (0-100) for a subject based on:
- Recent quiz performance (40% weight)
- Spaced repetition card mastery (40% weight)
- Study session count (20% weight)

### calculate_exam_readiness(user_id, subject, exam_date)

Returns comprehensive exam readiness data:
- Readiness score (0-100)
- Mastery score
- Practice test count
- Study hours (last 30 days)
- Days remaining
- Status ('ready', 'almost_ready', 'needs_work', 'not_ready')
- Personalized recommendation

## Components

### 1. ProgressTrackerDashboard
Main dashboard with tabbed interface:
- **Overview**: Charts and visualizations
- **Goals**: Goal management
- **Insights**: Learning pattern insights
- **Exam Prep**: Readiness calculator

### 2. ConceptMasteryRadar
Radar chart showing mastery levels across subjects (0-100 scale).

### 3. StudyTimeTrendsChart
Line chart displaying daily study hours and session counts over 30 days.

### 4. QuizPerformanceChart
Multi-line chart showing quiz scores over time, grouped by subject.

### 5. StudyStreakCalendar
Visual calendar showing study activity for the last 90 days with streak counter.

### 6. GoalManager
Goal creation and tracking interface with:
- Goal type selection
- Target value and time period
- Progress bars
- Completion celebrations

### 7. LearningInsightsPanel
Displays personalized insights:
- Time of day analysis
- Retention patterns
- Subject comparisons
- Performance trends
- Confidence scores

### 8. ExamReadinessWidget
Interactive calculator for exam preparedness:
- Input: Subject and exam date
- Output: Readiness score, detailed metrics, recommendations

### 9. WeakConceptsPanel
Highlights topics needing more practice based on spaced repetition mastery.

## Hooks

### useProgressAnalytics()

Main analytics hook providing:

```typescript
{
  loading: boolean
  conceptMastery: ConceptMastery[]
  studyTimeTrends: StudyTimeTrend[]
  quizPerformance: QuizPerformance[]
  insights: LearningInsight[]
  weakConcepts: WeakConcept[]
  studyStreak: number
  totalStudyHours: number
  getExamReadiness: (subject, examDate) => Promise<ExamReadiness>
  generateTimeOfDayInsight: () => Promise<void>
  markInsightAsRead: (insightId) => Promise<void>
  refreshAnalytics: () => Promise<void>
}
```

### useStudyGoals()

Goal management hook:

```typescript
{
  goals: StudyGoal[]
  loading: boolean
  createGoal: (goal) => Promise<StudyGoal>
  updateGoalProgress: (goalId, newValue) => Promise<void>
  deleteGoal: (goalId) => Promise<void>
  cancelGoal: (goalId) => Promise<void>
  calculateGoalProgress: (goal) => number
  getDaysRemaining: (goal) => number
  getActiveGoals: () => StudyGoal[]
  getCompletedGoals: () => StudyGoal[]
  getGoalsByType: (type) => StudyGoal[]
  refreshGoals: () => Promise<void>
}
```

## Features

### 1. Dashboard Widgets

#### Quick Stats
- Current study streak
- Total study hours
- Number of subjects tracked
- Unread insights count

#### Concept Mastery Radar
- Multi-dimensional view of subject mastery
- 0-100 scale for each subject
- Visual comparison across subjects

#### Study Time Trends
- Daily study hours over 30 days
- Session count trends
- Identifies study consistency patterns

#### Quiz Performance
- Score trends over time
- Multi-subject comparison
- Performance trajectory visualization

#### Study Streak Calendar
- 90-day heatmap visualization
- Visual streak highlighting
- Study consistency tracking

### 2. Goal Setting System

#### Goal Types
- **Study Hours**: Track time spent studying
- **Topic Mastery**: Achieve mastery in specific topics
- **Exam Prep**: Prepare for upcoming exams
- **Quiz Score**: Reach target scores on quizzes

#### Time Periods
- Daily goals
- Weekly goals
- Monthly goals
- Custom date ranges

#### Features
- Progress bars with percentage
- Days remaining countdown
- Automatic completion detection
- Achievement unlocking on goal completion

### 3. Predictive Analytics

#### Exam Readiness Calculator
Inputs:
- Subject name
- Exam date

Outputs:
- Overall readiness score (0-100)
- Mastery level
- Practice test count
- Study hours invested
- Days remaining
- Status indicator
- Personalized recommendations

Algorithm considers:
- Recent quiz performance
- Spaced repetition mastery
- Study time invested
- Time until exam

#### Weak Concept Identification
Automatically identifies topics needing attention based on:
- Low mastery scores (< 50%)
- Time since last study
- Performance in related quizzes

### 4. Insights Panel

#### Time of Day Analysis
Analyzes study sessions to determine optimal learning times:
- Morning (6am-12pm)
- Afternoon (12pm-6pm)
- Evening (6pm-12am)
- Night (12am-6am)

Requires minimum 5 sessions with performance data.

#### Retention Pattern Analysis
(Coming soon)
- Reviews spaced repetition performance
- Identifies optimal review intervals
- Suggests personalized spacing

#### Subject Comparison
(Coming soon)
- Compares mastery across subjects
- Identifies strongest/weakest areas
- Provides balanced study recommendations

#### Performance Trends
(Coming soon)
- Tracks improvement over time
- Identifies learning velocity
- Predicts future performance

### 5. Export Capabilities

#### CSV Export
Exports comprehensive data:
- Study sessions (date, hours, session count)
- Quiz performance (date, score, subject)
- Concept mastery (subject, mastery percentage)

#### PDF Export
(Coming soon)
Will generate professional progress report with:
- Summary statistics
- Charts and visualizations
- Goal progress
- Insights and recommendations
- Weak areas to focus on

## Usage Examples

### Adding Progress Tracker to Student Dashboard

```typescript
import { ProgressTrackerDashboard } from '@/components/student/ProgressTrackerDashboard';

function StudentDashboard() {
  return (
    <div className="space-y-6">
      <ProgressTrackerDashboard />
    </div>
  );
}
```

### Creating a Study Goal

```typescript
const { createGoal } = useStudyGoals();

await createGoal({
  title: "Study 10 hours this week",
  description: "Focus on Mathematics and Physics",
  goal_type: "study_hours",
  target_value: 10,
  time_period: "weekly",
  start_date: "2025-01-10",
  end_date: "2025-01-17",
  subject: "Mathematics",
  metadata: {}
});
```

### Calculating Exam Readiness

```typescript
const { getExamReadiness } = useProgressAnalytics();

const readiness = await getExamReadiness(
  "Mathematics",
  new Date("2025-06-15")
);

console.log(readiness.readiness_score); // 78.5
console.log(readiness.status); // "almost_ready"
console.log(readiness.recommendation); // Personalized advice
```

### Generating Learning Insights

```typescript
const { generateTimeOfDayInsight } = useProgressAnalytics();

// Analyzes study patterns and creates insight
await generateTimeOfDayInsight();
```

### Tracking Quiz Attempts

When a quiz is completed, save the attempt:

```typescript
import { supabase } from '@/integrations/supabase/client';

await supabase.from('quiz_attempts').insert({
  quiz_id: quizId,
  subject: "Mathematics",
  topic: "Calculus",
  questions_count: 20,
  correct_count: 17,
  score: 85,
  duration_seconds: 1200,
  exam_type: "jamb",
  difficulty: "medium"
});
```

## Performance Considerations

1. **Caching**: Analytics calculations are performed on-demand and cached in state
2. **Lazy Loading**: Charts load data progressively to avoid initial load delays
3. **Batch Queries**: Multiple data points fetched in parallel for faster loading
4. **Indexes**: Database indexes on user_id, dates, and status fields for fast queries

## Future Enhancements

1. **Collaborative Goals**: Share goals with study groups
2. **Comparative Analytics**: Compare progress with peers (anonymized)
3. **AI Study Plans**: Auto-generate study schedules based on exam dates
4. **Mobile App Integration**: Push notifications for goal milestones
5. **Gamification**: Badges, levels, and leaderboards
6. **Advanced Insights**: Machine learning-powered predictions
7. **Parent Dashboard**: Progress sharing with parents/guardians

## Security

- All data protected by Row Level Security (RLS)
- Users can only access their own progress data
- Database functions use SECURITY DEFINER for controlled access
- Achievement creation open to system but filtered by user_id

## Troubleshooting

### Issue: Mastery scores showing as 0

**Solution**: Ensure the user has:
- Completed quizzes in the subject
- Created spaced repetition cards
- Had recent study sessions

### Issue: Insights not generating

**Solution**: 
- Minimum 5 study sessions with performance scores required
- Run `generateTimeOfDayInsight()` manually
- Check that learning_sessions table has performance_score data

### Issue: Study streak not updating

**Solution**:
- Verify learning_sessions are being created for each study
- Check that started_at timestamps are correct
- Ensure RLS policies allow reading own sessions

## API Reference

See hooks documentation above for complete API details.

## Testing

To test the progress tracking system:

1. Create multiple study sessions across different dates
2. Complete several quizzes in different subjects
3. Create spaced repetition cards
4. Set various types of goals
5. Verify analytics calculations are correct
6. Test CSV export functionality

## Conclusion

The Progress Tracking System provides students with comprehensive insights into their learning journey, helping them identify strengths, weaknesses, and optimize their study strategies through data-driven recommendations.
