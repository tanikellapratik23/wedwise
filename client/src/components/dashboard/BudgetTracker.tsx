import { useState, useEffect, useRef } from 'react';
import { Plus, DollarSign, TrendingDown, TrendingUp, MapPin, Sparkles, Info, Trash2, Download, Upload, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { getCityData, getBudgetOptimizationSuggestions } from '../../utils/cityData';
import { isAutoSaveEnabled, setWithTTL } from '../../utils/autosave';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface BudgetCategory {
  _id?: string;
  id?: string;
  name: string;
  estimatedAmount: number;
  actualAmount: number;
  paid: number;
}

export default function BudgetTracker() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    estimatedAmount: 0,
  });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [userSettings, setUserSettings] = useState<any>(null);
  const [cityData, setCityData] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load from localStorage immediately for instant display
    try {
      const cached = localStorage.getItem('budget');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cached budget:', e);
    }
    
    fetchUserSettings();
    fetchBudgetCategories();
  }, []);

  // Save to localStorage immediately whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      try {
        localStorage.setItem('budget', JSON.stringify(categories));
        if (isAutoSaveEnabled()) setWithTTL('budget', categories, 24 * 60 * 60 * 1000);
      } catch (e) {
        console.error('Failed to save budget:', e);
      }
    }
  }, [categories]);

  const fetchBudgetCategories = async () => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const cached = localStorage.getItem('budget');
        if (cached) setCategories(JSON.parse(cached));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budget categories:', error);
      const cached = localStorage.getItem('budget');
      if (cached) setCategories(JSON.parse(cached));
    }
  };

  const addCategory = async () => {
    if (!newCategory.name || newCategory.estimatedAmount <= 0) {
      alert('Please enter category name and estimated amount');
      return;
    }
    
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const cat = {
          id: `local-${Date.now()}`,
          name: newCategory.name,
          estimatedAmount: newCategory.estimatedAmount,
          actualAmount: 0,
          paid: 0,
        } as BudgetCategory;
        const next = [...categories, cat];
        setCategories(next);
        localStorage.setItem('budget', JSON.stringify(next));
        setShowAddModal(false);
        setNewCategory({ name: '', estimatedAmount: 0 });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/budget`, {
        name: newCategory.name,
        estimatedAmount: newCategory.estimatedAmount,
        actualAmount: 0,
        paid: 0,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setCategories([...categories, response.data.data]);
        setShowAddModal(false);
        setNewCategory({ name: '', estimatedAmount: 0 });
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const next = (Array.isArray(categories) ? categories : []).filter(c => c.id !== id && c._id !== id);
        setCategories(next);
        localStorage.setItem('budget', JSON.stringify(next));
        return;
      }

      const token = localStorage.getItem('token');
      const category = (Array.isArray(categories) ? categories : []).find(c => c.id === id || c._id === id);
      const categoryId = category?._id || id;

      await axios.delete(`${API_URL}/api/budget/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories((Array.isArray(categories) ? categories : []).filter(c => c.id !== id && c._id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const updateCategoryAmount = async (id: string, field: 'actualAmount' | 'paid', value: number) => {
    const category = (Array.isArray(categories) ? categories : []).find(c => c.id === id || c._id === id);
    if (!category) return;
    
    const categoryId = category._id || id;
    const updatedCategory = { ...category, [field]: value };
    
    // Optimistic update
    const categoriesArray = Array.isArray(categories) ? categories : [];
    setCategories(categoriesArray.map(cat => 
      (cat.id === id || cat._id === id) ? { ...cat, [field]: value } : cat
    ));
    
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const catsArray = Array.isArray(categories) ? categories : [];
        localStorage.setItem('budget', JSON.stringify(catsArray.map(cat => 
          (cat.id === id || cat._id === id) ? { ...cat, [field]: value } : cat
        )));
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/budget/${categoryId}`, updatedCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      // Revert on error
      fetchBudgetCategories();
    }
  };

  const saveBudget = async () => {
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      
      if (offlineMode) {
        localStorage.setItem('budget', JSON.stringify(categories));
        alert('Budget saved locally');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Save each category individually
      for (const category of categories) {
        if (category._id) {
          // Update existing category
          await axios.put(`${API_URL}/api/budget/${category._id}`, category, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (category.id && !category.id.startsWith('local-')) {
          // Create new category if not local
          await axios.post(`${API_URL}/api/budget`, category, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      
      alert('Budget saved successfully!');
    } catch (error) {
      console.error('Failed to save budget:', error);
      alert('Failed to save budget. Check console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const exportBudget = () => {
    // Create worksheets data
    const wsData: (string | number)[][] = [];
    
    // Title
    wsData.push(['Wedding Budget Breakdown']);
    wsData.push(['']);
    wsData.push(['Category', 'Estimated', 'Actual', 'Paid', 'Remaining']);
    
    // Add categories
    let totalEstimated = 0;
    let totalActual = 0;
    let totalPaid = 0;
    
    categories.forEach(cat => {
      const remaining = cat.estimatedAmount - cat.actualAmount;
      wsData.push([
        cat.name,
        cat.estimatedAmount,
        cat.actualAmount,
        cat.paid,
        remaining
      ]);
      totalEstimated += cat.estimatedAmount;
      totalActual += cat.actualAmount;
      totalPaid += cat.paid;
    });
    
    // Summary
    wsData.push(['']);
    wsData.push(['TOTAL', totalEstimated, totalActual, totalPaid, totalEstimated - totalActual]);
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Budget');
    
    // Download
    XLSX.writeFile(wb, 'vivaha-budget.xlsx');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BudgetCategory[];
      setCategories(data);
      localStorage.setItem('budget', JSON.stringify(data));
      alert('Budget imported successfully');
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import budget file');
    }
  };

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

  const categoriesArray = Array.isArray(categories) ? categories : [];
  const totalBudget = categoriesArray.reduce((sum, cat) => sum + cat.estimatedAmount, 0);
  const totalActual = categoriesArray.reduce((sum, cat) => sum + cat.actualAmount, 0);
  const totalPaid = categoriesArray.reduce((sum, cat) => sum + cat.paid, 0);
  const remaining = totalBudget - totalActual;

  const pieData = categoriesArray.map((cat) => ({
    name: cat.name,
    value: cat.actualAmount,
  }));

  const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

  const barData = categoriesArray.map((cat) => ({
    name: cat.name,
    estimated: cat.estimatedAmount,
    actual: cat.actualAmount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Budget Tracker</h1>
          <p className="text-gray-500 mt-1">Monitor your wedding expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="application/json" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-green-500 text-white rounded-md"> <Upload className="w-4 h-4 inline"/> Import</button>
          <button onClick={exportBudget} className="px-4 py-2 bg-blue-500 text-white rounded-md"> <Download className="w-4 h-4 inline"/> Export</button>
          <button onClick={saveBudget} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"> <Save className="w-4 h-4 inline"/> Save</button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Actual Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalActual.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Paid</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalPaid.toLocaleString()}</p>
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
              <p className={`text-3xl font-bold mt-2 ${remaining >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
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
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
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
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">AI Budget Optimization</h2>
          </div>
          <div className="space-y-3">
            {(Array.isArray(aiSuggestions) ? aiSuggestions : []).map((suggestion, index) => (
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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">Budget Distribution</h2>
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
                {(Array.isArray(pieData) ? pieData : []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">Estimated vs Actual</h2>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(categories) ? categories : []).map((category, index) => {
              const catId = category._id || category.id || '';
              const remaining = category.actualAmount - category.paid;
              const percentSpent = (category.actualAmount / category.estimatedAmount) * 100;
              
              return (
                <tr key={catId} className="hover:bg-gray-50">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={category.actualAmount}
                      onChange={(e) => updateCategoryAmount(catId, 'actualAmount', Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm border rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={category.paid}
                      onChange={(e) => updateCategoryAmount(catId, 'paid', Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm border rounded"
                    />
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteCategory(catId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-semibold tracking-tight mb-4">Add Budget Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Venue, Catering, Photography"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Amount *
                </label>
                <input
                  type="number"
                  value={newCategory.estimatedAmount}
                  onChange={(e) => setNewCategory({...newCategory, estimatedAmount: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
