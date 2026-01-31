import { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { MapPin, Search } from 'lucide-react';
import LocationPermission from './LocationPermission';

interface LocationProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Location({ data, updateData, onNext, onBack }: LocationProps) {
  const [localData, setLocalData] = useState({
    weddingCity: data.weddingCity || '',
    weddingState: data.weddingState || '',
    weddingCountry: data.weddingCountry || 'United States',
  });
  const [showPermission, setShowPermission] = useState(!data.weddingCity);

  const handleLocationDetected = (city: string, state: string, country: string) => {
    setLocalData({ weddingCity: city, weddingState: state, weddingCountry: country });
    setShowPermission(false);
  };

  const handleNext = () => {
    if (localData.weddingCity) {
      updateData({
        weddingCity: localData.weddingCity,
        weddingState: localData.weddingState,
        weddingCountry: localData.weddingCountry,
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
            <MapPin className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Where is your wedding?</h2>
        <p className="text-gray-600">This helps us find local vendors and services</p>
      </div>

      {showPermission && (
        <LocationPermission 
          onLocationDetected={handleLocationDetected}
          onSkip={() => setShowPermission(false)}
        />
      )}

      <div className="space-y-6">
        {/* City */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            City * <span className="text-sm font-normal text-gray-500">(Required for vendor search)</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={localData.weddingCity}
              onChange={(e) => setLocalData({ ...localData, weddingCity: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter city (e.g., San Francisco)"
            />
          </div>
        </div>

        {/* State */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            State/Province <span className="text-sm font-normal text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={localData.weddingState}
            onChange={(e) => setLocalData({ ...localData, weddingState: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter state/province (e.g., California)"
          />
        </div>

        {/* Country */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">Country</label>
          <select
            value={localData.weddingCountry}
            onChange={(e) => setLocalData({ ...localData, weddingCountry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
            <option value="Mexico">Mexico</option>
            <option value="France">France</option>
            <option value="Italy">Italy</option>
            <option value="Spain">Spain</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
        <p>
          💡 <strong>Why we ask:</strong> Your location helps us show you relevant local vendors, venues, DJs,
          and services specific to your area. We'll also provide location-based recommendations!
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!localData.weddingCity}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
