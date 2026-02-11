import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckSquare, Heart, MapPin, Briefcase, Sparkles, RotateCw } from 'lucide-react';
import axios from 'axios';
import { authStorage } from '../../utils/auth';
import { userDataStorage } from '../../utils/userDataStorage';
import { getBudgetOptimizationSuggestions, getCityAverageCost } from '../../utils/cityData';
import { generateAIBudgetSuggestions } from '../../utils/aiBudgetHelper';
import { formatNumberWithCommas, formatCurrency } from '../../utils/formatting';

export default function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGuests: 0,
    confirmedGuests: 0,
    totalBudget: 0,
    spent: 0,
    completedTasks: 0,
    totalTasks: 0,
    daysUntilWedding: 0,
    hoursUntilWedding: 0,
    minutesUntilWedding: 0,
  });

  const [userSettings, setUserSettings] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Helper to capitalize first letter of name
  const capitalizeName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const generateSuggestions = async (settings: any) => {
    if (!settings) return;
    setLoadingSuggestions(true);
    try {
      if (settings.weddingCity && settings.estimatedBudget) {
        // Try AI-powered suggestions first
        try {
          const aiSuggestions = await generateAIBudgetSuggestions(
            settings.estimatedBudget,
            settings.guestCount || 150,
            settings.weddingCity,
            settings.topPriority || []
          );
          
          if (aiSuggestions.length > 0) {
            setAiSuggestions(aiSuggestions);
          } else {
            // Fallback to static suggestions
            const staticSuggestions = getBudgetOptimizationSuggestions(
              settings.estimatedBudget,
              settings.guestCount || 150,
              settings.weddingCity,
              settings.topPriority || []
            );
            setAiSuggestions(staticSuggestions);
          }
        } catch (error) {
          console.error('Failed to generate AI suggestions, using fallback:', error);
          const staticSuggestions = getBudgetOptimizationSuggestions(
            settings.estimatedBudget,
            settings.guestCount || 150,
            settings.weddingCity,
            settings.topPriority || []
          );
          setAiSuggestions(staticSuggestions);
        }
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // Load user name immediately from sessionStorage to prevent glitch
    try {
      const user = authStorage.getUser();
      if (user) {
        const firstName = user.name?.split(' ')[0] || '';
        setUserName(capitalizeName(firstName));
      }
    } catch (e) {
      console.error('Failed to load user name:', e);
    }
    
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    // Apply any locally persisted onboarding immediately for fast UX
    try {
      const localOnboarding = userDataStorage.getData('onboarding') || [];
      const localUser = JSON.parse(localStorage.getItem('user') || 'null');
      const data = localOnboarding || localUser;
      if (data) {
        setUserSettings(data);
        setStats(prev => ({
          ...prev,
          totalGuests: data.guestCount || 0,
          confirmedGuests: 0,
          totalBudget: data.estimatedBudget || 0,
        }));
        
        // Generate suggestions for local data
        generateSuggestions(data);
        
        // Ensure user name is set from local data
        if (localUser?.name && !userName) {
          const firstName = localUser.name.split(' ')[0] || '';
          setUserName(capitalizeName(firstName));
        }
      }
    } catch (e) {
      // ignore local parse errors
    }
    try {
      const token = authStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await axios.get('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setUserSettings(response.data);
        
        // Update stats from user data
        setStats(prev => ({
          ...prev,
          totalGuests: response.data.guestCount || 0,
          confirmedGuests: 0,
          totalBudget: response.data.estimatedBudget || 0,
          spent: 0,
          completedTasks: 0,
          totalTasks: 0,
        }));
        
        // Calculate days until wedding
        if (response.data.weddingDate) {
          const weddingDateTime = new Date(response.data.weddingDate);
          
          // If wedding time is set, add it to the date
          if (response.data.weddingTime) {
            const [hours, minutes] = response.data.weddingTime.split(':');
            weddingDateTime.setHours(parseInt(hours), parseInt(minutes));
          }
          
          const now = new Date();
          const diffMs = weddingDateTime.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          setStats(prev => ({
            ...prev,
            daysUntilWedding: diffDays > 0 ? diffDays : 0,
            hoursUntilWedding: diffHours > 0 ? diffHours : 0,
            minutesUntilWedding: diffMinutes > 0 ? diffMinutes : 0,
          }));
        }
        
        // Generate AI suggestions
        generateSuggestions(response.data);
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Redesigned */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-200/50">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-primary-600 bg-clip-text text-transparent mb-2">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
        </div>

        {!isLoading && userSettings?.weddingCity && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-1">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span>{userSettings.weddingCity}, {userSettings.weddingState || userSettings.weddingCountry}</span>
            </div>
          </div>
        )}

        {!isLoading && userSettings?.weddingDate && (
          <div className="text-gray-600 text-md font-medium">
            📅 {new Date(userSettings.weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        )}

        {!isLoading && stats.daysUntilWedding > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-gray-600 font-medium mb-1">Your Wedding Day</div>
            <div className="flex items-baseline gap-3">
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-500 to-primary-500 bg-clip-text text-transparent">
                {stats.daysUntilWedding}
              </div>
              <div className="text-xl font-semibold text-gray-700">
                {stats.daysUntilWedding === 1 ? 'day' : 'days'} to go 💕
              </div>
            </div>
            {userSettings?.weddingTime && (
              <p className="text-gray-500 text-sm mt-2">
                {stats.hoursUntilWedding} hours, {stats.minutesUntilWedding} minutes
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
        <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Guest', icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', action: () => navigate('/dashboard/guests') },
            { label: 'Add Expense', icon: DollarSign, color: 'bg-gradient-to-br from-green-500 to-green-600', action: () => navigate('/dashboard/budget') },
            { label: 'New Task', icon: CheckSquare, color: 'bg-gradient-to-br from-purple-500 to-purple-600', action: () => navigate('/dashboard/todos') },
            { label: 'Add Vendor', icon: Briefcase, color: 'bg-gradient-to-br from-pink-500 to-pink-600', action: () => navigate('/dashboard/vendor-search') },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} hover:scale-105 text-white p-4 md:p-5 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer font-semibold text-sm md:text-base`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="block">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Budget Optimization - ONLY SHOWN WHEN SUGGESTIONS EXIST */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-purple-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
              AI Budget Optimization
            </h2>
            <button
              onClick={() => generateSuggestions(userSettings)}
              disabled={loadingSuggestions}
              className="p-2 hover:bg-purple-200 rounded-lg transition disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RotateCw className={`w-5 h-5 text-purple-600 ${loadingSuggestions ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <span className="text-2xl flex-shrink-0">{suggestion.split(' ')[0]}</span>
                <p className="text-gray-700 text-sm flex-1 font-medium leading-relaxed">{suggestion.substring(suggestion.indexOf(' ') + 1)}</p>
              </div>
            ))}
          </div>
          {userSettings?.weddingCity && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-700 font-medium">
                <strong>City Average:</strong> {formatCurrency(getCityAverageCost(userSettings.weddingCity))} 
                {userSettings.estimatedBudget && (
                  <span className={userSettings.estimatedBudget < getCityAverageCost(userSettings.weddingCity) ? 'text-orange-600' : 'text-green-600'}>
                    {' '}(Your budget: {formatCurrency(userSettings.estimatedBudget)})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
