/**
 * Haptic Feedback Utility
 * Provides haptic feedback for supported devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback if supported by the device
 */
export const triggerHaptic = (pattern: HapticPattern = 'light'): void => {
  // Check if vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  // Define vibration patterns
  const patterns: Record<HapticPattern, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [20, 100, 20],
    error: [30, 100, 30, 100, 30]
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    // Silently fail if vibration fails
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Hook for haptic feedback in React components
 */
export const useHaptic = () => {
  return {
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error')
  };
};
