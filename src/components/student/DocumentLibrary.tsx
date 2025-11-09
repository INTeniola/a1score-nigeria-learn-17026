import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Grid3x3,
  List,
  Download,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  useEffect(() => {
    loadDocuments();
    loadStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('document_changes')
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

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Delete "${doc.file_name}"? This will remove all associated data.`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete document record (chunks will cascade delete)
      const { error: dbError } = await supabase
        .from('user_documents' as any)
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const reprocessDocument = async (doc: Document) => {
    try {
      // Reset document status
      const { error: resetError } = await supabase
        .from('user_documents' as any)
        .update({
          upload_status: 'processing',
          processing_progress: 0,
          error_message: null
        })
        .eq('id', doc.id);

      if (resetError) throw resetError;

      // Trigger reprocessing
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
      loadDocuments();
    } catch (error) {
      console.error('Reprocess error:', error);
      toast.error('Failed to reprocess document');
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusBadge = (doc: Document) => {
    switch (doc.upload_status) {
      case 'completed':
        return <Badge variant="default">Ready</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing {doc.processing_progress}%</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.upload_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-12">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Library</h2>
        <p className="text-muted-foreground">Manage your uploaded documents</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_documents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.processing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chunks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_chunks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Tabs value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Ready</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload your first document to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className={viewMode === 'list' ? '' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(doc.file_type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{doc.file_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(doc)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
                  <div>Chunks: {doc.chunks_count}</div>
                </div>

                {doc.error_message && (
                  <div className="text-sm text-red-500">
                    Error: {doc.error_message}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadDocument(doc)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {doc.upload_status === 'failed' && (
                    <Button variant="outline" size="sm" onClick={() => reprocessDocument(doc)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDocument(doc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
