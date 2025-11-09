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
  CheckCircle, 
  DollarSign 
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
    { 
      icon: DollarSign, 
      title: "Earn While Teaching", 
      description: "Help students succeed while earning extra income. Validate answers, create content, and build your reputation.",
      gradient: "from-emerald-600 to-green-600"
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Academic Success
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            From homework help to exam preparation, A1Score supports students, parents, and teachers every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border bg-card"
              >
                <CardHeader className="space-y-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground leading-relaxed">
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
