
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Users, Brain, BookOpen, Building2 } from "lucide-react";
import LiveChatWidget from "@/components/support/LiveChatWidget";
import HelpCenterModal from "@/components/support/HelpCenterModal";

const SupportSection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  return (
    <>
    <section className="py-8 md:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Help is Always Available
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Whether you need technical help or academic support, we're here for you 24 hours a day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {[
            {
              icon: MessageCircle,
              title: "Chat with Us Anytime",
              description: "Get instant help from our support team in English or any Nigerian language you prefer.",
              color: "text-blue-600"
            },
            {
              icon: HelpCircle,
              title: "Easy-to-Follow Guides",
              description: "Step-by-step instructions and answers to common questions, all written in simple language.",
              color: "text-green-600"
            },
            {
              icon: Users,
              title: "Community Support",
              description: "Ask questions and get answers from other students, parents, and teachers in Nigeria.",
              color: "text-purple-600"
            },
            {
              icon: Brain,
              title: "Smart Help Assistant",
              description: "Our AI can answer simple questions immediately, any time of day or night.",
              color: "text-orange-600"
            },
            {
              icon: BookOpen,
              title: "Video Tutorials",
              description: "Watch short videos that show you exactly how to use every feature of the platform.",
              color: "text-red-600"
            },
            {
              icon: Building2,
              title: "School Support Team",
              description: "Special support for teachers and school administrators, including training and setup help.",
              color: "text-teal-600"
            }
          ].map((support, index) => {
            const Icon = support.icon;
            return (
              <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                <CardHeader className="p-3 md:p-4 lg:p-6">
                  <Icon className={`h-8 w-8 md:h-10 md:w-10 ${support.color} mb-2 md:mb-3`} />
                  <CardTitle className="text-sm md:text-base lg:text-lg">{support.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{support.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 lg:p-8">
            <MessageCircle className="h-12 w-12 md:h-14 md:w-14 text-green-600 mx-auto mb-3 md:mb-4" />
            <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3 leading-tight">Need Help Right Now?</h4>
            <p className="text-gray-600 text-xs md:text-sm mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
              Don't worry if you're stuck or confused. Our friendly support team is ready to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-11"
                onClick={() => setIsChatOpen(true)}
              >
                Start Live Chat
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto min-h-11"
                onClick={() => setIsHelpCenterOpen(true)}
              >
                Browse Help Center
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <LiveChatWidget 
      isOpen={isChatOpen} 
      onClose={() => setIsChatOpen(false)} 
    />
    
    <HelpCenterModal 
      isOpen={isHelpCenterOpen} 
      onClose={() => setIsHelpCenterOpen(false)} 
    />
    </>
  );
};

export default SupportSection;
