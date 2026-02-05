import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, CheckSquare, TrendingUp, Heart, MapPin, Church, Sparkles, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { getBudgetOptimizationSuggestions, getCeremonyPlanningSuggestions, getCityAverageCost } from '../../utils/cityData';

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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [ceremonySuggestions, setCeremonySuggestions] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localRestoreAvailable, setLocalRestoreAvailable] = useState(false);
  const [restored, setRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to capitalize first letter of name
  const capitalizeName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    // Load user name immediately from localStorage to prevent glitch
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const firstName = user.name?.split(' ')[0] || '';
        setUserName(capitalizeName(firstName));
      }
    } catch (e) {
      console.error('Failed to load user name:', e);
    }
    
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    setLoadError(null);
    setLocalRestoreAvailable(false);
    setRestored(false);
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
      const token = localStorage.getItem('token');
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
        if (response.data.weddingCity && response.data.estimatedBudget) {
          const suggestions = getBudgetOptimizationSuggestions(
            response.data.estimatedBudget,
            response.data.guestCount || 150,
            response.data.weddingCity,
            response.data.topPriority || []
          );
          setAiSuggestions(suggestions);
        }

        // Generate ceremony suggestions
        if (response.data.isReligious && response.data.religions) {
          const ceremonyTips = getCeremonyPlanningSuggestions(
            response.data.religions,
            response.data.religions.length > 1
          );
          setCeremonySuggestions(ceremonyTips);
        }
        setLocalRestoreAvailable(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      setIsLoading(false);
      setLoadError('Failed to load user settings from server');
      // Fallback to local onboarding data indicator
      try {
        const localOnboarding = JSON.parse(localStorage.getItem('onboarding') || 'null');
        const data = localOnboarding || JSON.parse(localStorage.getItem('user') || 'null');
        if (data) {
          setLocalRestoreAvailable(true);
          // do not auto-apply here; allow user to restore manually
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const restoreLocalOnboarding = () => {
    try {
      const localOnboarding = JSON.parse(localStorage.getItem('onboarding') || 'null');
      const data = localOnboarding || JSON.parse(localStorage.getItem('user') || 'null');
      if (!data) {
        setLoadError('No local onboarding data found');
        return;
      }
      setUserSettings(data);
      setStats(prev => ({
        ...prev,
        totalGuests: data.guestCount || 0,
        confirmedGuests: 0,
        totalBudget: data.estimatedBudget || 0,
        spent: 0,
        completedTasks: 0,
        totalTasks: 0,
      }));

      if (data.weddingDate) {
        const weddingDateTime = new Date(data.weddingDate);
        if (data.weddingTime) {
          const [hours, minutes] = data.weddingTime.split(':');
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

      // regenerate suggestions where possible
      if (data.weddingCity && data.estimatedBudget) {
        const suggestions = getBudgetOptimizationSuggestions(
          data.estimatedBudget,
          data.guestCount || 150,
          data.weddingCity,
          data.topPriority || []
        );
        setAiSuggestions(suggestions);
      }
      if (data.isReligious && data.religions) {
        const ceremonyTips = getCeremonyPlanningSuggestions(data.religions, data.religions.length > 1);
        setCeremonySuggestions(ceremonyTips);
      }
      setLoadError(null);
      setLocalRestoreAvailable(false);
      setRestored(true);
    } catch (e) {
      console.error('Restore failed', e);
      setLoadError('Failed to restore local onboarding');
    }
  };

  const budgetData = [
    { name: 'Spent', value: stats.spent },
    { name: 'Remaining', value: stats.totalBudget - stats.spent },
  ];

  const COLORS = ['#ec4899', '#e0e7ff'];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl shadow-md ${color}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white border border-primary-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="w-16 h-16" />
            <div className="min-h-[120px]">
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                Welcome back{userName ? `, ${userName}` : ''}!
              </h1>
              {!isLoading && userSettings?.weddingDate && (
                <p className="text-primary-100 text-sm mb-2">
                  📅 {new Date(userSettings.weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              {!isLoading && stats.daysUntilWedding > 0 && (
                <div>
                  <p className="text-primary-100 text-lg">
                    {stats.daysUntilWedding} days until your special day 💕
                  </p>
                  {userSettings?.weddingTime && (
                    <p className="text-primary-100 text-sm mt-1">
                      {stats.hoursUntilWedding} hours, {stats.minutesUntilWedding} minutes
                    </p>
                  )}
                </div>
              )}
              {!isLoading && userSettings?.weddingCity && (
                <div className="flex items-center gap-2 mt-2 text-primary-100">
                  <MapPin className="w-4 h-4" />
                  <span>{userSettings.weddingCity}, {userSettings.weddingState || userSettings.weddingCountry}</span>
                </div>
              )}
            </div>
          </div>
          {userSettings?.isReligious && userSettings?.religions && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Church className="w-5 h-5" />
                <span className="font-semibold">Ceremony Type</span>
              </div>
              <p className="text-sm text-primary-100">
                {userSettings.religions.length > 1 ? 'Interfaith' : userSettings.religions[0]} Wedding
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Budget Optimization */}
      {Array.isArray(aiSuggestions) && aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-purple-200/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-7 h-7 mr-2 text-purple-600" />
            AI Budget Optimization
          </h2>
          <div className="space-y-3">
            {(Array.isArray(aiSuggestions) ? aiSuggestions : []).map((suggestion, index) => (
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

      {/* Ceremony Planning Assistant */}
      {Array.isArray(ceremonySuggestions) && ceremonySuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4 flex items-center">
            <Church className="w-7 h-7 mr-2 text-blue-600" />
            Ceremony Planning Assistant
          </h2>
          <div className="space-y-3">
            {(Array.isArray(ceremonySuggestions) ? ceremonySuggestions : []).map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <span className="text-2xl">{suggestion.split(' ')[0]}</span>
                <p className="text-gray-700 text-sm flex-1 font-medium leading-relaxed">{suggestion.substring(suggestion.indexOf(' ') + 1)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Guests"
          value={`${stats.confirmedGuests}/${stats.totalGuests}`}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="Budget Used"
          value={stats.totalBudget > 0 ? `${Math.round((stats.spent / stats.totalBudget) * 100)}%` : '—'}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks Completed"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Calendar}
          label="Days to Go"
          value={stats.daysUntilWedding}
          color="bg-pink-100 text-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-primary-500" />
            Budget Overview
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-primary-500" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm font-medium">No recent activity yet</p>
              <p className="text-gray-400 text-xs mt-1">Start planning to see updates here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Error / Restore Banner */}
      {(loadError || localRestoreAvailable || restored) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${loadError ? 'bg-red-50/90 border border-red-200 text-red-800' : restored ? 'bg-green-50/90 border border-green-200 text-green-800' : 'bg-yellow-50/90 border border-yellow-200 text-yellow-800'}`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {loadError && (<div><strong>Error:</strong> {loadError}</div>)}
                {!loadError && localRestoreAvailable && (<div>Local onboarding data found — you can restore it to populate your dashboard immediately.</div>)}
                {restored && (<div>Local onboarding restored. Dashboard updated.</div>)}
              </div>
              <div className="flex items-center gap-2">
                {localRestoreAvailable && (
                  <button onClick={restoreLocalOnboarding} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md transition-all">Restore Local Onboarding</button>
                )}
                {loadError && (
                  <button onClick={() => { setLoadError(null); fetchUserSettings(); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all">Retry</button>
                )}
                {restored && (
                  <button onClick={() => setRestored(false)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all">Dismiss</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Quick Actions</h2>
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
                className={`${action.color} hover:scale-105 text-white p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <span className="block text-sm font-semibold">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
