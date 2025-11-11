
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, FlaskConical, BookOpen, 
  Brain, Zap, FileSearch, BookMarked
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import TutorSelection from "./TutorSelection";
import TutorHeader from "./TutorHeader";
import ChatMessage from "./ChatMessage";
import TutorTypingIndicator from "./TutorTypingIndicator";
import MessageInput from "./MessageInput";

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

interface TutorPersonality {
  id: string;
  name: string;
  subject: string;
  personality: string;
  greeting: string;
  icon: any;
  color: string;
  expertise: string[];
}

const AITutorChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorPersonality | null>(null);
  const [conversationMemory, setConversationMemory] = useState<{[key: string]: any}>({});
  const [useDocuments, setUseDocuments] = useState(false);
  const [isSearchingDocuments, setIsSearchingDocuments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tutorPersonalities: TutorPersonality[] = [
    {
      id: 'math-mentor',
      name: 'Professor Adeyemi',
      subject: 'Mathematics',
      personality: 'patient and methodical',
      greeting: 'Hello! I\'m Professor Adeyemi, your Mathematics tutor. I love breaking down complex problems into simple steps. What mathematical challenge can we solve together today?',
      icon: Calculator,
      color: 'bg-blue-100 text-blue-700',
      expertise: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'JAMB Math']
    },
    {
      id: 'physics-guru',
      name: 'Dr. Kemi',
      subject: 'Physics',
      personality: 'enthusiastic and practical',
      greeting: 'Hey there! Dr. Kemi here, ready to make Physics exciting! I connect every concept to real-world applications. What aspect of our physical world shall we explore?',
      icon: Zap,
      color: 'bg-purple-100 text-purple-700',
      expertise: ['Mechanics', 'Electricity', 'Waves', 'Modern Physics', 'WAEC Physics']
    },
    {
      id: 'chemistry-expert',
      name: 'Mr. Emeka',
      subject: 'Chemistry',
      personality: 'detail-oriented and encouraging',
      greeting: 'Welcome! I\'m Mr. Emeka, your Chemistry guide. Chemistry is like cooking - it\'s all about the right ingredients and reactions! What reaction can we study today?',
      icon: FlaskConical,
      color: 'bg-green-100 text-green-700',
      expertise: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'JAMB Chemistry']
    },
    {
      id: 'english-coach',
      name: 'Mrs. Fatima',
      subject: 'English',
      personality: 'articulate and supportive',
      greeting: 'Good day! I\'m Mrs. Fatima, your English Language coach. I\'m here to help you master grammar, essays, and literature. How can I help you express yourself better today?',
      icon: BookOpen,
      color: 'bg-orange-100 text-orange-700',
      expertise: ['Grammar', 'Essay Writing', 'Literature', 'WAEC English', 'JAMB English']
    },
    {
      id: 'general-ai',
      name: 'AIDA',
      subject: 'General Studies',
      personality: 'adaptive and knowledgeable',
      greeting: 'Hi! I\'m AIDA, your AI learning assistant. I can help with any subject and adapt to your learning style. What would you like to learn today?',
      icon: Brain,
      color: 'bg-pink-100 text-pink-700',
      expertise: ['Cross-subject support', 'Study strategies', 'Exam preparation', 'Learning techniques']
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation memory from localStorage
    const savedMemory = localStorage.getItem('aiTutorMemory');
    if (savedMemory) {
      setConversationMemory(JSON.parse(savedMemory));
    }
  }, []);

  const saveConversationMemory = (memory: any) => {
    setConversationMemory(memory);
    localStorage.setItem('aiTutorMemory', JSON.stringify(memory));
  };

  const selectTutor = (tutor: TutorPersonality) => {
    setSelectedTutor(tutor);
    const greeting: Message = {
      id: Date.now(),
      type: 'ai',
      content: tutor.greeting,
      timestamp: new Date(),
      subject: tutor.subject,
      tutorPersonality: tutor.name
    };
    setMessages([greeting]);
    
    // Update conversation memory
    const newMemory = {
      ...conversationMemory,
      selectedTutor: tutor.id,
      lastInteraction: new Date().toISOString(),
      preferences: {
        ...conversationMemory.preferences,
        preferredSubject: tutor.subject
      }
    };
    saveConversationMemory(newMemory);
  };

  const generateAIResponse = async (userMessage: string): Promise<{ response: string; sources?: any[]; usedDocuments?: boolean }> => {
    const tutor = selectedTutor || tutorPersonalities[4]; // Default to AIDA
    
    try {
      setIsTyping(true);
      
      // Show document search indicator if enabled
      if (useDocuments) {
        setIsSearchingDocuments(true);
      }
      
      const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
        body: {
          message: userMessage,
          tutorId: tutor.id,
          subject: tutor.subject,
          useDocuments: useDocuments,
          conversationContext: {
            personality: tutor.personality,
            expertise: tutor.expertise,
            greeting: tutor.greeting
          }
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      setIsSearchingDocuments(false);

      if (error) {
        console.error('AI tutor error:', error);
        return { 
          response: `I apologize, but I'm having trouble connecting right now. As ${tutor.name}, I want to help you with ${tutor.subject}. Could you try asking your question again in a moment?`
        };
      }

      return {
        response: data.response || `Hi! I'm ${tutor.name}, your ${tutor.subject} tutor. I'm here to help you succeed! What would you like to learn about today?`,
        sources: data.sources,
        usedDocuments: data.usedDocuments
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsSearchingDocuments(false);
      return { 
        response: `I'm ${tutor.name}, and I'm excited to help you with ${tutor.subject}! There seems to be a connection issue, but let's work through this together. What topic are you studying?`
      };
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponseData = await generateAIResponse(text);
    const aiMessage: Message = {
      id: messages.length + 2,
      type: 'ai',
      content: aiResponseData.response,
      timestamp: new Date(),
      subject: selectedTutor?.subject,
      tutorPersonality: selectedTutor?.name,
      sources: aiResponseData.sources,
      usedDocuments: aiResponseData.usedDocuments
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 container-padding">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl lg:text-2xl">🎓 AI Chat Tutor</CardTitle>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Choose your personal tutor and get instant help with any subject
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-3 md:space-y-4">
          {/* Tutor Selection */}
          {!selectedTutor && (
            <TutorSelection 
              tutorPersonalities={tutorPersonalities}
              onSelectTutor={selectTutor}
            />
          )}

          {/* Active Chat */}
          {selectedTutor && (
            <>
              {/* Tutor Header */}
              <TutorHeader 
                selectedTutor={selectedTutor}
                conversationMemory={conversationMemory}
                onSwitchTutor={() => setSelectedTutor(null)}
              />

              {/* Document Search Toggle */}
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-1">
                      <BookMarked className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="use-documents" className="text-xs md:text-sm font-medium cursor-pointer leading-relaxed">
                          Search My Documents
                        </Label>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                          Answer from your uploaded PDFs
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="use-documents"
                      checked={useDocuments}
                      onCheckedChange={setUseDocuments}
                      className="flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Chat Messages */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-[calc(100vh-20rem)] md:h-96 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id}
                        message={message}
                        selectedTutor={selectedTutor}
                      />
                    ))}
                    
                    {/* Searching Documents Indicator */}
                    {isSearchingDocuments && (
                      <Alert className="border-primary bg-primary/5">
                        <FileSearch className="h-4 w-4 text-primary animate-pulse" />
                        <AlertDescription className="text-xs md:text-sm">
                          Searching your documents...
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {isTyping && !isSearchingDocuments && (
                      <TutorTypingIndicator selectedTutor={selectedTutor} />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <MessageInput 
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    onSendMessage={handleSendMessage}
                    selectedTutor={selectedTutor}
                    isTyping={isTyping}
                  />
                </CardContent>
              </Card>
            </>
          )}
      </div>
    </div>
  );
};

export default AITutorChat;
