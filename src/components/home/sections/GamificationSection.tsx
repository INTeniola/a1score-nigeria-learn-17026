import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calculator, Zap, Users, FlaskConical, Globe, Star, Award } from "lucide-react";
const GamificationSection = () => {
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Celebrate Every Achievement
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Keep yourself motivated with badges, streaks, and friendly competition with other users.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default GamificationSection;