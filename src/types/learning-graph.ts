/**
 * Learning Graph System Type Definitions
 */

/**
 * Learning interaction tracking
 */
export interface LearningInteraction {
  id: string;
  user_id: string;
  question: string;
  answer?: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  time_spent: number; // seconds
  success_rate?: number; // 0-100
  confidence_level?: 1 | 2 | 3 | 4 | 5;
  interaction_type: 'quiz' | 'practice' | 'ai_chat' | 'review';
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Concept mastery tracking
 */
export interface ConceptMastery {
  id: string;
  user_id: string;
  concept_id: string;
  concept_name: string;
  subject: string;
  mastery_level: number; // 0-100
  confidence_score?: number; // 0-100
  last_reviewed?: string;
  next_review_date?: string;
  total_interactions: number;
  successful_interactions: number;
  created_at: string;
  updated_at: string;
}

/**
 * Knowledge graph concept node
 */
export interface KnowledgeGraphConcept {
  id: string;
  concept_id: string;
  concept_name: string;
  subject: string;
  description?: string;
  difficulty_rating?: number; // 1-10
  prerequisite_concepts?: string[];
  related_concepts?: string[];
  learning_objectives?: string[];
  estimated_learning_time?: number; // minutes
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Enhanced document chunk with embeddings
 */
export interface DocumentChunkWithEmbedding {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding_vector?: number[];
  chunk_summary?: string;
  concepts_covered?: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Recommended concept for learning
 */
export interface RecommendedConcept {
  concept_id: string;
  concept_name: string;
  difficulty_rating: number;
  prerequisites_met: boolean;
}

/**
 * Weak area needing practice
 */
export interface WeakArea {
  concept_name: string;
  subject: string;
  mastery_level: number;
  last_reviewed?: string;
  needs_review: boolean;
}

/**
 * Learning path node
 */
export interface LearningPathNode {
  concept: KnowledgeGraphConcept;
  mastery?: ConceptMastery;
  isPrerequisite: boolean;
  isRelated: boolean;
  isRecommended: boolean;
}

/**
 * Learning analytics summary
 */
export interface LearningAnalyticsSummary {
  totalInteractions: number;
  averageSuccessRate: number;
  learningVelocity: number; // concepts per week
  conceptsMastered: number;
  conceptsInProgress: number;
  weakAreas: WeakArea[];
  recommendedConcepts: RecommendedConcept[];
  studyStreak: number;
  totalStudyTime: number; // minutes
}

/**
 * Concept graph visualization data
 */
export interface ConceptGraphData {
  nodes: {
    id: string;
    label: string;
    mastery: number;
    difficulty: number;
    category: string;
  }[];
  edges: {
    source: string;
    target: string;
    type: 'prerequisite' | 'related';
  }[];
}

/**
 * Learning interaction creation params
 */
export interface CreateLearningInteractionParams {
  question: string;
  answer?: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  time_spent: number;
  success_rate?: number;
  confidence_level?: 1 | 2 | 3 | 4 | 5;
  interaction_type: 'quiz' | 'practice' | 'ai_chat' | 'review';
  metadata?: Record<string, any>;
}

/**
 * Concept creation params
 */
export interface CreateConceptParams {
  concept_name: string;
  subject: string;
  description?: string;
  difficulty_rating?: number;
  prerequisite_concepts?: string[];
  related_concepts?: string[];
  learning_objectives?: string[];
  estimated_learning_time?: number;
  tags?: string[];
}
