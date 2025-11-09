import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  upload_status: string;
  processing_progress: number;
  error_message?: string;
  chunks_count: number;
  created_at: string;
  processing_metadata?: any;
}

interface DocumentStats {
  total_documents: number;
  processing: number;
  completed: number;
  failed: number;
  total_chunks: number;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
    loadStats();

    // Subscribe to document changes
    const channel = supabase
      .channel('document_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_documents'
      }, () => {
        loadDocuments();
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_documents' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments((data || []) as unknown as Document[]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any).rpc('get_document_stats', {
        p_user_id: user.id
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const deleteDocument = async (documentId: string, storagePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete document record (chunks cascade delete)
      const { error: dbError } = await supabase
        .from('user_documents' as any)
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      await loadDocuments();
      await loadStats();
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
      return false;
    }
  };

  const reprocessDocument = async (doc: Document): Promise<boolean> => {
    try {
      // Reset status
      const { error: resetError } = await supabase
        .from('user_documents' as any)
        .update({
          upload_status: 'processing',
          processing_progress: 0,
          error_message: null,
          retry_count: doc.processing_metadata?.retry_count || 0 + 1
        })
        .eq('id', doc.id);

      if (resetError) throw resetError;

      // Trigger processing
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          documentId: doc.id,
          fileName: doc.file_name,
          storagePath: doc.storage_path,
          fileType: doc.file_type
        }
      });

      if (processError) throw processError;

      toast.success('Document reprocessing started');
      return true;
    } catch (error) {
      console.error('Reprocess error:', error);
      toast.error('Failed to reprocess document');
      return false;
    }
  };

  const downloadDocument = async (storagePath: string, fileName: string): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const searchDocuments = async (query: string): Promise<Document[]> => {
    if (!query.trim()) return documents;

    return documents.filter(doc =>
      doc.file_name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    documents,
    stats,
    loading,
    deleteDocument,
    reprocessDocument,
    downloadDocument,
    searchDocuments,
    refreshDocuments: loadDocuments,
    refreshStats: loadStats
  };
}
