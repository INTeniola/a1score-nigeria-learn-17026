
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RotatingHeroContentProps {
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const RotatingHeroContent = ({ onShowAuth }: RotatingHeroContentProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Logo Space - Ready for your logo upload */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-background/80 backdrop-blur-sm rounded-2xl border-2 border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              A1Score
            </span>
          </div>
        </div>

        {/* Main Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            {t('hero.student.title')}
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            {t('hero.student.subtitle')}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('hero.student.description')}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-all duration-200"
            onClick={() => onShowAuth('student')}
          >
            {t('hero.student.primaryButton')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg font-semibold border-2 hover:bg-accent/10 hover:border-accent hover:scale-105 transition-all duration-200"
            onClick={() => onShowAuth('student')}
          >
            {t('hero.student.secondaryButton')}
          </Button>
        </div>

        {/* Coming Soon badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <span className="text-muted-foreground">Teachers</span>
            <span className="ml-2 text-xs text-primary">Coming Soon</span>
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <span className="text-muted-foreground">Parents</span>
            <span className="ml-2 text-xs text-primary">Coming Soon</span>
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <span className="text-muted-foreground">Institutions</span>
            <span className="ml-2 text-xs text-primary">Coming Soon</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default RotatingHeroContent;
