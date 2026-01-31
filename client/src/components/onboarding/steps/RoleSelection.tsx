import { Users, Heart, UserCog, Briefcase } from 'lucide-react';
import { OnboardingData } from '../Onboarding';

interface RoleSelectionProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RoleSelection({ data, updateData, onNext, onBack }: RoleSelectionProps) {
  const roles = [
    { id: 'self', label: "I'm getting married", icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { id: 'parent', label: 'Parent/Guardian', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { id: 'friend', label: 'Friend', icon: Heart, color: 'bg-purple-100 text-purple-600' },
    { id: 'planner', label: 'Wedding Planner', icon: Briefcase, color: 'bg-green-100 text-green-600' },
    { id: 'other', label: 'Other', icon: UserCog, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleSelect = (roleId: string) => {
    updateData({ role: roleId });
  };

  const handleNext = () => {
    if (data.role) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Who's planning?</h2>
        <p className="text-gray-600">Help us personalize your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`p-6 rounded-xl border-2 transition hover:scale-105 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${role.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-medium text-gray-900">{role.label}</span>
              </div>
            </button>
          );
        })}
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
          disabled={!data.role}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
