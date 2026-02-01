import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Welcome from './steps/Welcome';
import RoleSelection from './steps/RoleSelection';
import WeddingDate from './steps/WeddingDate';
import Location from './steps/Location';
import Preferences from './steps/Preferences';
import CeremonyDetails from './steps/CeremonyDetails';
import Goals from './steps/Goals';
import Summary from './steps/Summary';

interface OnboardingProps {
  setHasCompletedOnboarding: (value: boolean) => void;
}

export interface OnboardingData {
  role: string;
  weddingStyle: string;
  topPriority: string[];
  estimatedBudget?: number;
  guestCount?: number;
  weddingDate?: string;
  weddingTime?: string;
  weddingCity?: string;
  weddingState?: string;
  weddingCountry?: string;
  isReligious?: boolean;
  religions?: string[];
  ceremonyType?: 'secular' | 'religious' | 'interfaith' | 'cultural' | 'spiritual';
  interfaithPreferences?: {
    religion: string;
    ritualsToInclude: string[];
  }[];
  ceremonyDetails?: {
    officiantType?: string;
    specificRituals?: string[];
    culturalTraditions?: string[];
  };
  goals: string;
  preferredColorTheme?: string;
}

export default function Onboarding({ setHasCompletedOnboarding }: OnboardingProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    weddingStyle: '',
    topPriority: [],
    goals: '',
  });

  const totalSteps = 8;

  const updateData = (newData: Partial<OnboardingData>) => {
    setData({ ...data, ...newData });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/onboarding', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      localStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding save failed:', error);
    }
  };

  const [offlineMode, setOfflineMode] = useState(false);
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    setOfflineMode(localStorage.getItem('offlineMode') === 'true');
  }, []);

  const leaveOfflineMode = () => {
    localStorage.removeItem('offlineMode');
    navigate('/login');
  };

  const autoCompleteOnboarding = async () => {
    // quickly advance through each step then mark onboarding completed locally
    for (let i = step; i < totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 350));
      setStep((s) => Math.min(s + 1, totalSteps));
    }
    // mark complete locally (avoid API call when offline)
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                  i < step ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {step === 1 && <Welcome onNext={nextStep} />}
          {step === 2 && <RoleSelection data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <WeddingDate data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <Location data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 5 && <Preferences data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 6 && <CeremonyDetails data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 7 && <Goals data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          {step === 8 && <Summary data={data} onBack={prevStep} onComplete={handleComplete} />}
        </div>
      </div>
      {offlineMode && !hideBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 z-50">
          <div className="relative max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm">
              You're using the app without the server. Some features may be limited.
            </div>
            <div className="flex items-center">
              <button
                onClick={leaveOfflineMode}
                className="ml-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md text-sm"
              >
                Go back to Log In
              </button>
              <button
                onClick={autoCompleteOnboarding}
                className="ml-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md text-sm"
              >
                Auto-complete onboarding
              </button>
            </div>
            <button
              aria-label="Dismiss banner"
              onClick={() => setHideBanner(true)}
              className="absolute top-2 right-3 text-yellow-800 hover:text-yellow-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
