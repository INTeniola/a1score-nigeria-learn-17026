
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
    <div className="relative overflow-hidden px-3 py-4 sm:py-6 md:py-8 lg:py-10">
      {/* Background gradient that changes with content */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentContent.gradient} opacity-5 transition-all duration-700`} />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-7">
        {/* Icon */}
        <div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto rounded-full bg-gradient-to-r ${currentContent.gradient} flex items-center justify-center transition-all duration-700 shadow-lg`}>
            <CurrentIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
          </div>
        </div>

        {/* Carousel container with overflow hidden */}
        <div className="relative overflow-hidden">
          <div 
            className={`flex transition-all duration-700 ease-out`}
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
                  className="min-w-full flex-shrink-0"
                >
                  <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-3xl mx-auto px-2">
                    <h2 className="text-[22px] sm:text-[26px] md:text-[32px] lg:text-[40px] xl:text-5xl font-bold text-foreground leading-tight text-center">
                      {t(`hero.${content.slideKey}.title`)}
                    </h2>
                    
                    <h3 className={`text-[16px] sm:text-[18px] md:text-xl lg:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r ${content.gradient} text-center`}>
                      {t(`hero.${content.slideKey}.subtitle`)}
                    </h3>
                    
                    <p className="text-[13px] sm:text-[15px] md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto text-center leading-relaxed">
                      {t(`hero.${content.slideKey}.description`)}
                    </p>

                    {/* Examples for main slide */}
                    {content.showExamples && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                        <Badge variant="secondary" className="px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs whitespace-nowrap">
                          📚 {t('hero.main.example1')}
                        </Badge>
                        <Badge variant="secondary" className="px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs whitespace-nowrap">
                          🎓 {t('hero.main.example2')}
                        </Badge>
                      </div>
                    )}

                     {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <Button 
                        size="lg" 
                        className={`w-full sm:w-auto bg-gradient-to-r ${content.gradient} hover:opacity-90 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-[15px] sm:text-base md:text-lg transition-all duration-200 min-h-11 active:scale-95 md:hover:scale-105 hover-gpu shadow-lg`}
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
                        className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-[15px] sm:text-base md:text-lg border-2 transition-all duration-200 min-h-11 active:scale-95 md:hover:scale-105 hover-gpu"
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
        <div className="flex justify-center gap-1.5">
          {heroContent.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToSlide(index)}
              disabled={isTransitioning}
              className={`w-7 h-7 p-1.5 sm:w-8 sm:h-8 sm:p-2 rounded-full transition-all duration-300 active:scale-90 touch-manipulation ${
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
