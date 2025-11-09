import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentSource {
  documentName: string;
  similarity: number;
  chunkIndex: number;
  content: string;
}

interface DocumentSourcesProps {
  sources: DocumentSource[];
}

const DocumentSources = ({ sources }: DocumentSourcesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const topSource = sources[0];
  const confidenceLevel = 
    topSource.similarity >= 90 ? "Very High" :
    topSource.similarity >= 80 ? "High" :
    topSource.similarity >= 70 ? "Medium" : "Low";

  const confidenceColor = 
    topSource.similarity >= 90 ? "bg-green-100 text-green-800" :
    topSource.similarity >= 80 ? "bg-blue-100 text-blue-800" :
    topSource.similarity >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800";

  return (
    <Card className="mt-3 p-4 bg-muted/50 border-primary/20">
      <div className="space-y-3">
        {/* Confidence Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Found in your {topSource.documentName}
          </span>
          <Badge variant="secondary" className={confidenceColor}>
            {confidenceLevel} Confidence ({topSource.similarity}%)
          </Badge>
        </div>

        {/* Sources List */}
        {isExpanded && (
          <div className="space-y-2 mt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Sources Used ({sources.length})
            </p>
            {sources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">
                      Source {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {source.documentName}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {source.similarity}% match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {source.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center gap-2 text-xs h-8"
        >
          {isExpanded ? (
            <>
              Hide sources <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all sources ({sources.length}) <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default DocumentSources;
