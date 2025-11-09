import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WelcomeStep } from './steps/WelcomeStep';
import { SubjectsStep } from './steps/SubjectsStep';
import { ExamDateStep } from './steps/ExamDateStep';
import { LearningStyleStep } from './steps/LearningStyleStep';
import { ExplanationPreferenceStep } from './steps/ExplanationPreferenceStep';
import { FirstActionStep } from './steps/FirstActionStep';
import { useOnboarding } from '@/hooks/useOnboarding';
import type { OnboardingStep } from '@/types/onboarding';

interface ProgressiveOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressiveOnboardingFlow = ({
  isOpen,
  onClose,
}: ProgressiveOnboardingFlowProps) => {
  const { progress, updateProgress, completeStep, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    progress?.current_step || 'welcome'
  );

  const handleNext = async (step: OnboardingStep) => {
    await completeStep(currentStep);
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    await completeOnboarding();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0">
        {currentStep === 'welcome' && (
          <WelcomeStep onNext={() => handleNext('subjects')} onSkip={handleSkip} />
        )}
        {currentStep === 'subjects' && (
          <SubjectsStep
            initialSubjects={progress?.learning_subjects || []}
            onNext={async (subjects) => {
              await updateProgress({ learning_subjects: subjects });
              handleNext('exam_date');
            }}
            onSkip={() => handleNext('exam_date')}
          />
        )}
        {currentStep === 'exam_date' && (
          <ExamDateStep
            initialDate={progress?.exam_date}
            onNext={async (date) => {
              await updateProgress({ exam_date: date || undefined });
              handleNext('learning_style');
            }}
            onSkip={() => handleNext('learning_style')}
          />
        )}
        {currentStep === 'learning_style' && (
          <LearningStyleStep
            onNext={async (style) => {
              await updateProgress({ learning_style: style });
              handleNext('explanation_preference');
            }}
            onSkip={() => handleNext('explanation_preference')}
          />
        )}
        {currentStep === 'explanation_preference' && (
          <ExplanationPreferenceStep
            onNext={async (preference) => {
              await updateProgress({ explanation_preference: preference });
              handleNext('first_action');
            }}
            onSkip={() => handleNext('first_action')}
          />
        )}
        {currentStep === 'first_action' && (
          <FirstActionStep onComplete={handleComplete} />
        )}
      </DialogContent>
    </Dialog>
  );
};
