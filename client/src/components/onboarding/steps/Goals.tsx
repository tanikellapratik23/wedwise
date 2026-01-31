import { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { Target, CheckCircle } from 'lucide-react';

interface GoalsProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Goals({ data, updateData, onNext, onBack }: GoalsProps) {
  const [goals, setGoals] = useState(data.goals || '');
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const suggestions = [
    'Stay organized and on track',
    'Find and manage vendors',
    'Track expenses and budget',
    'Collaborate with family',
    'Manage guest list and RSVPs',
    'Plan the timeline',
    'Get inspiration and ideas',
    'Reduce stress and overwhelm',
  ];

  const handleSuggestionToggle = (suggestion: string) => {
    if (selectedSuggestions.includes(suggestion)) {
      setSelectedSuggestions(selectedSuggestions.filter((s) => s !== suggestion));
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
  };

  const handleNext = () => {
    const finalGoals = selectedSuggestions.length > 0
      ? selectedSuggestions.join(', ') + (goals ? '. ' + goals : '')
      : goals;

    if (finalGoals) {
      updateData({ goals: finalGoals });
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-100 text-primary-600 p-4 rounded-full">
            <Target className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">What do you want most from WedWise?</h2>
        <p className="text-gray-600">Help us understand your needs so we can help you better</p>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Select what matters to you:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => {
            const isSelected = selectedSuggestions.includes(suggestion);
            return (
              <button
                key={suggestion}
                onClick={() => handleSuggestionToggle(suggestion)}
                className={`p-4 rounded-lg border-2 text-left transition flex items-start space-x-3 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 transition ${
                    isSelected ? 'text-primary-500 fill-primary-500' : 'text-gray-300'
                  }`}
                />
                <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                  {suggestion}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Goals */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Anything else you'd like to share?{' '}
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Tell us more about your vision, concerns, or specific needs..."
        />
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
        <p>
          💡 <strong>Pro tip:</strong> The more you share, the better we can personalize your experience and
          prioritize the features that matter most to you!
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
          disabled={selectedSuggestions.length === 0 && !goals}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
