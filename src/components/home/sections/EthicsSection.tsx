
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, UserCheck, Brain, Users, Award } from "lucide-react";

const EthicsSection = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Safe and Responsible Learning
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We help students learn properly, not cheat. Parents can trust that their children are building real knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {[
            {
              icon: Shield,
              title: "No Cheating Allowed",
              description: "We teach students how to solve problems step-by-step instead of just giving them answers to copy.",
              color: "text-blue-600"
            },
            {
              icon: Lock,
              title: "Your Child's Data is Safe",
              description: "We protect all student information and never share personal details with anyone outside our platform.",
              color: "text-green-600"
            },
            {
              icon: UserCheck,
              title: "Real Teachers Check Everything",
              description: "Nigerian teachers verify all our AI responses to make sure they're accurate and appropriate for our curriculum.",
              color: "text-purple-600"
            },
            {
              icon: Brain,
              title: "Clear About AI Help",
              description: "Students always know when they're getting AI assistance versus help from human teachers.",
              color: "text-orange-600"
            },
            {
              icon: Users,
              title: "Learning Together",
              description: "AI helps students understand concepts better so they can participate more in class and study groups.",
              color: "text-red-600"
            },
            {
              icon: Award,
              title: "Building Character",
              description: "We encourage honest learning, hard work, and helping others succeed - values important to Nigerian families.",
              color: "text-teal-600"
            }
          ].map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300">
                <CardHeader className="p-3 md:p-4 lg:p-6">
                  <Icon className={`h-8 w-8 md:h-10 md:w-10 ${principle.color} mb-2 md:mb-3`} />
                  <CardTitle className="text-sm md:text-base lg:text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{principle.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EthicsSection;
