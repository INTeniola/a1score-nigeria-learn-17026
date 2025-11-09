import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SearchResult {
  document_id: string;
  content: string;
  similarity: number;
  concepts_covered?: string[];
  chunk_summary?: string;
  document_name?: string;
}

/**
 * Hook for semantic document search
 */
export function useDocumentSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Generate embedding for search query using OpenAI
   */
  const generateQueryEmbedding = async (query: string): Promise<number[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text: query }
      });

      if (error) throw error;
      return data.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate search embedding');
    }
  };

  /**
   * Search documents using semantic similarity
   */
  const searchDocuments = async (query: string, limit: number = 5): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate embedding for query
      const queryEmbedding = await generateQueryEmbedding(query);

      // Search using vector similarity
      const { data, error } = await (supabase as any).rpc('search_document_chunks', {
        p_user_id: user.id,
        p_query_embedding: queryEmbedding,
        p_limit: limit
      });

      if (error) throw error;

      // Enhance results with document names
      const enhancedResults: SearchResult[] = [];
      for (const result of (data || [])) {
        const { data: doc } = await (supabase as any)
          .from('user_documents')
          .select('file_name')
          .eq('id', result.document_id)
          .single();

        enhancedResults.push({
          ...result,
          document_name: (doc as any)?.file_name
        });
      }

      setResults(enhancedResults);
      return enhancedResults;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Document search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get relevant context for AI tutor from documents
   */
  const getRelevantContext = async (question: string, topK: number = 3): Promise<string> => {
    try {
      const searchResults = await searchDocuments(question, topK);
      
      if (searchResults.length === 0) return '';

      const context = searchResults
        .map(
          (result, idx) =>
            `[Document: ${result.document_name} - Relevance: ${(result.similarity * 100).toFixed(0)}%]\n${result.content}`
        )
        .join('\n\n---\n\n');

      return context;
    } catch (error) {
      console.error('Context retrieval error:', error);
      return '';
    }
  };

  return {
    results,
    loading,
    searchDocuments,
    getRelevantContext
  };
}
