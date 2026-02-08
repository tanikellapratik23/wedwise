import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckSquare, Heart, MapPin, Briefcase, Sparkles, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { authStorage } from '../../utils/auth';
import { getBudgetOptimizationSuggestions, getCityAverageCost } from '../../utils/cityData';
import { generateAIBudgetSuggestions } from '../../utils/aiBudgetHelper';

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
      const localOnboarding = JSON.parse(localStorage.getItem('onboarding') || 'null');
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white border border-primary-400/30">
        <div className="flex items-center space-x-4">
          <Heart className="w-10 h-10 drop-shadow-lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-white drop-shadow-lg">
              Welcome back{userName ? `, ${userName}` : ''}!
            </h1>
            {!isLoading && userSettings?.weddingCity && (
              <div className="flex items-center gap-2 text-white/90 text-xs drop-shadow-md mb-2">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">{userSettings.weddingCity}, {userSettings.weddingState || userSettings.weddingCountry}</span>
              </div>
            )}
            {!isLoading && userSettings?.weddingDate && (
              <p className="text-white/90 text-xs drop-shadow-md">
                📅 {new Date(userSettings.weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Days Until Wedding */}
      {!isLoading && stats.daysUntilWedding > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-200/50 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Wedding Day</h2>
          <div className="text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-primary-500 bg-clip-text text-transparent mb-2">
            {stats.daysUntilWedding}
          </div>
          <p className="text-xl font-semibold text-gray-700">
            {stats.daysUntilWedding === 1 ? 'day' : 'days'} to go 💕
          </p>
          {userSettings?.weddingTime && (
            <p className="text-gray-500 text-sm mt-3">
              {stats.hoursUntilWedding} hours, {stats.minutesUntilWedding} minutes
            </p>
          )}
        </div>
      )}

      {/* Quick Actions - Moved up and always shown */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className={`${action.color} hover:scale-105 text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <span className="block text-sm font-bold">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Budget Optimization - ONLY SHOWN WHEN SUGGESTIONS EXIST */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-purple-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
              AI Budget Optimization
            </h2>
            <button
              onClick={() => generateSuggestions(userSettings)}
              disabled={loadingSuggestions}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${loadingSuggestions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <span className="text-2xl">{suggestion.split(' ')[0]}</span>
                <p className="text-gray-700 text-sm flex-1 font-medium leading-relaxed">{suggestion.substring(suggestion.indexOf(' ') + 1)}</p>
              </div>
            ))}
          </div>
          {userSettings?.weddingCity && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-700 font-medium">
                <strong>City Average:</strong> ${getCityAverageCost(userSettings.weddingCity).toLocaleString()} 
                {userSettings.estimatedBudget && (
                  <span className={userSettings.estimatedBudget < getCityAverageCost(userSettings.weddingCity) ? 'text-orange-600' : 'text-green-600'}>
                    {' '}(Your budget: ${userSettings.estimatedBudget.toLocaleString()})
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
