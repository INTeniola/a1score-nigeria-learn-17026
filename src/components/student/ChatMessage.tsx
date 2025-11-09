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
          confidence={Math.floor(Math.random() * 20) + 80} // Random confidence 80-100%
          requiresHumanReview={Math.random() < 0.2} // 20% chance needs review
          className="mb-2"
        />
      )}
      
      <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className={message.type === 'user' ? 'bg-green-100' : selectedTutor?.color}>
            <AvatarFallback>
              {message.type === 'user' ? 
                <User className="h-4 w-4 text-green-600" /> : 
                selectedTutor && <selectedTutor.icon className="h-4 w-4" />
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className={`p-4 rounded-lg ${
              message.type === 'user' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.tutorPersonality && (
                <Badge variant="secondary" className="mt-2">
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
