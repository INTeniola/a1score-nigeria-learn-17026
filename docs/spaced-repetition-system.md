# Spaced Repetition & Study Session System

## Overview

A comprehensive learning system implementing the SM-2 spaced repetition algorithm combined with intelligent study session management and analytics.

## Features

### 1. Spaced Repetition System (SM-2 Algorithm)

#### Core Components
- **Flashcard Review Interface** (`SpacedRepetitionReview.tsx`)
  - Card flip animations using Framer Motion
  - Self-grading with 4 quality levels (Again, Hard, Good, Easy)
  - Real-time progress tracking
  - Session statistics (time, accuracy)

- **Analytics Dashboard** (`SpacedRepetitionAnalytics.tsx`)
  - Cards due today/this week
  - Mastery levels by topic
  - Exam readiness predictions
  - Study streak tracking

#### SM-2 Algorithm Implementation

The system uses the SuperMemo 2 algorithm for optimal review scheduling:

```typescript
// Quality ratings: 0-5
// 0: Complete failure, 5: Perfect recall

if (quality >= 3) {
  // Correct response
  if (repetitions === 0) interval = 1 day
  else if (repetitions === 1) interval = 6 days
  else interval = previousInterval * easeFactor
  
  repetitions++
} else {
  // Incorrect response - restart
  repetitions = 0
  interval = 1 day
}

// Update ease factor
easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
easeFactor = max(easeFactor, 1.3)
```

#### Mastery Level Calculation

```typescript
masteryLevel = min(100, 
  (repetitions * 10) + 
  (easeFactor - 1.3) * 30 + 
  (intervalDays / 7) * 10
)
```

### 2. Flashcard Generation

#### AI-Generated Flashcards
**Edge Function:** `generate-flashcards`

Generate flashcards from:
- **Documents**: Extract key concepts from uploaded PDFs/documents
- **Topics**: Generate cards for any subject/topic
- **CSV Import**: Bulk import custom flashcards

**Usage:**
```typescript
// From document
const { generateFlashcardsFromDocument } = useSpacedRepetition();
await generateFlashcardsFromDocument(documentId, 10);

// From topic
await generateFlashcardsFromTopic('Biology', 'Cell Structure', 15);

// From CSV
await importFromCSV([
  { question: '...', answer: '...', subject: '...', topic: '...' }
]);
```

**CSV Format:**
```csv
question,answer,subject,topic
"What is mitochondria?","The powerhouse of the cell","Biology","Cell Biology"
```

### 3. Study Session System

#### Session Starter (`StudySessionStarter.tsx`)
- Smart topic suggestions based on due cards
- Duration presets (25min Pomodoro, 45min, 90min)
- Focus mode toggle
- Optional lofi music integration

#### Active Session (`StudySessionActive.tsx`)
- **Live Timer**: Countdown with pause/extend
- **Quick Actions**:
  - Generate quiz
  - Create flashcards
  - Summarize section
- **Distraction Blocker**: Optional navigation minimization
- **Session Stats**: Real-time tracking of questions, quizzes, flashcards

#### Session Summary (`StudySessionSummary.tsx`)
- Time studied and concepts covered
- Questions asked and quiz accuracy
- Achievements unlocked
- Next session recommendations

#### Session History (`StudySessionHistory.tsx`)
- Calendar heatmap visualization (GitHub-style)
- Historical session details
- Statistics: Total hours, average session length, consistency

### 4. Database Schema

#### Enhanced Tables

**spaced_repetition_cards:**
```sql
- mastery_level (0-100)
- total_reviews
- source_document_id (references user_documents)
```

**learning_sessions:**
```sql
- session_settings (jsonb)
  - duration_minutes
  - focus_mode
  - music_enabled
- achievements_unlocked (text[])
- distractions_count
- ai_questions_asked
```

#### Indexes
```sql
CREATE INDEX idx_spaced_repetition_next_review 
ON spaced_repetition_cards(user_id, next_review_date);

CREATE INDEX idx_learning_sessions_user_date 
ON learning_sessions(user_id, started_at DESC);
```

### 5. Integration with Study Hub

**Main Component:** `StudyHub.tsx`

Unified interface with tabs:
- **Study Session**: Start focused study sessions
- **Review Cards**: Spaced repetition reviews
- **Analytics**: Performance and mastery tracking
- **History**: Calendar view of past sessions

## Usage Example

```typescript
import { StudyHub } from '@/components/student/StudyHub';

function StudentDashboard() {
  return (
    <div className="container">
      <StudyHub />
    </div>
  );
}
```

## Key Hooks

### useSpacedRepetition
```typescript
const {
  cards,
  dueCards,
  loading,
  createCard,
  reviewCard,
  deleteCard,
  generateFlashcardsFromDocument,
  generateFlashcardsFromTopic,
  importFromCSV,
  refreshCards
} = useSpacedRepetition();
```

## Analytics & Insights

### Study Streak
Calculated based on consecutive days with completed reviews.

### Exam Readiness
Percentage based on:
- Cards with interval > 21 days (mastered)
- Average mastery level across all cards
- Proportion of due cards completed

### Recommended Next Steps
AI-powered suggestions based on:
- Weak areas (low mastery topics)
- Due cards distribution
- Historical performance patterns

## Best Practices

1. **Consistent Reviews**: Review due cards daily for optimal retention
2. **Quality Ratings**: Be honest with self-assessment (1-5 scale)
3. **Session Duration**: Start with 25-minute Pomodoro sessions
4. **Focus Mode**: Enable for deep work sessions
5. **CSV Import**: Use for bulk importing from existing flashcard sets
6. **Document Generation**: Let AI create cards from study materials

## Performance Optimizations

- Indexed queries for due card lookups
- Efficient heatmap calculation
- Pagination for session history
- Cached mastery calculations

## Future Enhancements

- Collaborative study sessions
- Shared flashcard decks
- Gamification elements (XP, badges)
- Advanced analytics (learning curves, forgetting curves)
- Mobile app with offline support
- Voice-based review mode
- Image occlusion for visual flashcards