
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Trophy, Star } from "lucide-react";

interface CommunitySectionProps {
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const CommunitySection = ({ onShowAuth }: CommunitySectionProps) => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Join the A1Score Community
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with other students, share knowledge, and learn together in a supportive environment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6 mb-6 md:mb-10">
          {[
            { icon: Users, title: "Study Groups", description: "Join groups with classmates", count: "150+ Active Groups" },
            { icon: MessageCircle, title: "Ask Questions", description: "Get help from other students", count: "3K+ Questions Daily" },
            { icon: Trophy, title: "Friendly Competition", description: "Compete in academic challenges", count: "Weekly Contests" },
            { icon: Star, title: "Help Others", description: "Earn points by helping classmates", count: "Top Helper Awards" }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
                <CardHeader className="p-3 md:p-4 lg:p-6">
                  <Icon className="h-8 w-8 md:h-10 md:w-10 text-green-600 mx-auto mb-2 md:mb-3" />
                  <CardTitle className="text-sm md:text-base lg:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm mb-2 leading-relaxed">{feature.description}</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">{feature.count}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 md:p-6 lg:p-8 text-white text-center">
          <Users className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 md:mb-4 opacity-90" />
          <h4 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 leading-tight">Learn Better Together</h4>
          <p className="text-sm md:text-base opacity-90 mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who are helping each other succeed in school and prepare for university.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto min-h-11"
            onClick={() => onShowAuth('student')}
          >
            Join Our Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
