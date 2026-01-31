import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingDown, TrendingUp, MapPin, Sparkles, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import { getCityData, getBudgetOptimizationSuggestions } from '../../utils/cityData';

interface BudgetCategory {
  id: string;
  name: string;
  estimatedAmount: number;
  actualAmount: number;
  paid: number;
}

export default function BudgetTracker() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);

  const [userSettings, setUserSettings] = useState<any>(null);
  const [cityData, setCityData] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setUserSettings(response.data);
        
        if (response.data.weddingCity) {
          const data = getCityData(response.data.weddingCity);
          setCityData(data);

          // Generate AI budget suggestions
          const totalBudget = categories.reduce((sum, cat) => sum + cat.estimatedAmount, 0);
          const suggestions = getBudgetOptimizationSuggestions(
            response.data.estimatedBudget || totalBudget,
            response.data.guestCount || 150,
            response.data.weddingCity,
            response.data.topPriority || []
          );
          setAiSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.estimatedAmount, 0);
  const totalActual = categories.reduce((sum, cat) => sum + cat.actualAmount, 0);
  const totalPaid = categories.reduce((sum, cat) => sum + cat.paid, 0);
  const remaining = totalBudget - totalActual;

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.actualAmount,
  }));

  const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

  const barData = categories.map((cat) => ({
    name: cat.name,
    estimated: cat.estimatedAmount,
    actual: cat.actualAmount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-500 mt-1">Monitor your wedding expenses</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Actual Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalActual.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalPaid.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
              <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </p>
            </div>
            {remaining >= 0 ? (
              <TrendingDown className="w-10 h-10 text-yellow-500" />
            ) : (
              <TrendingUp className="w-10 h-10 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* City Budget Comparison */}
      {cityData && userSettings?.weddingCity && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {userSettings.weddingCity} Average Wedding Costs
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Average Total</p>
              <p className="text-2xl font-bold text-gray-900">${cityData.averageCost.toLocaleString()}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Typical Guests</p>
              <p className="text-2xl font-bold text-gray-900">{cityData.guestAverage}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Venue Range</p>
              <p className="text-lg font-bold text-gray-900">
                ${cityData.venueRange[0].toLocaleString()} - ${cityData.venueRange[1].toLocaleString()}
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Catering/Person</p>
              <p className="text-lg font-bold text-gray-900">
                ${cityData.cateringPerPerson[0]} - ${cityData.cateringPerPerson[1]}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-blue-100 rounded-lg p-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Your total budget of ${totalBudget.toLocaleString()} is{' '}
              {totalBudget < cityData.averageCost ? (
                <span className="font-semibold">{Math.round((1 - totalBudget / cityData.averageCost) * 100)}% below</span>
              ) : (
                <span className="font-semibold">{Math.round((totalBudget / cityData.averageCost - 1) * 100)}% above</span>
              )}{' '}
              the {userSettings.weddingCity} average.
            </p>
          </div>
        </div>
      )}

      {/* AI Budget Optimization */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Budget Optimization</h2>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-4">
                <span className="text-2xl">{suggestion.split(' ')[0]}</span>
                <p className="text-gray-700 text-sm flex-1">{suggestion.substring(suggestion.indexOf(' ') + 1)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${((entry.value / totalActual) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estimated vs Actual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimated" fill="#8b5cf6" name="Estimated" />
              <Bar dataKey="actual" fill="#ec4899" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => {
              const remaining = category.actualAmount - category.paid;
              const percentSpent = (category.actualAmount / category.estimatedAmount) * 100;
              
              return (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${category.estimatedAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${category.actualAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ${category.paid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${remaining.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            percentSpent > 100 ? 'bg-red-500' : percentSpent > 90 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentSpent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{percentSpent.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
