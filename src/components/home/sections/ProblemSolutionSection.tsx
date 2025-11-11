import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ProblemSolutionSectionProps {
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const ProblemSolutionSection = ({ onShowAuth }: ProblemSolutionSectionProps) => {
  const { t } = useTranslation();

  const problems = [
    t('problemSolution.problems.cost'),
    t('problemSolution.problems.attention'),
    t('problemSolution.problems.explanations'),
    t('problemSolution.problems.alone')
  ];

  const solutions = [
    t('problemSolution.solutions.affordable'),
    t('problemSolution.solutions.personal'),
    t('problemSolution.solutions.stepByStep'),
    t('problemSolution.solutions.community')
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-red-50 to-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
          {t('problemSolution.title')}
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto">
          {t('problemSolution.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-10">
          {/* Problems */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-red-100">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-red-600">
              {t('problemSolution.problemTitle')}
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-green-100 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-green-600">
              {t('problemSolution.solutionTitle')}
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-gray-700">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto min-h-11 py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base touch-manipulation"
            onClick={() => onShowAuth('student')}
          >
            {t('problemSolution.cta')}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            {t('problemSolution.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
