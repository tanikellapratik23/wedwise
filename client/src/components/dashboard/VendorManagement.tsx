import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Globe, CheckCircle, Heart, Star } from 'lucide-react';

interface Vendor {
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
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    loadFavoriteVendors();
  }, []);

  const loadFavoriteVendors = () => {
    try {
      const savedVendors = localStorage.getItem('myVendors');
      if (savedVendors) {
        const parsed = JSON.parse(savedVendors);
        if (Array.isArray(parsed)) {
          setVendors(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load vendors:', e);
      localStorage.removeItem('myVendors');
    }
  };

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-500 mt-1">Manage your wedding vendors and contracts</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Booked</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.booked}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">Contacted</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.contacted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-500 font-medium">Researching</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.researching}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
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

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <p className="text-sm text-gray-500 mt-1">{vendor.category}</p>
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
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <a
                    href={`https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600"
                  >
                    {vendor.website}
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
              <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No favorited vendors yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Browse vendors in the Vendor Search page and click the heart icon to add them here
          </p>
        </div>
      )}
    </div>
  );
}
