import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Heart, Building2, ArrowLeft } from "lucide-react";

interface UserTypeSelectorProps {
  onClose?: () => void;
}

const UserTypeSelector = ({ onClose }: UserTypeSelectorProps) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const userTypes = [
    {
      type: 'student',
      title: 'Student',
      description: 'Access AI tutoring, practice tests, and study resources',
      icon: BookOpen,
      gradient: "from-blue-600 to-purple-600"
    },
    {
      type: 'teacher',
      title: 'Teacher',
      description: 'Create content, manage classes, and track student progress',
      icon: Users,
      gradient: "from-green-600 to-teal-600"
    },
    {
      type: 'parent',
      title: 'Parent',
      description: 'Monitor your child\'s progress and support their learning',
      icon: Heart,
      gradient: "from-pink-600 to-rose-600"
    },
    {
      type: 'admin',
      title: 'Institution',
      description: 'Manage school-wide analytics and educational resources',
      icon: Building2,
      gradient: "from-purple-600 to-indigo-600"
    }
  ];

  const handleContinue = () => {
    if (selectedType) {
      navigate('/auth', { state: { userType: selectedType } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Back to Home Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            {/* Clickable Logo */}
            <div 
              className="flex justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
            >
              <img 
                src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
                alt="A1Score Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold">Choose Your Role</CardTitle>
            <p className="text-muted-foreground text-lg">
              Select how you'll be using A1Score to get personalized features
            </p>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {userTypes.map((userType) => {
              const IconComponent = userType.icon;
              return (
                <div
                  key={userType.type}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedType === userType.type
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedType(userType.type)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${userType.gradient} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{userType.title}</h3>
                      <p className="text-muted-foreground">{userType.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center space-x-4">
            {onClose && (
              <Button variant="outline" onClick={onClose} size="lg">
                Back
              </Button>
            )}
            <Button 
              onClick={handleContinue} 
              disabled={!selectedType}
              size="lg"
              className="px-8"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default UserTypeSelector;