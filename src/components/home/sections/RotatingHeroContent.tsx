
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Heart, Building2, GraduationCap, Target, TrendingUp } from "lucide-react";

interface RotatingHeroContentProps {
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const RotatingHeroContent = ({ onShowAuth }: RotatingHeroContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const heroContent = [
    {
      slideKey: 'main' as const,
      icon: GraduationCap,
      gradient: "from-primary to-purple-600",
      showExamples: true
    },
    {
      slideKey: 'feature1' as const,
      icon: Target,
      gradient: "from-green-600 to-teal-600"
    },
    {
      slideKey: 'feature2' as const,
      icon: Heart,
      gradient: "from-pink-600 to-rose-600"
    },
    {
      slideKey: 'feature3' as const,
      icon: TrendingUp,
      gradient: "from-purple-600 to-indigo-600"
    }
  ];

  const navigateToSlide = (index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setDirection(index > currentSlide ? 'forward' : 'backward');
    setCurrentSlide(index);
    
    // Reset auto-rotate timer
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    startAutoRotate();

    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const startAutoRotate = () => {
    autoRotateRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        if (next === heroContent.length) {
          // We're at the duplicate, after animation completes, jump to real first slide
          setTimeout(() => {
            setCurrentSlide(0);
          }, 1050); // Just after the 1s transition
          return next;
        }
        return next;
      });
    }, 8000);
  };

  useEffect(() => {
    startAutoRotate();

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [heroContent.length]);

  const currentContent = heroContent[currentSlide % heroContent.length];
  const CurrentIcon = currentContent.icon;

  return (
    <div className="relative overflow-hidden px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      {/* Background gradient that changes with content */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentContent.gradient} opacity-5 transition-all duration-1000`} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 md:space-y-12">
        {/* Icon */}
        <div className="mb-4 md:mb-6">
          <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-gradient-to-r ${currentContent.gradient} flex items-center justify-center transition-all duration-600`}>
            <CurrentIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
        </div>

        {/* Carousel container with overflow hidden */}
        <div className="relative min-h-[480px] md:min-h-[500px] overflow-hidden">
          <div 
            className={`flex transition-transform duration-1000 ease-in-out`}
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {/* Render all slides plus duplicate of first slide at end */}
            {[...heroContent, heroContent[0]].map((content, index) => {
              const Icon = content.icon;
              const isLastDuplicate = index === heroContent.length;
              return (
                <div 
                  key={isLastDuplicate ? 'duplicate-0' : content.slideKey}
                  className="min-w-full flex-shrink-0 px-2 md:px-4"
                >
                  <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight text-center">
                      {t(`hero.${content.slideKey}.title`)}
                    </h2>
                    
                    <h3 className={`text-xl md:text-2xl lg:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r ${content.gradient} text-center`}>
                      {t(`hero.${content.slideKey}.subtitle`)}
                    </h3>
                    
                    <p className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-center px-2 md:px-4 leading-relaxed">
                      {t(`hero.${content.slideKey}.description`)}
                    </p>

                    {/* Examples for main slide */}
                    {content.showExamples && (
                      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-4 md:mt-6">
                        <Badge variant="secondary" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-base">
                          📚 {t('hero.main.example1')}
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-base">
                          🎓 {t('hero.main.example2')}
                        </Badge>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8">
                      <Button 
                        size="lg" 
                        className={`w-full md:w-auto bg-gradient-to-r ${content.gradient} hover:opacity-90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg transition-all duration-200 min-h-11 active:scale-95 md:hover:scale-105`}
                        onClick={() => {
                          if (content.slideKey === 'feature3') {
                            navigate('/join-waitlist');
                          } else {
                            onShowAuth('student');
                          }
                        }}
                      >
                        {t(`hero.${content.slideKey}.primaryButton`)}
                        <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg border-2 transition-all duration-200 min-h-11 active:scale-95 md:hover:scale-105"
                        onClick={() => {
                          if (content.slideKey === 'feature3') {
                            navigate('/stay-updated');
                          } else {
                            onShowAuth('student');
                          }
                        }}
                      >
                        {t(`hero.${content.slideKey}.secondaryButton`)}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide indicators - touch friendly */}
        <div className="flex justify-center mt-6 md:mt-8 gap-2 md:gap-3">
          {heroContent.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToSlide(index)}
              disabled={isTransitioning}
              className={`min-w-11 min-h-11 md:min-w-0 md:min-h-0 md:w-3 md:h-3 w-10 h-10 rounded-full transition-all duration-300 active:scale-90 ${
                index === (currentSlide % heroContent.length)
                  ? `bg-gradient-to-r ${currentContent.gradient}` 
                  : 'bg-muted active:bg-muted-foreground/40 md:hover:bg-muted-foreground/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default RotatingHeroContent;
