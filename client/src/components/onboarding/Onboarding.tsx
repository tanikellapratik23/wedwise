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
import BachelorParty from './steps/BachelorParty';
import Summary from './steps/Summary';
import PlannerLocation from './steps/PlannerLocation';
import PlannerWeddingTypes from './steps/PlannerWeddingTypes';
import PlannerServices from './steps/PlannerServices';
import PlannerCapacity from './steps/PlannerCapacity';
import PlannerTeam from './steps/PlannerTeam';
import PlannerCommunication from './steps/PlannerCommunication';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    weddingDays?: Array<{
      dayNumber?: number;
      date?: string;
      title?: string;
      events?: any[];
    }>;
  };
  goals: string;
  preferredColorTheme?: string;
  wantsBachelorParty?: boolean;
  plannerData?: {
    baseCity?: string;
    baseState?: string;
    baseCountry?: string;
    serviceRegions?: string[];
    customRegion?: string;
    destinationWeddings?: boolean;
    weddingStyles?: string[];
    ceremonyTypes?: string[];
    interfaithSpecializations?: string[];
    multipleCeremoniesFrequency?: string;
    interfaithSensitivityLevel?: string;
    weddingsPerYear?: string;
    unavailableMonths?: string[];
    workDays?: string;
    teamType?: string;
    teamMembers?: Array<{
      email: string;
      status: 'pending' | 'accepted';
    }>;
    communicationPreferences?: {
      preferredMethod?: string;
      reminderFrequency?: string;
      responseTime?: string;
      canScheduleMeetings?: boolean;
    };
    services?: string[];
    customPackages?: boolean;
  };
}

export default function Onboarding({ setHasCompletedOnboarding }: OnboardingProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    weddingStyle: '',
    topPriority: [],
    goals: '',
    wantsBachelorParty: false,
  });

  // Calculate total steps based on role
  // Couples: Welcome, Role, Date, Location, Preferences, CeremonyDetails, Goals, BachelorParty, Summary
  // Planners: Welcome, Role, Location, WeddingTypes, Services, Capacity, Team, Communication, Summary
  const totalSteps = data.role === 'planner' ? 9 : 9;

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
    // prevent double submit
    if ((handleComplete as any)._running) return;
    (handleComplete as any)._running = true;
    try {
      // persist locally first so dashboard can read onboarding immediately
      try {
        localStorage.setItem('onboarding', JSON.stringify(data));
        // Save bachelor party preference to localStorage for quick access
        if (data.wantsBachelorParty) {
          localStorage.setItem('wantsBachelorParty', 'true');
        }
        // also write a lightweight `user` so other screens can use it
        localStorage.setItem('user', JSON.stringify({ weddingCity: data.weddingCity, weddingState: data.weddingState, weddingDate: data.weddingDate, estimatedBudget: data.estimatedBudget, guestCount: data.guestCount }));
        const ceremonyPayload = {
          userSettings: data,
          selectedRituals: data.ceremonyDetails?.specificRituals || [],
          selectedTraditions: data.ceremonyDetails?.culturalTraditions || [],
          weddingDays: data.ceremonyDetails?.weddingDays || [],
        };
        localStorage.setItem('ceremony', JSON.stringify(ceremonyPayload));
      } catch (e) {
        console.error('Failed to persist onboarding locally', e);
      }

      const token = localStorage.getItem('token');
      // Save to server with proper timeout
      try {
        console.log('Saving onboarding to backend:', `${API_URL}/api/onboarding`);
        console.log('Token:', token ? `${token.slice(0, 20)}...` : 'NO TOKEN');
        const result = await axios.post(`${API_URL}/api/onboarding`, data, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        console.log('✅ Onboarding saved to backend:', result.data);
      } catch (err: any) {
        console.error('❌ Server onboarding save failed:', {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          url: `${API_URL}/api/onboarding`
        });
      }

      // mark completed locally and navigate
      localStorage.setItem('onboardingCompleted', 'true');
      sessionStorage.setItem('onboardingCompleted', 'true'); // Dashboard checks sessionStorage
      localStorage.removeItem('isNewUser'); // Clear new user flag now that onboarding is done
      setHasCompletedOnboarding(true);
      
      // Route planners to their workspace home instead of regular dashboard
      const route = data.role === 'planner' ? '/dashboard/planner' : '/dashboard';
      
      // Add delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate(route);
      }, 100);

      // fallback: if SPA navigation doesn't land on the dashboard (basename mismatch), force full reload
      setTimeout(() => {
        const base = import.meta.env.BASE_URL || '/';
        const expected = base.replace(/\/$/, '') + route;
        if (!window.location.pathname.includes('/dashboard')) {
          window.location.href = expected;
        }
      }, 350);
    } finally {
      (handleComplete as any)._running = false;
    }
  };

  // Removed automatic completion on final step to ensure explicit Finish click behavior

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
    // fallback for local flow
    setTimeout(() => {
      const base = import.meta.env.BASE_URL || '/';
      const expected = base.replace(/\/$/, '') + '/dashboard';
      if (!window.location.pathname.includes('/dashboard')) {
        window.location.href = expected;
      }
    }, 250);
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
          
          {/* Couple flow steps (for couple, bride, groom, friend, parent, guardian) */}
          {(data.role === 'couple' || data.role === 'bride' || data.role === 'groom' || data.role === 'friend' || data.role === 'parent' || data.role === 'guardian') && (
            <>
              {step === 3 && <WeddingDate data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 4 && <Location data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 5 && <Preferences data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 6 && <CeremonyDetails data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 7 && <Goals data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 8 && (
                <BachelorParty 
                  wantsBachelorParty={data.wantsBachelorParty || false} 
                  onChange={(value) => updateData({ wantsBachelorParty: value })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {step === 9 && <Summary data={data} onBack={prevStep} onComplete={handleComplete} />}
            </>
          )}

          {/* Planner flow steps */}
          {data.role === 'planner' && (
            <>
              {step === 3 && <PlannerLocation data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 4 && <PlannerWeddingTypes data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 5 && <PlannerServices data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 6 && <PlannerCapacity data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 7 && <PlannerTeam data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 8 && <PlannerCommunication data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 9 && <Summary data={data} onBack={prevStep} onComplete={handleComplete} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
