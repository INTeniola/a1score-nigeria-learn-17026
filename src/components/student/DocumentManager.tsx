import { DocumentUpload } from './DocumentUpload';
import { DocumentLibrary } from './DocumentLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Combined document management interface
 */
export function DocumentManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Manager</h1>
        <p className="text-muted-foreground">
          Upload and manage your study materials with AI-powered analysis
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="library">
          <DocumentLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
