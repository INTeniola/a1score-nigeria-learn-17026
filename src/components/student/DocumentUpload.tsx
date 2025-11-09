import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  documentId?: string;
  error?: string;
  estimatedTime?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export function DocumentUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, DOCX, or images (PNG/JPG).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }
    return null;
  };

  const estimateProcessingTime = (fileSize: number, fileType: string): string => {
    // Rough estimates based on file type and size
    const sizeMB = fileSize / 1024 / 1024;
    let timeSeconds = 10; // Base time

    if (fileType === 'application/pdf') {
      timeSeconds += sizeMB * 5; // ~5 sec per MB for PDFs
    } else if (fileType.startsWith('image/')) {
      timeSeconds += sizeMB * 10; // ~10 sec per MB for OCR
    } else {
      timeSeconds += sizeMB * 3;
    }

    if (timeSeconds < 60) {
      return `~${Math.ceil(timeSeconds)} seconds`;
    }
    return `~${Math.ceil(timeSeconds / 60)} minutes`;
  };

  const uploadFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
      estimatedTime: estimateProcessingTime(file.size, file.type)
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Simulate progress during upload
      const uploadPromise = supabase.storage
        .from('documents')
        .upload(filePath, file);

      // Update progress UI while uploading
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f => {
            if (f.file === file && f.progress < 30) {
              return { ...f, progress: Math.min(f.progress + 5, 30) };
            }
            return f;
          })
        );
      }, 200);

      const { error: uploadError } = await uploadPromise;
      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          upload_status: 'processing'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update with document ID
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, progress: 40, status: 'processing', documentId: document.id }
            : f
        )
      );

      // Trigger processing edge function
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          documentId: document.id,
          fileName: file.name,
          storagePath: filePath,
          fileType: file.type
        }
      });

      if (processError) throw processError;

      // Poll for processing status
      const checkStatus = async () => {
        const { data: doc } = await supabase
          .from('user_documents')
          .select('upload_status, processing_progress, error_message')
          .eq('id', document.id)
          .single();

        if (!doc) return;

        setUploadingFiles(prev =>
          prev.map(f =>
            f.documentId === document.id
              ? {
                  ...f,
                  progress: doc.processing_progress || 40,
                  status: doc.upload_status === 'completed' ? 'complete' :
                         doc.upload_status === 'failed' ? 'error' : 'processing',
                  error: doc.error_message || undefined
                }
              : f
          )
        );

        if (doc.upload_status === 'completed') {
          toast.success(`Document "${file.name}" processed successfully!`);
        } else if (doc.upload_status === 'failed') {
          toast.error(`Failed to process "${file.name}": ${doc.error_message}`);
        } else if (doc.upload_status === 'processing') {
          setTimeout(checkStatus, 2000); // Poll every 2 seconds
        }
      };

      setTimeout(checkStatus, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      uploadFile(file);
    });
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (upload: UploadingFile): string => {
    switch (upload.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return `Processing... (${upload.estimatedTime})`;
      case 'complete':
        return 'Ready';
      case 'error':
        return upload.error || 'Failed';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload PDFs, Word documents, or images for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            PDF, DOCX, PNG, JPG up to 50MB
          </p>
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = ACCEPTED_TYPES.join(',');
              input.onchange = (e) =>
                handleFileSelect((e.target as HTMLInputElement).files);
              input.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>

        {/* Upload Queue */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Processing Queue</h3>
            {uploadingFiles.map((upload, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{upload.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <Badge
                      variant={
                        upload.status === 'complete' ? 'default' :
                        upload.status === 'error' ? 'destructive' : 'secondary'
                      }
                    >
                      {getStatusText(upload)}
                    </Badge>
                    {(upload.status === 'complete' || upload.status === 'error') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(upload.file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={upload.progress} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
