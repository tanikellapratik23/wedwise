import { useState, useEffect } from 'react';
import { Heart, Users, DollarSign, Plane, Hotel, Trash2, Plus, Download, Share2 } from 'lucide-react';
import axios from 'axios';

interface BachelorTripData {
  _id: string;
  eventName: string;
  eventType: 'bachelor' | 'bachelorette';
  tripDate: string;
  location: {
    city: string;
    state?: string;
    country?: string;
  };
  estimatedBudget: number;
  totalExpenses: number;
  attendees: Array<{
    userId?: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
  expenses: any[];
  flights: any[];
  stays: any[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BachelorDashboard() {
  const [trip, setTrip] = useState<BachelorTripData | null>(null);
  const [showTripForm, setShowTripForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'attendees' | 'flights' | 'stays'>('overview');
  
  const [tripFormData, setTripFormData] = useState({
    eventName: '',
    eventType: 'bachelorette' as 'bachelor' | 'bachelorette',
    tripDate: '',
    location: { city: '', state: '', country: '' },
    estimatedBudget: 0,
  });

  useEffect(() => {
    fetchTrip();
  }, []);

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bachelor-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTrip(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bachelor trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/bachelor-trip/create`, tripFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTrip(response.data.data);
        setShowTripForm(false);
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
      alert('Failed to create trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bachelor / Bachelorette Trip</h1>
          <p className="text-gray-600 mt-2">Coordinate your trip, budget, and expenses in one place</p>
        </div>

        {!showTripForm ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No trip planned yet</h2>
            <p className="text-gray-600 mb-6">Create your first trip to get started</p>
            <button
              onClick={() => setShowTripForm(true)}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
            >
              Create Trip
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Your Trip</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sarah's Bachelorette Party"
                  value={tripFormData.eventName}
                  onChange={(e) => setTripFormData({ ...tripFormData, eventName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTripFormData({ ...tripFormData, eventType: 'bachelor' })}
                    className={`flex-1 py-2 rounded-lg border-2 transition ${
                      tripFormData.eventType === 'bachelor'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    Bachelor
                  </button>
                  <button
                    onClick={() => setTripFormData({ ...tripFormData, eventType: 'bachelorette' })}
                    className={`flex-1 py-2 rounded-lg border-2 transition ${
                      tripFormData.eventType === 'bachelorette'
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    Bachelorette
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g., Las Vegas"
                    value={tripFormData.location.city}
                    onChange={(e) => setTripFormData({
                      ...tripFormData,
                      location: { ...tripFormData.location, city: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    placeholder="e.g., Nevada"
                    value={tripFormData.location.state || ''}
                    onChange={(e) => setTripFormData({
                      ...tripFormData,
                      location: { ...tripFormData.location, state: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Date</label>
                  <input
                    type="date"
                    value={tripFormData.tripDate}
                    onChange={(e) => setTripFormData({ ...tripFormData, tripDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={tripFormData.estimatedBudget || ''}
                    onChange={(e) => setTripFormData({ ...tripFormData, estimatedBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateTrip}
                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition font-medium"
              >
                Create Trip
              </button>
              <button
                onClick={() => setShowTripForm(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const perPersonCost = trip.attendees.length > 0 ? trip.totalExpenses / trip.attendees.length : 0;
  const budgetRemaining = trip.estimatedBudget - trip.totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trip.eventName}</h1>
          <p className="text-gray-600 mt-1">
            {trip.location.city}, {trip.location.state} • {new Date(trip.tripDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-medium">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${trip.estimatedBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 font-medium">Spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${trip.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-medium">Per Person</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${perPersonCost.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 font-medium">Remaining</p>
          <p className={`text-2xl font-bold mt-2 ${budgetRemaining >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            ${Math.abs(budgetRemaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border-b border-gray-200">
        <div className="flex gap-8 p-4 px-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Heart },
            { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
            { id: 'attendees', label: 'Attendees', icon: Users },
            { id: 'flights', label: 'Flights', icon: Plane },
            { id: 'stays', label: 'Accommodations', icon: Hotel },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 border-b-2 transition whitespace-nowrap ${
                activeTab === id
                  ? 'border-pink-500 text-pink-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Attendees</p>
                  <p className="text-3xl font-bold text-gray-900">{trip.attendees.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Budget Status</p>
                  <p className={`text-3xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {budgetRemaining >= 0 ? 'Under' : 'Over'} Budget
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Expenses & Payments</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
            <p className="text-gray-600">Coming soon: Track shared expenses and who owes what</p>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Trip Attendees</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">
                <Plus className="w-4 h-4" />
                Add Attendee
              </button>
            </div>
            <div className="space-y-2">
              {(Array.isArray(trip.attendees) ? trip.attendees : []).map((attendee, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{attendee.name}</p>
                    {attendee.email && <p className="text-sm text-gray-600">{attendee.email}</p>}
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Flights</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">
                <Plus className="w-4 h-4" />
                Find Flights
              </button>
            </div>
            <p className="text-gray-600">Coming soon: Search and compare flights using Google Flights API</p>
          </div>
        )}

        {activeTab === 'stays' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Accommodations</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">
                <Plus className="w-4 h-4" />
                Find Stays
              </button>
            </div>
            <p className="text-gray-600">Coming soon: Search and book stays using Airbnb API integration</p>
          </div>
        )}
      </div>
    </div>
  );
}
