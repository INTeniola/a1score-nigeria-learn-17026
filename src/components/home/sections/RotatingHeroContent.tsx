
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
    <div className="relative overflow-hidden px-2 py-3 md:px-6 md:py-8 lg:px-8 lg:py-12">
      {/* Background gradient that changes with content */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentContent.gradient} opacity-5 transition-all duration-1000`} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-2 md:space-y-6 lg:space-y-10">
        {/* Icon */}
        <div className="mb-1 md:mb-3 lg:mb-5">
          <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto rounded-full bg-gradient-to-r ${currentContent.gradient} flex items-center justify-center transition-all duration-600 shadow-lg`}>
            <CurrentIcon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
          </div>
        </div>

        {/* Carousel container with overflow hidden */}
        <div className="relative min-h-[320px] sm:min-h-[380px] md:min-h-[450px] overflow-hidden">
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
                  className="min-w-full flex-shrink-0 px-1 sm:px-2 md:px-4"
                >
                  <div className="space-y-2 sm:space-y-3 md:space-y-5 max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-foreground leading-tight text-center px-2">
                      {t(`hero.${content.slideKey}.title`)}
                    </h2>
                    
                    <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r ${content.gradient} text-center px-2`}>
                      {t(`hero.${content.slideKey}.subtitle`)}
                    </h3>
                    
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto text-center px-3 sm:px-4 md:px-6 leading-relaxed">
                      {t(`hero.${content.slideKey}.description`)}
                    </p>

                    {/* Examples for main slide */}
                    {content.showExamples && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-2 sm:mt-3 md:mt-5 px-2">
                        <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap">
                          📚 {t('hero.main.example1')}
                        </Badge>
                        <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap">
                          🎓 {t('hero.main.example2')}
                        </Badge>
                      </div>
                    )}

                     {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-3 sm:mt-5 md:mt-7 px-2">
                      <Button 
                        size="lg" 
                        className={`w-full sm:w-auto bg-gradient-to-r ${content.gradient} hover:opacity-90 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg transition-all duration-200 min-h-12 active:scale-95 md:hover:scale-105 hover-gpu shadow-lg`}
                        onClick={() => {
                          if (content.slideKey === 'feature3') {
                            navigate('/join-waitlist');
                          } else {
                            onShowAuth('student');
                          }
                        }}
                      >
                        {t(`hero.${content.slideKey}.primaryButton`)}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg border-2 transition-all duration-200 min-h-12 active:scale-95 md:hover:scale-105 hover-gpu"
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
        <div className="flex justify-center mt-3 sm:mt-5 md:mt-7 gap-2">
          {heroContent.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToSlide(index)}
              disabled={isTransitioning}
              className={`w-8 h-8 p-2 rounded-full transition-all duration-300 active:scale-90 touch-manipulation ${
                index === (currentSlide % heroContent.length)
                  ? `bg-gradient-to-r ${currentContent.gradient} shadow-md` 
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
