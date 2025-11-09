import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  LearningInteraction,
  ConceptMastery,
  KnowledgeGraphConcept,
  RecommendedConcept,
  WeakArea,
  LearningAnalyticsSummary,
  CreateLearningInteractionParams
} from '@/types/learning-graph';

export function useLearningGraph() {
  const [concepts, setConcepts] = useState<KnowledgeGraphConcept[]>([]);
  const [masteryData, setMasteryData] = useState<ConceptMastery[]>([]);
  const [interactions, setInteractions] = useState<LearningInteraction[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningGraph();
  }, []);

  const loadLearningGraph = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load knowledge graph concepts
      const { data: conceptsData, error: conceptsError } = await supabase
        .from('knowledge_graph' as any)
        .select('*')
        .order('difficulty_rating', { ascending: true });

      if (conceptsError) throw conceptsError;

      // Load user's concept mastery
      const { data: masteryDataResult, error: masteryError } = await supabase
        .from('concept_mastery' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('mastery_level', { ascending: false });

      if (masteryError) throw masteryError;

      // Load recent interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('learning_interactions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (interactionsError) throw interactionsError;

      setConcepts((conceptsData || []) as unknown as KnowledgeGraphConcept[]);
      setMasteryData((masteryDataResult || []) as unknown as ConceptMastery[]);
      setInteractions((interactionsData || []) as unknown as LearningInteraction[]);

      // Load analytics summary
      await loadAnalytics(user.id);
    } catch (error) {
      console.error('Error loading learning graph:', error);
      toast.error('Failed to load learning graph');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (userId: string) => {
    try {
      // Get recommended concepts
      const recommendedResult = await (supabase as any)
        .rpc('get_recommended_concepts', {
          p_user_id: userId,
          p_subject: 'Mathematics',
          p_mastery_threshold: 70
        });

      const recommended = recommendedResult.error ? null : recommendedResult.data;

      // Get weak areas
      const weakAreasResult = await (supabase as any)
        .rpc('get_weak_areas', {
          p_user_id: userId,
          p_limit: 5
        });

      const weakAreas = weakAreasResult.error ? null : weakAreasResult.data;

      // Get learning velocity
      const velocityResult = await (supabase as any)
        .rpc('get_learning_velocity', {
          p_user_id: userId,
          p_weeks: 4
        });

      const velocity = velocityResult.error ? null : velocityResult.data;

      // Calculate other metrics
      const totalInteractions = interactions.length;
      const averageSuccessRate = interactions.length > 0
        ? interactions.reduce((sum, i) => sum + (i.success_rate || 0), 0) / interactions.length
        : 0;
      
      const conceptsMastered = masteryData.filter(m => m.mastery_level >= 70).length;
      const conceptsInProgress = masteryData.filter(m => m.mastery_level < 70).length;
      
      const totalStudyTime = interactions.reduce((sum, i) => sum + i.time_spent, 0) / 60; // to minutes

      setAnalytics({
        totalInteractions,
        averageSuccessRate,
        learningVelocity: velocity || 0,
        conceptsMastered,
        conceptsInProgress,
        weakAreas: weakAreas || [],
        recommendedConcepts: recommended || [],
        studyStreak: 0, // TODO: Calculate from learning_sessions
        totalStudyTime
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const trackInteraction = async (params: CreateLearningInteractionParams): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('learning_interactions' as any)
        .insert({
          user_id: user.id,
          ...params
        });

      if (error) throw error;

      // Reload data to reflect updates from triggers
      await loadLearningGraph();
      
      toast.success('Progress tracked!');
    } catch (error) {
      console.error('Error tracking interaction:', error);
      toast.error('Failed to track progress');
    }
  };

  const getConceptById = (conceptId: string): KnowledgeGraphConcept | undefined => {
    return concepts.find(c => c.concept_id === conceptId);
  };

  const getMasteryForConcept = (conceptId: string): ConceptMastery | undefined => {
    return masteryData.find(m => m.concept_id === conceptId);
  };

  const getPrerequisiteConcepts = (conceptId: string): KnowledgeGraphConcept[] => {
    const concept = getConceptById(conceptId);
    if (!concept?.prerequisite_concepts) return [];

    return concept.prerequisite_concepts
      .map(id => getConceptById(id))
      .filter((c): c is KnowledgeGraphConcept => c !== undefined);
  };

  const getRelatedConcepts = (conceptId: string): KnowledgeGraphConcept[] => {
    const concept = getConceptById(conceptId);
    if (!concept?.related_concepts) return [];

    return concept.related_concepts
      .map(id => getConceptById(id))
      .filter((c): c is KnowledgeGraphConcept => c !== undefined);
  };

  const isPrerequisiteMet = (prerequisiteId: string): boolean => {
    const mastery = getMasteryForConcept(prerequisiteId);
    return mastery ? mastery.mastery_level >= 70 : false;
  };

  const areAllPrerequisitesMet = (conceptId: string): boolean => {
    const prerequisites = getPrerequisiteConcepts(conceptId);
    if (prerequisites.length === 0) return true;
    
    return prerequisites.every(prereq => isPrerequisiteMet(prereq.concept_id));
  };

  return {
    concepts,
    masteryData,
    interactions,
    analytics,
    loading,
    trackInteraction,
    getConceptById,
    getMasteryForConcept,
    getPrerequisiteConcepts,
    getRelatedConcepts,
    isPrerequisiteMet,
    areAllPrerequisitesMet,
    refreshGraph: loadLearningGraph
  };
}
