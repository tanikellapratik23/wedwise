import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

interface OnboardingData {
  role: string;
  weddingStyle: string;
  topPriority?: string[];
  estimatedBudget?: number;
  guestCount?: number;
  weddingDate?: string;
  [key: string]: any;
}

export const useOnboarding = () => {
  const { onboardingData, setOnboardingData, saveOnboarding, hasCompletedOnboarding } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveOnboarding = useCallback(
    async (data: OnboardingData) => {
      setIsLoading(true);
      try {
        await saveOnboarding(data);
        setError(null);
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Save failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [saveOnboarding]
  );

  const updateOnboardingData = useCallback(
    (newData: Partial<OnboardingData>) => {
      if (onboardingData) {
        setOnboardingData({
          ...onboardingData,
          ...newData,
        } as OnboardingData);
      }
    },
    [onboardingData, setOnboardingData]
  );

  return {
    onboardingData,
    updateOnboardingData,
    saveOnboarding: handleSaveOnboarding,
    hasCompletedOnboarding,
    isLoading,
    error,
  };
};
