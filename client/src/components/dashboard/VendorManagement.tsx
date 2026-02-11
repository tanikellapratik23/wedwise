import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Globe, CheckCircle, Heart, Star, Trash2, TrendingUp, BarChart3, Calendar, DollarSign, Grid, List as ListIcon } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatNumberWithCommas } from '../../utils/formatting';
import { userDataStorage } from '../../utils/userDataStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Vendor {
  _id?: string;
  id: string;
  name: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  estimatedCost?: number;
  actualCost?: number;
  depositPaid?: number;
  status: 'researching' | 'contacted' | 'booked' | 'paid';
  notes?: string;
  location?: { city: string; state: string };
  rating?: number;
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadFavoriteVendors();
    
    // Listen for vendor favorites from VendorSearch
    const handleVendorFavorited = (event: any) => {
      console.log('Vendor favorited event received:', event.detail);
      loadFavoriteVendors(); // Refresh the list
    };
    
    window.addEventListener('vendorFavorited', handleVendorFavorited);
    return () => window.removeEventListener('vendorFavorited', handleVendorFavorited);
  }, []);

  const loadFavoriteVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch from server first
      try {
        const response = await axios.get(`${API_URL}/api/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success && Array.isArray(response.data.data)) {
          const serverVendors = response.data.data.map((v: any) => ({
            ...v,
            id: v._id || v.id,
          }));
          setVendors(serverVendors);
          
          // Also sync to localStorage
          userDataStorage.setData('myVendors', JSON.stringify(serverVendors));
          setLoading(false);
          return;
        }
      } catch (serverError) {
        console.error('Failed to fetch from server, falling back to localStorage:', serverError);
      }
      
      // Fallback to localStorage if server fails
      const savedVendors = userDataStorage.getData('myVendors');
      if (savedVendors) {
        const parsed = JSON.parse(savedVendors);
        if (Array.isArray(parsed)) {
          setVendors(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load vendors:', e);
      userDataStorage.removeData('myVendors');
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to remove this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const vendor = vendors.find(v => v._id === vendorId);
      
      if (vendor?._id) {
        await axios.delete(`${API_URL}/api/vendors/${vendor._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      // Update local state
      setVendors(vendors.filter(v => v._id !== vendorId));
      
      // Update localStorage
      const updated = vendors.filter(v => v._id !== vendorId);
      userDataStorage.setData('myVendors', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      researching: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      booked: 'bg-green-100 text-green-700',
      paid: 'bg-purple-100 text-purple-700',
    };
    return colors[status as keyof typeof colors];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const vendorsArray = Array.isArray(vendors) ? vendors : [];
  const categories = [...new Set(vendorsArray.map((v) => v.category))];

  const filteredVendors = vendorsArray.filter((vendor) => {
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const stats = {
    total: vendorsArray.length,
    booked: vendorsArray.filter((v) => v.status === 'booked').length,
    researching: vendorsArray.filter((v) => v.status === 'researching').length,
    contacted: vendorsArray.filter((v) => v.status === 'contacted').length,
    totalBudget: vendorsArray.reduce((sum, v) => sum + (v.estimatedCost || 0), 0),
    totalSpent: vendorsArray.reduce((sum, v) => sum + (v.actualCost || 0), 0),
    totalPaid: vendorsArray.reduce((sum, v) => sum + (v.depositPaid || 0), 0),
  };

  // Category breakdown for charts
  const categoryData = categories.map(cat => {
    const catVendors = vendorsArray.filter(v => v.category === cat);
    return {
      name: cat,
      count: catVendors.length,
      budget: catVendors.reduce((sum, v) => sum + (v.estimatedCost || 0), 0),
      spent: catVendors.reduce((sum, v) => sum + (v.actualCost || 0), 0),
    };
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'Researching', value: stats.researching, fill: '#9CA3AF' },
    { name: 'Contacted', value: stats.contacted, fill: '#3B82F6' },
    { name: 'Booked', value: stats.booked, fill: '#10B981' },
    { name: 'Paid', value: vendorsArray.filter(v => v.status === 'paid').length, fill: '#8B5CF6' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Vendor Management</h1>
          <p className="text-gray-100 mt-1 drop-shadow-md">Track vendors, contracts, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-pink-600' : 'bg-white/20 text-white'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-pink-600' : 'bg-white/20 text-white'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg transition ${viewMode === 'analytics' ? 'bg-white text-pink-600' : 'bg-white/20 text-white'}`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg ml-4">
            <Plus className="w-5 h-5" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Booked</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.booked}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalBudget)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="booked">Booked</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition relative">
            {/* Favorite Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-xs text-red-600 font-medium">Favorited</span>
            </div>

            <div className="flex items-start justify-between mb-4 pr-24">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                <p className="text-sm text-gray-100 mt-1 drop-shadow-md">{vendor.category}</p>
                {(vendor as any).rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{(vendor as any).rating}</span>
                  </div>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </span>
            </div>

            {vendor.contactPerson && (
              <p className="text-sm text-gray-600 mb-3">Contact: {vendor.contactPerson}</p>
            )}

            <div className="space-y-2 mb-4">
              {vendor.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`mailto:${vendor.email}`} className="hover:text-primary-600">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-primary-600">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center">
                  <a
                    href={`https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                </div>
              )}
            </div>

            {(vendor.estimatedCost || vendor.actualCost) && (
              <div className="border-t border-gray-200 pt-4 space-y-2">
                {vendor.estimatedCost && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estimated:</span>
                    <span className="font-medium text-gray-900">${vendor.estimatedCost.toLocaleString()}</span>
                  </div>
                )}
                {vendor.actualCost && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Actual:</span>
                    <span className="font-medium text-gray-900">${vendor.actualCost.toLocaleString()}</span>
                  </div>
                )}
                {vendor.depositPaid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Deposit Paid:
                    </span>
                    <span className="font-medium text-green-600">${vendor.depositPaid.toLocaleString()}</span>
                  </div>
                )}
                {vendor.actualCost && vendor.depositPaid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium text-red-600">
                      ${(vendor.actualCost - vendor.depositPaid).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {vendor.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">{vendor.notes}</p>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg font-medium text-sm transition">
                Edit
              </button>
              <button 
                onClick={() => deleteVendor(vendor._id || vendor.id)}
                className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
            </div>
          ))}
        </>
      )}

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {filterStatus !== 'all' || filterCategory !== 'all' ? 'No vendors match your filters' : 'No favorited vendors yet'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Browse vendors in the Vendor Search page and click the heart icon to add them here
          </p>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vendor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Est. Cost</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actual</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Paid</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-sm text-gray-600">{vendor.contactPerson || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{vendor.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {vendor.estimatedCost ? `$${vendor.estimatedCost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {vendor.actualCost ? `$${vendor.actualCost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                      {vendor.depositPaid ? `$${vendor.depositPaid.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vendor.rating && (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{vendor.rating}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Actual by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Budget vs Actual
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#ec4899" name="Budget" />
                <Bar dataKey="spent" fill="#8b5cf6" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Vendor Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Vendors by Category
            </h3>
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-500" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Budget</span>
                <span className="font-bold text-gray-900">${stats.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Spent</span>
                <span className="font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Paid</span>
                <span className="font-bold text-green-600">${stats.totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Remaining</span>
                <span className="font-bold text-orange-600">${(stats.totalBudget - stats.totalSpent).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
