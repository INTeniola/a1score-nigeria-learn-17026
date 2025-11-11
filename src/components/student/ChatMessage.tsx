import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import AITransparencyBadge from "@/components/ethics/AITransparencyBadge";
import DocumentSources from "./DocumentSources";

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  subject?: string;
  tutorPersonality?: string;
  sources?: Array<{
    documentName: string;
    similarity: number;
    chunkIndex: number;
    content: string;
  }>;
  usedDocuments?: boolean;
}

interface TutorPersonalityData {
  id: string;
  name: string;
  subject: string;
  personality: string;
  greeting: string;
  icon: any;
  color: string;
  expertise: string[];
}

interface ChatMessageProps {
  message: Message;
  selectedTutor?: TutorPersonalityData | null;
}

const ChatMessage = ({ message, selectedTutor }: ChatMessageProps) => {
  return (
    <div className="space-y-2">
      {message.type === 'ai' && (
        <AITransparencyBadge 
          isAIResponse={true}
          confidence={Math.floor(Math.random() * 20) + 80}
          requiresHumanReview={Math.random() < 0.2}
          className="mb-2"
        />
      )}
      
      <div className={`flex gap-2 md:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-2 md:gap-3 max-w-[85%] md:max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className={`h-6 w-6 md:h-8 md:w-8 flex-shrink-0 ${message.type === 'user' ? 'bg-green-100' : selectedTutor?.color}`}>
            <AvatarFallback>
              {message.type === 'user' ? 
                <User className="h-3 w-3 md:h-4 md:w-4 text-green-600" /> : 
                selectedTutor && <selectedTutor.icon className="h-3 w-3 md:h-4 md:w-4" />
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className={`p-2 md:p-4 rounded-lg ${
              message.type === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words">{message.content}</div>
              {message.tutorPersonality && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {message.tutorPersonality}
                </Badge>
              )}
            </div>
            
            {/* Display document sources for AI messages */}
            {message.type === 'ai' && message.sources && message.sources.length > 0 && (
              <DocumentSources sources={message.sources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
