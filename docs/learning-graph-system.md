# Learning Graph System Documentation

## Overview

The Learning Graph System is a comprehensive educational tracking and recommendation engine that models concepts, prerequisites, and learner progress through an interconnected knowledge graph.

## Database Schema

### Core Tables

#### 1. `learning_interactions`
Tracks every learning interaction with detailed metrics.

**Columns:**
- `id`: UUID primary key
- `user_id`: Reference to auth.users
- `question`: The question or prompt
- `answer`: User's answer (optional)
- `topic`: Subject topic
- `difficulty`: easy | medium | hard
- `time_spent`: Seconds spent on interaction
- `success_rate`: 0-100 score
- `confidence_level`: 1-5 self-reported confidence
- `interaction_type`: quiz | practice | ai_chat | review
- `metadata`: Additional contextual data (JSONB)
- `created_at`: Timestamp

**Use Cases:**
- Track granular learning behavior
- Analyze time-to-mastery patterns
- Identify struggling topics
- Generate personalized recommendations

#### 2. `concept_mastery`
Stores user mastery levels for each concept.

**Columns:**
- `id`: UUID primary key
- `user_id`: Reference to auth.users
- `concept_id`: Reference to knowledge_graph
- `concept_name`: Human-readable name
- `subject`: Subject area
- `mastery_level`: 0-100 calculated score
- `confidence_score`: 0-100 user confidence
- `last_reviewed`: Last practice timestamp
- `next_review_date`: Spaced repetition scheduling
- `total_interactions`: Count of all attempts
- `successful_interactions`: Count of successful attempts
- `created_at`, `updated_at`: Timestamps

**Unique Constraint:** (user_id, concept_id)

**Use Cases:**
- Track progress across curriculum
- Schedule spaced repetition reviews
- Identify mastery gaps
- Provide progress reports

#### 3. `knowledge_graph`
Defines concepts, prerequisites, and relationships.

**Columns:**
- `id`: UUID primary key
- `concept_id`: Unique concept identifier
- `concept_name`: Display name
- `subject`: Subject category
- `description`: Concept description
- `difficulty_rating`: 1-10 complexity score
- `prerequisite_concepts`: Array of prerequisite concept_ids
- `related_concepts`: Array of related concept_ids
- `learning_objectives`: Text array of learning goals
- `estimated_learning_time`: Minutes to master
- `tags`: Searchable tags array
- `created_at`, `updated_at`: Timestamps

**Unique Constraint:** concept_id

**Use Cases:**
- Build adaptive learning paths
- Enforce prerequisite requirements
- Generate curriculum recommendations
- Visualize concept relationships

#### 4. Enhanced `document_chunks`
Extended with AI embeddings for semantic search.

**New Columns:**
- `embedding_vector`: vector(1536) for semantic search
- `chunk_summary`: AI-generated summary
- `concepts_covered`: Array of related concepts

**Use Cases:**
- Semantic document search
- Concept-to-document mapping
- Context-aware AI tutoring
- Automatic content tagging

#### 5. Enhanced `learning_sessions`
Extended with performance metrics.

**New Columns:**
- `engagement_score`: 0-100 engagement rating
- `difficulty_progression`: JSONB tracking difficulty changes
- `learning_velocity`: Concepts mastered per unit time

## Database Functions

### 1. `calculate_concept_mastery(user_id, concept_id)`
Calculates mastery score from interaction success rates.

**Algorithm:**
```
mastery = (average_success_rate * practice_quantity_bonus)
practice_quantity_bonus = 1 + (interaction_count * 0.01)
max_mastery = 100
```

**Usage:**
```sql
SELECT calculate_concept_mastery(auth.uid(), 'concept-uuid');
```

### 2. `get_recommended_concepts(user_id, subject, mastery_threshold)`
Returns next concepts to learn based on prerequisites.

**Logic:**
1. Filter by subject
2. Exclude already mastered concepts (≥70%)
3. Check if all prerequisites are met
4. Order by prerequisites_met DESC, difficulty ASC
5. Limit to top 10

**Usage:**
```typescript
const { data } = await supabase.rpc('get_recommended_concepts', {
  p_user_id: userId,
  p_subject: 'Mathematics',
  p_mastery_threshold: 70
});
```

### 3. `get_learning_velocity(user_id, weeks)`
Calculates concepts mastered per week.

**Formula:**
```
velocity = distinct_concepts_mastered / weeks
```

**Usage:**
```sql
SELECT get_learning_velocity(auth.uid(), 4); -- Last 4 weeks
```

### 4. `get_weak_areas(user_id, limit)`
Returns concepts needing practice.

**Criteria:**
- Mastery level < 70%
- Ordered by mastery level ASC, last_reviewed ASC
- Includes review_overdue flag

**Usage:**
```typescript
const { data } = await supabase.rpc('get_weak_areas', {
  p_user_id: userId,
  p_limit: 5
});
```

### 5. `search_document_chunks(user_id, query_embedding, limit)`
Semantic search using vector similarity.

**Algorithm:**
- Uses cosine similarity (vector <=> operator)
- Returns similarity score (0-1)
- Filters by user's documents only
- Orders by relevance

**Usage:**
```typescript
const { data } = await supabase.rpc('search_document_chunks', {
  p_user_id: userId,
  p_query_embedding: embeddingVector,
  p_limit: 5
});
```

## Automatic Triggers

### 1. `update_concept_mastery_from_interaction`
**Fires:** AFTER INSERT on learning_interactions
**Action:**
1. Creates concept in knowledge_graph if not exists
2. Upserts concept_mastery record
3. Calculates rolling average mastery
4. Updates interaction counts

**Formula:**
```
new_mastery = (old_mastery * old_count + new_score) / (old_count + 1)
```

## Indexes

### Performance Optimizations

**Composite Indexes:**
- `(user_id, topic)` on learning_interactions
- `(user_id, concept_id)` on concept_mastery (unique)

**JSONB Indexes:**
- GIN index on learning_interactions.metadata
- GIN index on learning_sessions.difficulty_progression

**Array Indexes:**
- GIN index on knowledge_graph.prerequisite_concepts
- GIN index on knowledge_graph.related_concepts

**Vector Index:**
- IVFFlat index on document_chunks.embedding_vector (cosine similarity)

## TypeScript Integration

### Core Types

See `src/types/learning-graph.ts` for complete type definitions.

**Key Types:**
- `LearningInteraction`
- `ConceptMastery`
- `KnowledgeGraphConcept`
- `RecommendedConcept`
- `WeakArea`
- `LearningAnalyticsSummary`

### Hooks

#### `useLearningGraph()`

**Returns:**
```typescript
{
  concepts: KnowledgeGraphConcept[]
  masteryData: ConceptMastery[]
  interactions: LearningInteraction[]
  analytics: LearningAnalyticsSummary | null
  loading: boolean
  trackInteraction: (params) => Promise<void>
  getConceptById: (id) => KnowledgeGraphConcept | undefined
  getMasteryForConcept: (id) => ConceptMastery | undefined
  getPrerequisiteConcepts: (id) => KnowledgeGraphConcept[]
  getRelatedConcepts: (id) => KnowledgeGraphConcept[]
  isPrerequisiteMet: (id) => boolean
  areAllPrerequisitesMet: (id) => boolean
  refreshGraph: () => Promise<void>
}
```

**Example:**
```typescript
const { 
  concepts, 
  trackInteraction, 
  areAllPrerequisitesMet 
} = useLearningGraph();

// Track learning activity
await trackInteraction({
  question: "What is 2+2?",
  answer: "4",
  topic: "Basic Arithmetic",
  difficulty: "easy",
  time_spent: 5,
  success_rate: 100,
  confidence_level: 5,
  interaction_type: "quiz"
});

// Check if user can learn calculus
const canLearnCalculus = areAllPrerequisitesMet(calculusConceptId);
```

## Row Level Security (RLS)

### Learning Interactions
- Users can only view/insert/update their own interactions
- No delete policy (preserve learning history)

### Concept Mastery
- Users have full control (ALL) over their own mastery records
- No access to other users' data

### Knowledge Graph
- All authenticated users can read
- Only admins can modify (checks profiles.user_type = 'admin')

## Best Practices

### 1. Tracking Interactions
Always track interactions immediately after user completes an activity:

```typescript
// After quiz submission
await trackInteraction({
  question: quizQuestion,
  answer: userAnswer,
  topic: quizTopic,
  difficulty: quizDifficulty,
  time_spent: elapsedSeconds,
  success_rate: isCorrect ? 100 : 0,
  interaction_type: 'quiz',
  metadata: { quiz_id, question_id }
});
```

### 2. Building Learning Paths
Use recommended concepts to create adaptive paths:

```typescript
const { recommendedConcepts } = analytics;

const nextConcepts = recommendedConcepts
  .filter(c => c.prerequisites_met)
  .slice(0, 3); // Show top 3 recommendations
```

### 3. Spaced Repetition Integration
Combine with `spaced_repetition_cards` table:

```typescript
// Get concepts due for review
const dueForReview = masteryData.filter(
  m => m.next_review_date && new Date(m.next_review_date) <= new Date()
);
```

### 4. Vector Search for Context
When using AI tutor, find relevant document chunks:

```typescript
const { data: relevantChunks } = await supabase.rpc(
  'search_document_chunks',
  {
    p_user_id: userId,
    p_query_embedding: await generateEmbedding(userQuestion),
    p_limit: 3
  }
);

// Include chunks in AI context
const context = relevantChunks.map(c => c.content).join('\n\n');
```

## Analytics Queries

### Mastery by Subject
```sql
SELECT 
  subject,
  COUNT(*) as total_concepts,
  AVG(mastery_level) as avg_mastery,
  COUNT(*) FILTER (WHERE mastery_level >= 70) as mastered_count
FROM concept_mastery
WHERE user_id = auth.uid()
GROUP BY subject
ORDER BY avg_mastery DESC;
```

### Learning Progress Over Time
```sql
SELECT 
  DATE(created_at) as date,
  AVG(success_rate) as avg_success,
  COUNT(*) as interaction_count,
  AVG(time_spent) as avg_time_seconds
FROM learning_interactions
WHERE user_id = auth.uid()
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Concept Difficulty vs Mastery
```sql
SELECT 
  kg.difficulty_rating,
  AVG(cm.mastery_level) as avg_mastery,
  COUNT(*) as concept_count
FROM concept_mastery cm
JOIN knowledge_graph kg ON kg.concept_id = cm.concept_id
WHERE cm.user_id = auth.uid()
GROUP BY kg.difficulty_rating
ORDER BY kg.difficulty_rating;
```

## Future Enhancements

1. **Collaborative Filtering**: Recommend concepts based on similar learners
2. **Adaptive Difficulty**: Dynamically adjust difficulty based on performance
3. **Social Learning**: Share learning paths and achievements
4. **Gamification**: Award badges for concept mastery milestones
5. **Multi-modal Learning**: Track video, audio, and interactive content
6. **Predictive Analytics**: ML models to predict mastery likelihood
7. **Learning Style Detection**: Adapt content to visual/auditory/kinesthetic preferences

## Troubleshooting

### Issue: Mastery not updating
**Check:**
1. Trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_concept_mastery'`
2. User has correct permissions
3. success_rate is being passed correctly

### Issue: Vector search returns no results
**Check:**
1. pgvector extension is enabled
2. Embeddings have been generated
3. IVFFlat index has been trained (needs ~1000 vectors)

### Issue: Recommended concepts always empty
**Check:**
1. Knowledge graph has concepts with prerequisites defined
2. User has mastered some prerequisite concepts
3. Subject name matches exactly

## Support

For issues or feature requests, contact the development team or file an issue in the project repository.
