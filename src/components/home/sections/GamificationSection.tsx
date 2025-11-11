import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calculator, Zap, Users, FlaskConical, Globe, Star, Award } from "lucide-react";
const GamificationSection = () => {
  return <section className="py-8 md:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Celebrate Every Achievement
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Keep yourself motivated with badges, streaks, and friendly competition with other users.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {[{
          name: "JAMB Ready",
          icon: Trophy,
          description: "Score 250+ in practice tests",
          color: "bg-yellow-500"
        }, {
          name: "Math Champion",
          icon: Calculator,
          description: "Solve 50 math problems correctly",
          color: "bg-blue-500"
        }, {
          name: "Study Streak",
          icon: Zap,
          description: "Study for 7 days straight",
          color: "bg-orange-500"
        }, {
          name: "Helpful Friend",
          icon: Users,
          description: "Help 5 classmates with homework",
          color: "bg-green-500"
        }, {
          name: "Science Star",
          icon: FlaskConical,
          description: "Master all physics topics",
          color: "bg-purple-500"
        }, {
          name: "Language Master",
          icon: Globe,
          description: "Ace English comprehension",
          color: "bg-teal-500"
        }, {
          name: "Night Scholar",
          icon: Star,
          description: "Study consistently after school",
          color: "bg-indigo-500"
        }, {
          name: "Perfect Score",
          icon: Award,
          description: "Get 100% in any subject test",
          color: "bg-pink-500"
        }].map((achievement, index) => {
          const Icon = achievement.icon;
          return <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardHeader className="text-center p-3 md:p-4 lg:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base lg:text-lg">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm">{achievement.description}</p>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default GamificationSection;