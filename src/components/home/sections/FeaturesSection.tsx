import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle, 
  BookOpen, 
  ClipboardCheck, 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Globe, 
  CheckCircle
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    { 
      icon: MessageCircle, 
      title: "24/7 AI Tutor", 
      description: "Get instant help in any subject, anytime you need it",
      gradient: "from-primary to-purple-600"
    },
    { 
      icon: BookOpen, 
      title: "Smart Homework Helper", 
      description: "Get step-by-step solutions for Math, Physics, Chemistry, and English. Never get stuck on assignments again.",
      gradient: "from-green-600 to-teal-600"
    },
    { 
      icon: ClipboardCheck, 
      title: "Exam Preparation", 
      description: "Practice with real past questions and track your improvement. Identify weak areas before exam day.",
      gradient: "from-blue-600 to-cyan-600"
    },
    { 
      icon: Target, 
      title: "Personalized Study Plans", 
      description: "AI adapts to your learning style and pace, creating custom study schedules",
      gradient: "from-orange-600 to-amber-600"
    },
    { 
      icon: TrendingUp, 
      title: "Progress Tracking", 
      description: "See exactly how you're performing with detailed reports on study time, scores, and areas for improvement.",
      gradient: "from-purple-600 to-pink-600"
    },
    { 
      icon: Award, 
      title: "Gamified Learning", 
      description: "Earn points, badges, and compete on leaderboards while you learn",
      gradient: "from-yellow-600 to-orange-600"
    },
    { 
      icon: Users, 
      title: "Study Communities", 
      description: "Connect with peers, form study groups, and learn together",
      gradient: "from-pink-600 to-rose-600"
    },
    { 
      icon: Globe, 
      title: "Multiple Languages", 
      description: "Available in English, Yoruba, Hausa, Igbo, and Pidgin. Learn in the language that works best for you.",
      gradient: "from-teal-600 to-emerald-600"
    },
    { 
      icon: CheckCircle, 
      title: "Curriculum Aligned", 
      description: "Built for local education standards with familiar examples and content that matches your syllabus.",
      gradient: "from-indigo-600 to-blue-600"
    },
  ];

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2 md:space-y-3">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            Everything You Need for Academic Success
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From homework help to exam preparation, A1Score supports students, parents, and teachers every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border bg-card overflow-hidden"
              >
                <CardHeader className="space-y-2 md:space-y-3 p-3 md:p-4 lg:p-6">
                  <div className={`h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                    <Icon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
