
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, FlaskConical, Globe, BookOpen, Scale, Microscope, TrendingUp, Cpu } from "lucide-react";

const SubjectsSection = () => {
  const [currentLevel, setCurrentLevel] = useState(0);

  const academicLevels = [
    {
      title: "Secondary School Excellence",
      subtitle: "Master foundational concepts with AI guidance",
      subjects: [
        { name: 'Mathematics', icon: Calculator, color: 'bg-blue-500', topics: 'Algebra, Calculus, Statistics' },
        { name: 'Physics', icon: FlaskConical, color: 'bg-purple-500', topics: 'Mechanics, Electricity, Quantum' },
        { name: 'Chemistry', icon: FlaskConical, color: 'bg-green-500', topics: 'Organic, Inorganic, Physical' },
        { name: 'English Language', icon: Globe, color: 'bg-orange-500', topics: 'Literature, Writing, Analysis' },
      ]
    },
    {
      title: "University & Beyond",
      subtitle: "Advanced research and professional development",
      subjects: [
        { name: 'Computer Science', icon: Cpu, color: 'bg-indigo-500', topics: 'AI, Algorithms, Software Engineering' },
        { name: 'Law & Jurisprudence', icon: Scale, color: 'bg-red-500', topics: 'Constitutional, Criminal, International' },
        { name: 'Medical Sciences', icon: Microscope, color: 'bg-emerald-500', topics: 'Anatomy, Pathology, Pharmacology' },
        { name: 'Business Studies', icon: TrendingUp, color: 'bg-amber-500', topics: 'Finance, Marketing, Strategy' },
      ]
    },
    {
      title: "Research & Postgraduate",
      subtitle: "Specialized knowledge for advanced scholars",
      subjects: [
        { name: 'Literature & Humanities', icon: BookOpen, color: 'bg-pink-500', topics: 'Critical Theory, Research Methods' },
        { name: 'Engineering', icon: Calculator, color: 'bg-cyan-500', topics: 'Civil, Mechanical, Electrical' },
        { name: 'Social Sciences', icon: Globe, color: 'bg-violet-500', topics: 'Psychology, Sociology, Anthropology' },
        { name: 'Pure Sciences', icon: Microscope, color: 'bg-teal-500', topics: 'Advanced Physics, Biochemistry' },
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLevel((prev) => (prev + 1) % academicLevels.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentData = academicLevels[currentLevel];

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2 md:space-y-4">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Master Every Academic Level
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From secondary school foundations to advanced university research - 
            AI-powered assistance across all disciplines and academic levels.
          </p>
          
          {/* Dynamic Level Indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {academicLevels.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-6 md:h-2 md:w-8 rounded-full transition-all duration-500 ${
                  index === currentLevel ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Animated Level Title */}
        <div className="text-center mb-6 md:mb-10 min-h-[80px] md:min-h-[100px] flex flex-col justify-center">
          <div
            key={currentLevel}
            className="animate-fade-in"
          >
            <h4 className="text-base md:text-xl lg:text-2xl font-bold text-blue-900 mb-1 md:mb-2">
              {currentData.title}
            </h4>
            <p className="text-sm md:text-base text-gray-600">
              {currentData.subtitle}
            </p>
          </div>
        </div>

        {/* Animated Subject Cards */}
        <div 
          key={`level-${currentLevel}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 animate-fade-in"
        >
          {currentData.subjects.map((subject, index) => {
            const Icon = subject.icon;
            return (
              <Card 
                key={`${currentLevel}-${index}`} 
                className="hover:shadow-xl hover:scale-105 transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-blue-200"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <CardHeader className="text-center p-3 md:p-4 lg:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${subject.color} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg transform hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base lg:text-lg font-bold text-gray-900">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-3 md:p-4 lg:p-6 pt-0">
                  <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 leading-relaxed">{subject.topics}</p>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-blue-500 transition-all duration-300 text-xs">
                    AI Tutor Ready
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Academic Journey Indicator */}
        <div className="text-center mt-8 md:mt-12 lg:mt-16 hidden md:block">
          <div className="inline-flex items-center space-x-3 md:space-x-4 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 md:px-8 md:py-4 shadow-lg">
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-medium text-gray-700">Secondary School</span>
            </div>
            <div className="w-4 md:w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <span className="text-xs md:text-sm font-medium text-gray-700">University</span>
            </div>
            <div className="w-4 md:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
              <span className="text-xs md:text-sm font-medium text-gray-700">Research</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
