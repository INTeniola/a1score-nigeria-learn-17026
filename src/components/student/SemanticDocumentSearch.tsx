import { useState } from 'react';
import { useDocumentSearch } from '@/hooks/useDocumentSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Sparkles } from 'lucide-react';

export function SemanticDocumentSearch() {
  const { results, loading, searchDocuments } = useDocumentSearch();
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    await searchDocuments(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Semantic Document Search
        </CardTitle>
        <CardDescription>
          Find relevant content across all your documents using AI-powered search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question or search for concepts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Searching documents...
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            No results found. Try different keywords or upload more documents.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {results.length} relevant passages
            </p>
            
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{result.document_name}</span>
                    </div>
                    <Badge variant="outline">
                      {Math.round(result.similarity * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.content}</p>
                  
                  {result.concepts_covered && result.concepts_covered.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {result.concepts_covered.map((concept, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
