
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onShowAuth: (userType: 'student' | 'teacher') => void;
}

const PricingSection = ({ onShowAuth }: PricingSectionProps) => {
  const plans = [
    {
      name: "Free Trial",
      price: "₦0",
      period: "/month",
      description: "Perfect to get started",
      features: ["5 questions per day", "Basic homework help", "Secondary school subjects", "Email support"],
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Family Plan",
      price: "₦2,500",
      period: "/month",
      description: "Best value for families",
      features: ["Unlimited questions", "All education levels covered", "Progress reports", "Multiple children supported", "Priority support"],
      popular: true,
      color: "border-green-500"
    },
    {
      name: "Teacher Plus",
      price: "₦5,000",
      period: "/month",
      description: "Earn while you teach",
      features: ["All family features", "Earn from validating answers", "Create paid content", "Analytics dashboard", "Institution partnerships"],
      popular: false,
      color: "border-blue-500"
    }
  ];

  return (
    <section className="py-8 px-4 md:py-12 md:px-6 lg:py-20 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            Affordable Plans for Every Student
          </h3>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From secondary school to university graduation. Start free and upgrade when you're ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`md:hover:shadow-lg md:hover:scale-105 transition-all duration-300 border-2 ${plan.color} ${plan.popular ? 'relative' : ''} flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-2 py-0.5 md:px-3 md:py-1 text-xs">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center p-3 md:p-4 lg:p-6">
                <CardTitle className="text-base md:text-lg lg:text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2 md:mb-3">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs md:text-sm text-gray-600">{plan.period}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-3 md:p-4 lg:p-6">
                <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-gray-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-auto min-h-12 text-sm md:text-base ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  onClick={() => onShowAuth('student')}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
