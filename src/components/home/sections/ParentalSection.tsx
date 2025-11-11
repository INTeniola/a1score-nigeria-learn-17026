
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageCircle, Shield, TrendingUp, Users, Star } from "lucide-react";

const ParentalSection = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Peace of Mind for Nigerian Parents
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stay connected with your child's education and feel confident about their academic progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {[
            {
              icon: Heart,
              title: "Watch Your Child Improve",
              description: "Get weekly reports showing exactly how your child is doing in each subject and where they need more help.",
              color: "text-pink-600"
            },
            {
              icon: MessageCircle,
              title: "Talk to Teachers Easily",
              description: "Direct messages with your child's teachers and automatic updates sent to your WhatsApp or SMS.",
              color: "text-blue-600"
            },
            {
              icon: Shield,
              title: "Safe Online Learning",
              description: "Content is filtered and appropriate. You can set time limits and see exactly what your child is learning.",
              color: "text-green-600"
            },
            {
              icon: TrendingUp,
              title: "See Real Progress",
              description: "Clear charts showing improvement in grades, study habits, and exam readiness over time.",
              color: "text-purple-600"
            },
            {
              icon: Users,
              title: "Support Learning at Home",
              description: "Get tips on how to help your child study better and resources for parents who want to be involved.",
              color: "text-orange-600"
            },
            {
              icon: Star,
              title: "Celebrate Success Together",
              description: "Get notifications when your child achieves something great or improves their performance.",
              color: "text-yellow-600"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                <CardHeader className="p-3 md:p-4 lg:p-6">
                  <Icon className={`h-8 w-8 md:h-10 md:w-10 ${feature.color} mb-2 md:mb-3`} />
                  <CardTitle className="text-sm md:text-base lg:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ParentalSection;
