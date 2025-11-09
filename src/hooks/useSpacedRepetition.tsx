import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpacedRepetitionCard {
  id: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at?: string;
}

type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5; // 0=complete failure, 5=perfect recall

export function useSpacedRepetition() {
  const [cards, setCards] = useState<SpacedRepetitionCard[]>([]);
  const [dueCards, setDueCards] = useState<SpacedRepetitionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('spaced_repetition_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('next_review_date', { ascending: true });

      if (error) throw error;

      const allCards = data || [];
      const now = new Date().toISOString();
      const due = allCards.filter(card => card.next_review_date <= now);

      setCards(allCards);
      setDueCards(due);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Failed to load study cards');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (
    subject: string,
    topic: string,
    question: string,
    answer: string
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('spaced_repetition_cards')
        .insert({
          user_id: user.id,
          subject,
          topic,
          question,
          answer,
          difficulty: 0,
          ease_factor: 2.5,
          interval_days: 0,
          repetitions: 0,
          next_review_date: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Study card created!');
      await loadCards();
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create study card');
    }
  };

  const reviewCard = async (
    cardId: string,
    quality: ReviewQuality
  ): Promise<void> => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) return;

      // SM-2 Algorithm (SuperMemo 2)
      let newEaseFactor = card.ease_factor;
      let newInterval = card.interval_days;
      let newRepetitions = card.repetitions;

      if (quality >= 3) {
        // Correct response
        if (card.repetitions === 0) {
          newInterval = 1;
        } else if (card.repetitions === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(card.interval_days * card.ease_factor);
        }
        newRepetitions = card.repetitions + 1;
      } else {
        // Incorrect response - restart
        newRepetitions = 0;
        newInterval = 1;
      }

      // Update ease factor
      newEaseFactor = card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
      }

      // Calculate next review date
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      const { error } = await supabase
        .from('spaced_repetition_cards')
        .update({
          ease_factor: newEaseFactor,
          interval_days: newInterval,
          repetitions: newRepetitions,
          next_review_date: nextReviewDate.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          difficulty: quality < 3 ? card.difficulty + 1 : Math.max(0, card.difficulty - 1)
        })
        .eq('id', cardId);

      if (error) throw error;

      await loadCards();
    } catch (error) {
      console.error('Error reviewing card:', error);
      toast.error('Failed to save review');
    }
  };

  const deleteCard = async (cardId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('spaced_repetition_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      toast.success('Card deleted');
      await loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  const getDueCardsBySubject = (subject: string): SpacedRepetitionCard[] => {
    return dueCards.filter(card => card.subject === subject);
  };

  return {
    cards,
    dueCards,
    loading,
    createCard,
    reviewCard,
    deleteCard,
    getDueCardsBySubject,
    refreshCards: loadCards
  };
}
