import { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { DollarSign, Users as UsersIcon } from 'lucide-react';

interface PreferencesProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Preferences({ data, updateData, onNext, onBack }: PreferencesProps) {
  const [localData, setLocalData] = useState({
    weddingStyle: data.weddingStyle || '',
    topPriority: data.topPriority || [],
    estimatedBudget: data.estimatedBudget || '',
    guestCount: data.guestCount || '',
    preferredColorTheme: data.preferredColorTheme || '',
  });

  const weddingStyles = [
    'Formal/Traditional',
    'Casual',
    'Rustic',
    'Modern',
    'Beach/Destination',
    'Garden/Outdoor',
    'Vintage',
    'Bohemian',
  ];

  const priorities = [
    'Budget Management',
    'Guest Experience',
    'Vendor Management',
    'Timeline/Schedule',
    'Decorations',
    'Photography',
    'Catering',
    'Music/Entertainment',
  ];

  const colorThemes = [
    { name: 'Romantic Pink', color: 'bg-pink-400' },
    { name: 'Classic White', color: 'bg-white border border-gray-300' },
    { name: 'Elegant Gold', color: 'bg-yellow-600' },
    { name: 'Navy Blue', color: 'bg-blue-900' },
    { name: 'Sage Green', color: 'bg-green-300' },
    { name: 'Lavender', color: 'bg-purple-300' },
    { name: 'Blush', color: 'bg-pink-200' },
    { name: 'Burgundy', color: 'bg-red-900' },
  ];

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = localData.topPriority.includes(priority)
      ? localData.topPriority.filter((p) => p !== priority)
      : [...localData.topPriority, priority];
    setLocalData({ ...localData, topPriority: newPriorities });
  };

  const handleNext = () => {
    if (localData.weddingStyle && localData.topPriority.length > 0) {
      updateData({
        weddingStyle: localData.weddingStyle,
        topPriority: localData.topPriority,
        estimatedBudget: localData.estimatedBudget ? Number(localData.estimatedBudget) : undefined,
        guestCount: localData.guestCount ? Number(localData.guestCount) : undefined,
        preferredColorTheme: localData.preferredColorTheme,
      });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Tell us about your wedding</h2>
        <p className="text-gray-600">This helps us tailor your planning experience</p>
      </div>

      {/* Wedding Style */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          What's the wedding style? *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weddingStyles.map((style) => (
            <button
              key={style}
              onClick={() => setLocalData({ ...localData, weddingStyle: style })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                localData.weddingStyle === style
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 text-gray-700'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Top Priorities */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          What are your top priorities? * <span className="text-sm font-normal text-gray-500">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityToggle(priority)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                localData.topPriority.includes(priority)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300 text-gray-700'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Estimated Budget <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </label>
        <div className="relative max-w-xs">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={localData.estimatedBudget}
            onChange={(e) => setLocalData({ ...localData, estimatedBudget: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="25000"
          />
        </div>
      </div>

      {/* Guest Count */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Number of Guests <span className="text-sm font-normal text-gray-500">(Approximate)</span>
        </label>
        <div className="relative max-w-xs">
          <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={localData.guestCount}
            onChange={(e) => setLocalData({ ...localData, guestCount: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="100"
          />
        </div>
      </div>

      {/* Color Theme */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Preferred Color Theme <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </label>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {colorThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setLocalData({ ...localData, preferredColorTheme: theme.name })}
              className={`relative group`}
              title={theme.name}
            >
              <div
                className={`w-12 h-12 rounded-full ${theme.color} ${
                  localData.preferredColorTheme === theme.name
                    ? 'ring-4 ring-primary-500'
                    : 'hover:ring-2 hover:ring-gray-300'
                } transition`}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                {theme.name}
              </div>
            </button>
          ))}
        </div>
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
          disabled={!localData.weddingStyle || localData.topPriority.length === 0}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
