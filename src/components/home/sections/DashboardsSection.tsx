
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Heart, Building2 } from "lucide-react";

const DashboardsSection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto container-padding">
        <div className="text-center mb-8 md:mb-12 lg:mb-16 space-y-3 md:space-y-4">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-relaxed">
            Made for Every Level of Education
          </h3>
          <p className="text-sm md:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Different tools for students, parents, teachers, and institutions to work together across all educational levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {[
            { 
              title: "For Students", 
              icon: Brain, 
              description: "Get help with assignments, exam prep, and research from secondary school through postgraduate studies", 
              color: "text-blue-600" 
            },
            { 
              title: "For Teachers", 
              icon: Users, 
              description: "Earn money helping students at all levels, create content for any subject or academic level", 
              color: "text-green-600" 
            },
            { 
              title: "For Parents", 
              icon: Heart, 
              description: "Monitor your child's academic journey from secondary school through university and beyond", 
              color: "text-pink-600" 
            },
            { 
              title: "For Institutions", 
              icon: Building2, 
              description: "Manage students across all levels, track performance, and reduce tutoring costs effectively", 
              color: "text-purple-600" 
            },
          ].map((dashboard, index) => {
            const Icon = dashboard.icon;
            return (
              <Card 
                key={index} 
                className="shadow-sm md:shadow-md transition-all duration-300 cursor-pointer active:scale-95 md:hover:shadow-lg md:hover:scale-105 min-h-12"
              >
                <CardHeader className="text-center p-4 md:p-6">
                  <Icon className={`h-10 w-10 md:h-12 md:w-12 ${dashboard.color} mx-auto mb-3 md:mb-4`} />
                  <CardTitle className="text-base md:text-lg lg:text-xl leading-relaxed">{dashboard.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-4 md:p-6 pt-0">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{dashboard.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardsSection;
