
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  selectedTutor: TutorPersonalityData;
  isTyping: boolean;
}

const MessageInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  selectedTutor, 
  isTyping 
}: MessageInputProps) => {
  return (
    <div className="border-t p-3 md:p-4 bg-card">
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${selectedTutor.name} about ${selectedTutor.subject}...`}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
          className="flex-1 h-11 md:h-10 text-sm md:text-base p-3 md:p-2"
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!inputMessage.trim() || isTyping}
          className="min-h-11 min-w-11 md:min-h-10 md:min-w-10 flex-shrink-0"
          size="icon"
        >
          <Send className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
