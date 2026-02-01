import { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { Church, Heart, Sparkles, Plus, X, Check } from 'lucide-react';
import { getRitualsForReligion, getTraditionsForReligion } from '../../../utils/ceremonyData';

interface CeremonyDetailsProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CeremonyDetails({ data, updateData, onNext, onBack }: CeremonyDetailsProps) {
  const [ceremonyType, setCeremonyType] = useState<string>(data.ceremonyType || '');
  const [isReligious, setIsReligious] = useState<boolean>(data.isReligious || false);
  const [selectedReligions, setSelectedReligions] = useState<string[]>(data.religions || []);
  const [interfaithPreferences, setInterfaithPreferences] = useState(data.interfaithPreferences || []);
  const [ceremonyDetails, setCeremonyDetails] = useState({
    officiantType: data.ceremonyDetails?.officiantType || '',
    specificRituals: data.ceremonyDetails?.specificRituals || [],
    culturalTraditions: data.ceremonyDetails?.culturalTraditions || [],
  });
  const [customRitual, setCustomRitual] = useState('');

  const religions = [
    'Christianity - Catholic',
    'Christianity - Protestant',
    'Christianity - Orthodox',
    'Judaism',
    'Islam',
    'Hinduism',
    'Buddhism',
    'Sikhism',
    'Jainism',
    'Bahá\'í',
    'Shinto',
    'Taoism',
    'Secular/Non-religious',
    'Spiritual (Non-denominational)',
    'Other',
  ];

  const officiantTypes = [
    'Religious clergy (Priest, Rabbi, Imam, Pandit, etc.)',
    'Non-denominational minister',
    'Civil officiant/Judge',
    'Friend or family member',
    'Professional wedding officiant',
    'Self-officiated',
    'Cultural elder',
  ];

  const handleReligionToggle = (religion: string) => {
    if (selectedReligions.includes(religion)) {
      setSelectedReligions(selectedReligions.filter((r) => r !== religion));
    } else {
      setSelectedReligions([...selectedReligions, religion]);
    }
  };

  const addCustomRitual = () => {
    if (customRitual.trim()) {
      setCeremonyDetails({
        ...ceremonyDetails,
        specificRituals: [...ceremonyDetails.specificRituals, customRitual.trim()],
      });
      setCustomRitual('');
    }
  };

  const removeRitual = (ritual: string) => {
    setCeremonyDetails({
      ...ceremonyDetails,
      specificRituals: ceremonyDetails.specificRituals.filter((r) => r !== ritual),
    });
  };

  const handleNext = () => {
    // Determine ceremony type
    let finalCeremonyType = ceremonyType;
    if (!finalCeremonyType) {
      if (!isReligious) {
        finalCeremonyType = 'secular';
      } else if (selectedReligions.length > 1) {
        finalCeremonyType = 'interfaith';
      } else if (selectedReligions.length === 1) {
        finalCeremonyType = 'religious';
      } else {
        finalCeremonyType = 'spiritual';
      }
    }

    updateData({
      isReligious,
      religions: selectedReligions,
      ceremonyType: finalCeremonyType as any,
      interfaithPreferences: selectedReligions.length > 1 ? interfaithPreferences : undefined,
      ceremonyDetails,
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-full">
            <Church className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Tell us about your ceremony</h2>
        <p className="text-gray-600">We celebrate all types of unions and want to personalize your experience</p>
      </div>

      {/* Religious or Secular */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Will your ceremony have religious elements?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsReligious(false)}
            className={`p-4 rounded-xl border-2 transition ${
              !isReligious
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <Heart className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium">Secular/Non-religious</p>
            <p className="text-xs text-gray-500 mt-1">Civil, cultural, or spiritual</p>
          </button>
          <button
            onClick={() => setIsReligious(true)}
            className={`p-4 rounded-xl border-2 transition ${
              isReligious
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <Church className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium">Religious</p>
            <p className="text-xs text-gray-500 mt-1">Faith-based ceremony</p>
          </button>
        </div>
      </div>

      {/* Religion Selection */}
      {isReligious && (
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            Which religion(s) do you follow?{' '}
            <span className="text-sm font-normal text-gray-500">(Select all that apply)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
            {religions.map((religion) => {
              const isSelected = selectedReligions.includes(religion);
              return (
                <button
                  key={religion}
                  onClick={() => handleReligionToggle(religion)}
                  className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 text-gray-700'
                  }`}
                >
                  {religion}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interfaith Message */}
      {selectedReligions.length > 1 && (
        <div className="bg-purple-50 rounded-xl p-4 space-y-3">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900">Interfaith Ceremony</h3>
              <p className="text-sm text-purple-700 mt-1">
                We honor your interfaith union! You can specify which rituals and traditions you'd like to
                incorporate from each faith in the notes below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Officiant Type */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-900">
          Who will officiate your ceremony? <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </label>
        <select
          value={ceremonyDetails.officiantType}
          onChange={(e) => setCeremonyDetails({ ...ceremonyDetails, officiantType: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select officiant type</option>
          {officiantTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Specific Rituals - Show auto-generated options */}
      {isReligious && selectedReligions.length > 0 && (
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            Select rituals to include{' '}
            <span className="text-sm font-normal text-gray-500">(Optional - you can customize these later)</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Here are common rituals for your selected religion(s). Choose the ones you'd like to include:
          </p>

          {/* Auto-generated ritual options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2">
            {selectedReligions.flatMap((religion) =>
              getRitualsForReligion(religion).map((ritual) => {
                const isSelected = ceremonyDetails.specificRituals.includes(ritual);
                return (
                  <button
                    key={ritual}
                    onClick={() => {
                      if (isSelected) {
                        removeRitual(ritual);
                      } else {
                        setCeremonyDetails({
                          ...ceremonyDetails,
                          specificRituals: [...ceremonyDetails.specificRituals, ritual],
                        });
                      }
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="flex-1">{ritual}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Add custom ritual */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Add a custom ritual:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customRitual}
                onChange={(e) => setCustomRitual(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomRitual()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Family blessing, Rose ceremony"
              />
              <button
                onClick={addCustomRitual}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selected rituals */}
          {ceremonyDetails.specificRituals.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Selected Rituals ({ceremonyDetails.specificRituals.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {ceremonyDetails.specificRituals.map((ritual, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    <span>{ritual}</span>
                    <button onClick={() => removeRitual(ritual)} className="hover:text-purple-900">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-green-50 rounded-xl p-4 text-sm text-green-900">
        <p>
          🌈 <strong>We celebrate all love:</strong> Whether you're having a religious, secular, interfaith,
          cultural, LGBTQ+, or any other type of ceremony, Vivaha is here to support your unique celebration.
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
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
