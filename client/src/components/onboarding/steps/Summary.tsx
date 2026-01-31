import { OnboardingData } from '../Onboarding';
import { Check, Sparkles } from 'lucide-react';

interface SummaryProps {
  data: OnboardingData;
  onBack: () => void;
  onComplete: () => void;
}

export default function Summary({ data, onBack, onComplete }: SummaryProps) {
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      self: "Getting Married",
      parent: "Parent/Guardian",
      friend: "Friend",
      planner: "Wedding Planner",
      other: "Other",
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-full">
            <Check className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">You're all set!</h2>
        <p className="text-gray-600">Here's what we've learned about you</p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">{getRoleLabel(data.role)}</p>
          </div>

          {data.weddingCity && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {data.weddingCity}
                {data.weddingState && `, ${data.weddingState}`}
                {data.weddingCountry && ` - ${data.weddingCountry}`}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Wedding Style</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">{data.weddingStyle}</p>
          </div>

          {data.ceremonyType && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ceremony Type</h3>
              <p className="mt-1 text-lg font-medium text-gray-900 capitalize">{data.ceremonyType}</p>
            </div>
          )}

          {data.estimatedBudget && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Budget</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                ${data.estimatedBudget.toLocaleString()}
              </p>
            </div>
          )}

          {data.guestCount && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Guest Count</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{data.guestCount} guests</p>
            </div>
          )}

          {data.preferredColorTheme && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Color Theme</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{data.preferredColorTheme}</p>
            </div>
          )}
        </div>

        {data.religions && data.religions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Religion(s)</h3>
            <div className="flex flex-wrap gap-2">
              {data.religions.map((religion) => (
                <span
                  key={religion}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-700 border border-purple-200"
                >
                  {religion}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.ceremonyDetails?.officiantType && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Officiant</h3>
            <p className="mt-1 text-gray-700">{data.ceremonyDetails.officiantType}</p>
          </div>
        )}

        {data.ceremonyDetails?.specificRituals && data.ceremonyDetails.specificRituals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Rituals & Traditions</h3>
            <div className="flex flex-wrap gap-2">
              {data.ceremonyDetails.specificRituals.map((ritual) => (
                <span
                  key={ritual}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-700 border border-primary-200"
                >
                  {ritual}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Priorities</h3>
          <div className="flex flex-wrap gap-2">
            {data.topPriority.map((priority) => (
              <span
                key={priority}
                className="px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-700 border border-primary-200"
              >
                {priority}
              </span>
            ))}
          </div>
        </div>

        {data.goals && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Goals</h3>
            <p className="mt-1 text-gray-700">{data.goals}</p>
          </div>
        )}
      </div>

      <div className="bg-primary-600 text-white rounded-xl p-6 space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">Your Personalized Dashboard Awaits!</h3>
        </div>
        <p className="text-primary-100">
          Based on your preferences, we've customized your dashboard to focus on what matters most to you.
          Let's start planning your dream wedding!
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
          onClick={onComplete}
          className="px-12 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
