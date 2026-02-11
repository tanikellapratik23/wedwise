import { useState, useEffect } from 'react';
import { User, MapPin, Heart, Calendar, DollarSign, Users as UsersIcon, Save, Church, Globe } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';
import { userDataStorage } from '../../utils/userDataStorage';
import type { OnboardingData } from '../onboarding/Onboarding';

export default function Settings() {
  const { onboardingData, saveOnboarding } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OnboardingData>({
    role: '',
    weddingStyle: '',
    topPriority: [],
    goals: '',
    weddingCity: '',
    weddingState: '',
    weddingCountry: 'United States',
    isReligious: false,
    religions: [],
    ceremonyDetails: {},
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // When onboarding data becomes available (from context), use it immediately
    if (onboardingData && Object.keys(onboardingData).length > 0) {
      console.log('✅ Settings loaded from AppContext:', onboardingData);
      setSettings(onboardingData as OnboardingData);
      setLoading(false);
    }
  }, [onboardingData]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No token found, loading from localStorage');
        // Load from local storage if no token
        try {
          const local = userDataStorage.getData('onboarding') || {};
          if (Object.keys(local).length > 0) {
            console.log('Loaded settings from localStorage:', local);
            setSettings(prev => ({
              ...prev,
              ...local,
            }));
          }
        } catch (e) {
          console.error('Failed to load local settings:', e);
        }
        setLoading(false);
        return;
      }
      
      console.log('Fetching settings from API...');
      const response = await axios.get('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && Object.keys(response.data).length > 0) {
        const fetchedData = {
          role: response.data.role || '',
          weddingStyle: response.data.weddingStyle || '',
          topPriority: Array.isArray(response.data.topPriority) ? response.data.topPriority : [],
          goals: response.data.goals || '',
          weddingCity: response.data.weddingCity || '',
          weddingState: response.data.weddingState || '',
          weddingCountry: response.data.weddingCountry || 'United States',
          isReligious: response.data.isReligious || false,
          religions: Array.isArray(response.data.religions) ? response.data.religions : [],
          ceremonyDetails: response.data.ceremonyDetails || {},
          estimatedBudget: response.data.estimatedBudget || 0,
          guestCount: response.data.guestCount || 0,
          weddingDate: response.data.weddingDate || '',
          weddingTime: response.data.weddingTime || '',
          preferredColorTheme: response.data.preferredColorTheme || '',
          wantsBachelorParty: response.data.wantsBachelorParty || false,
        };
        
        console.log('Setting fetched data:', fetchedData);
        setSettings(prev => ({
          ...prev,
          ...fetchedData,
        }));
      } else {
        console.warn('Empty response from API, trying localStorage');
        // Fallback to localStorage
        const local = userDataStorage.getData('onboarding') || {};
        if (Object.keys(local).length > 0) {
          setSettings(prev => ({
            ...prev,
            ...local,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings from API:', error);
      // Load from local storage as fallback
      try {
        const local = userDataStorage.getData('onboarding') || {};
        console.log('Loading from localStorage as fallback:', local);
        if (Object.keys(local).length > 0) {
          setSettings(prev => ({
            ...prev,
            ...local,
          }));
        }
      } catch (e) {
        console.error('Failed to load local settings:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      console.log('Saving settings:', settings);
      
      // Save via AppContext hook (automatically saves to server + updates context)
      await saveOnboarding(settings as any);
      
      console.log('Settings saved and context updated');
      
      // Also update localStorage
      userDataStorage.setData('onboarding', JSON.stringify(settings));
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message
        : 'Failed to save settings. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof OnboardingData, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const togglePriority = (priority: string) => {
    const current = Array.isArray(settings.topPriority) ? settings.topPriority : [];
    if (current.includes(priority)) {
      updateSetting('topPriority', current.filter(p => p !== priority));
    } else {
      updateSetting('topPriority', [...current, priority]);
    }
  };

  const toggleReligion = (religion: string) => {
    const current = Array.isArray(settings.religions) ? settings.religions : [];
    if (current.includes(religion)) {
      updateSetting('religions', current.filter(r => r !== religion));
    } else {
      updateSetting('religions', [...current, religion]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const priorities = ['Budget', 'Guest Experience', 'Venue', 'Photography', 'Catering', 'Entertainment'];
  const styles = ['Traditional', 'Modern', 'Rustic', 'Elegant', 'Casual', 'Destination'];
  const religions = [
    'Christianity', 'Judaism', 'Islam', 'Hinduism', 'Buddhism', 'Sikhism',
    'Bahá\'í', 'Jainism', 'Shinto', 'Taoism', 'Zoroastrianism', 'Wicca',
    'Native American', 'African Traditional', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Role & Wedding Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Wedding Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
            <select
              value={settings.role}
              onChange={(e) => updateSetting('role', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select role...</option>
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
              <option value="partner">Partner</option>
              <option value="parent">Parent/Guardian</option>
              <option value="planner">Wedding Planner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
            <input
              type="date"
              value={settings.weddingDate || ''}
              onChange={(e) => updateSetting('weddingDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Time</label>
            <input
              type="time"
              value={settings.weddingTime || ''}
              onChange={(e) => updateSetting('weddingTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Wedding Location</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={settings.weddingCity || ''}
              onChange={(e) => updateSetting('weddingCity', e.target.value)}
              placeholder="e.g., San Francisco"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State/Region</label>
            <input
              type="text"
              value={settings.weddingState || ''}
              onChange={(e) => updateSetting('weddingState', e.target.value)}
              placeholder="e.g., California"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={settings.weddingCountry || 'United States'}
              onChange={(e) => updateSetting('weddingCountry', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Wedding Style */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Wedding Style</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => updateSetting('weddingStyle', style)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                settings.weddingStyle === style
                  ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Top Priorities</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={() => togglePriority(priority)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                settings.topPriority?.includes(priority)
                  ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      {/* Ceremony Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Church className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Ceremony Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isReligious || false}
                onChange={(e) => updateSetting('isReligious', e.target.checked)}
                className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-gray-700">This is a religious ceremony</span>
            </label>
          </div>

          {settings.isReligious && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Religion(s) - Select all that apply
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {religions.map((religion) => (
                    <button
                      key={religion}
                      onClick={() => toggleReligion(religion)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                        settings.religions?.includes(religion)
                          ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {religion}
                    </button>
                  ))}
                </div>
              </div>

              {settings.religions && settings.religions.length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Interfaith Wedding:</strong> You've selected multiple religions. 
                    We'll help you find officiants and vendors experienced with interfaith ceremonies.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Officiant Type</label>
                <select
                  value={settings.ceremonyDetails?.officiantType || ''}
                  onChange={(e) => updateSetting('ceremonyDetails', {
                    ...settings.ceremonyDetails,
                    officiantType: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select officiant type...</option>
                  <option value="religious">Religious Leader (Priest, Rabbi, Imam, etc.)</option>
                  <option value="civil">Civil Officiant (Judge, Justice of Peace)</option>
                  <option value="friend">Friend or Family Member</option>
                  <option value="professional">Professional Celebrant</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Budget & Guest Count */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Budget & Guests</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.estimatedBudget || ''}
                onChange={(e) => updateSetting('estimatedBudget', Number(e.target.value))}
                placeholder="25000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Guest Count</label>
            <input
              type="number"
              value={settings.guestCount || ''}
              onChange={(e) => updateSetting('guestCount', Number(e.target.value))}
              placeholder="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
