
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Building2, Users, GraduationCap, TrendingUp } from "lucide-react";

const InstitutionalSection = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Transform Your School's Performance
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Help your students perform better while reducing teaching costs. Designed for Nigerian schools of all sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center mb-8 md:mb-12">
          <div>
            <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-5">What Schools Get</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                "Better WAEC and JAMB results for your students",
                "Reduced need for expensive extra lessons",
                "Detailed reports on each student's progress",
                "Support for teachers to improve their methods",
                "24/7 homework help for all students",
                "Custom setup for your school's curriculum",
                "Training and ongoing support included",
                "Affordable pricing that fits school budgets"
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-xs md:text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
            {[
              { icon: Building2, title: "200+ Schools", description: "Already Using A1Score" },
              { icon: Users, title: "25K+ Students", description: "Learning Daily" },
              { icon: GraduationCap, title: "1K+ Teachers", description: "Trained & Active" },
              { icon: TrendingUp, title: "40% Better", description: "Exam Performance" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <CardHeader className="p-2 md:p-3 lg:p-4">
                    <Icon className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-blue-600 mx-auto mb-1 md:mb-2" />
                    <CardTitle className="text-xs md:text-sm lg:text-base leading-tight">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 md:p-3 lg:p-4 pt-0">
                    <p className="text-gray-600 text-xs leading-relaxed">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionalSection;
