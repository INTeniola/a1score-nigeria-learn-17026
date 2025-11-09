import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ProgressiveOnboardingFlow } from './ProgressiveOnboardingFlow';

export const OnboardingWrapper = () => {
  const { user } = useAuth();
  const { shouldShowOnboarding, setShouldShowOnboarding, loading } = useOnboarding();

  useEffect(() => {
    // Auto-detect language from browser settings
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['en', 'pidgin', 'yoruba', 'hausa', 'igbo'];
    
    if (supportedLangs.includes(browserLang)) {
      localStorage.setItem('i18nextLng', browserLang);
    }
  }, []);

  if (!user || loading) return null;

  return (
    <ProgressiveOnboardingFlow
      isOpen={shouldShowOnboarding}
      onClose={() => setShouldShowOnboarding(false)}
    />
  );
};
