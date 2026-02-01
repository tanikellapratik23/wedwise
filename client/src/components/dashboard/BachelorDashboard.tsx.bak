import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, MapPin, Users, DollarSign, Plane, Home, Loader, Heart, Share2, Download, Hotel, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { locationData, getActivities } from '../../utils/locationData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface BachelorTrip {
  _id?: string;
  userId: string;
  eventType: 'bachelor' | 'bachelorette';
  eventName: string;
  destination: string;
  state?: string;
  city?: string;
  startDate?: Date;
  tripDate?: string;
  budget?: number;
  estimatedBudget?: number;
  attendees: Array<{ name: string; email?: string }>;
  totalExpenses?: number;
  activities: string[];
  guestList: Array<{ name: string; email?: string; rsvp?: 'pending' | 'accepted' | 'declined' }>;
  expenses: any[];
  flights: any[];
  stays: any[];
  status: 'planning' | 'booked' | 'completed';
  location?: { city: string; state: string; country: string };
}

export default function BachelorDashboard() {
  const [activeTab, setActiveTab] = useState<'trip-setup' | 'budget' | 'attendees' | 'flights' | 'stays'>('trip-setup');
  const [trip, setTrip] = useState<BachelorTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedState, setSelectedState] = useState('CA');
  const [eventType, setEventType] = useState<'bachelor' | 'bachelorette'>('bachelor');
  const [eventName, setEventName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');

  useEffect(() => {
    fetchTrip();
  }, []);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bachelor-trip`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      if (response.data && response.data) {
        const tripData = response.data.data || response.data;
        setTrip(tripData);
      }
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async () => {
    setError('');
    if (!eventName || !destination || !tripDate || !totalBudget) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const newTrip = {
        eventName,
        eventType,
        tripDate,
        location: { city: destination, state: selectedState, country: selectedCountry },
        estimatedBudget: parseFloat(totalBudget),
      };

      console.log('Creating trip with data:', newTrip);
      
      const response = await axios.post(`${API_URL}/api/bachelor-trip/create`, newTrip, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Trip creation response:', response.data);

      if (response.data.success || response.data.data) {
        setTrip(response.data.data);
        setEventName('');
        setDestination('');
        setTripDate('');
        setTotalBudget('');
        setError('');
        alert('Trip created successfully!');
      } else {
        setError(response.data.error || 'Failed to create trip');
      }
    } catch (error: any) {
      console.error('Trip creation error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create trip';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Get countries/regions list
  const countryList = useMemo(() => {
    return Object.entries(locationData).map(([key, val]) => ({
      code: key,
      label: (val as any).label,
    }));
  }, []);

  // Get states/cities for selected country
  const getStateList = useMemo(() => {
    const country = locationData[selectedCountry as keyof typeof locationData];
    if (!country) return [];

    if ('states' in country) {
      return Object.entries((country as any).states).map(([key, state]) => ({
        code: key,
        label: typeof state === 'string' ? state : (state as any).label,
      }));
    }
    if ('destinations' in country) {
      return Object.entries((country as any).destinations).map(([key, dest]) => ({
        code: key,
        label: (dest as any).label,
      }));
    }
    if ('countries' in country) {
      return Object.entries((country as any).countries).map(([key, dest]) => ({
        code: key,
        label: (dest as any).label,
      }));
    }
    return [];
  }, [selectedCountry]);

  // Get cities for selected state (US only)
  const getCitiesList = useMemo(() => {
    const country = locationData[selectedCountry as keyof typeof locationData];
    if (selectedCountry === 'US' && 'states' in country) {
      const state = (country as any).states[selectedState];
      if (state && typeof state === 'object' && 'cities' in state) {
        return (state as any).cities;
      }
    }
    return [];
  }, [selectedCountry, selectedState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {trip ? (trip.eventType === 'bachelor' ? '🎉 Bachelor Trip' : '👰 Bachelorette Party') : 'Plan Your Trip'}
        </h1>
        <p className="text-gray-600 mt-1">
          {trip ? `${trip.eventName} in ${trip.location?.city || 'destination'}` : 'Create and manage your bachelor/bachelorette trip'}
        </p>
      </div>

      {/* Event Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <p className="text-sm text-gray-600 font-medium mb-4">Event Type</p>
        <div className="flex gap-4">
          {(['bachelor', 'bachelorette'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setEventType(type)}
              disabled={!!trip}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                eventType === type
                  ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                  : 'border-gray-200 hover:border-pink-300 text-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {type === 'bachelor' ? '🎯 Bachelor Trip' : '💎 Bachelorette Party'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'trip-setup', label: 'Trip Setup', icon: MapPin },
            { id: 'flights', label: 'Flights', icon: Plane },
            { id: 'stays', label: 'Stays', icon: Home },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'attendees', label: 'Guest List', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center justify-center gap-2 py-4 px-4 border-b-2 transition whitespace-nowrap ${
                activeTab === id
                  ? 'border-pink-500 text-pink-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Trip Setup Tab */}
          {activeTab === 'trip-setup' && !trip && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Sarah's Bachelorette Party"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country/Region</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedState('');
                      setDestination('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent max-h-40"
                  >
                    {countryList.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Region/City</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setDestination('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent max-h-40"
                  >
                    <option value="">Select...</option>
                    {getStateList.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCountry === 'US' && selectedState && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent max-h-40"
                  >
                    <option value="">Select city...</option>
                    {getCitiesList.map((city: string) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCountry !== 'US' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter city name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Date</label>
                  <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 text-gray-600">$</span>
                    <input
                      type="number"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      placeholder="5000"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={createTrip}
                disabled={submitting}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Trip
                  </>
                )}
              </button>
            </div>
          )}

          {/* Trip Setup Tab - Show Trip */}
          {activeTab === 'trip-setup' && trip && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{trip.eventName}</h3>
                <p className="text-2xl font-bold text-pink-600 mb-2">{trip.location?.city || trip.destination}</p>
                <p className="text-gray-600 mb-2">
                  📅 {new Date(trip.tripDate || trip.startDate || '').toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Budget: <span className="font-semibold text-gray-900">${trip.estimatedBudget?.toLocaleString() || trip.budget?.toLocaleString()}</span>
                </p>
              </div>

              {trip.activities && (trip.activities as string[]).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Suggested Activities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(trip.activities as string[]).map((activity, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                        ✓ {activity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Plane className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Google Flights</p>
                    <p className="text-sm text-gray-600">Search and compare flights for your group</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const city = trip?.location?.city || trip?.destination || 'destination';
                    const url = `https://www.google.com/flights?q=flights+to+${city}`;
                    window.open(url, 'flights', 'width=1200,height=800');
                  }}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  Open Google Flights
                </button>
              </div>
              <p className="text-sm text-gray-600">Pro tip: Use filters to find direct flights and best prices for your group.</p>
            </div>
          )}

          {/* Stays Tab */}
          {activeTab === 'stays' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Airbnb</p>
                    <p className="text-sm text-gray-600">Find group-friendly accommodations</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const city = trip?.location?.city || trip?.destination || 'destination';
                    const url = `https://www.airbnb.com/s/${city}/homes`;
                    window.open(url, 'airbnb', 'width=1200,height=800');
                  }}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Search Airbnb
                </button>
              </div>
              <p className="text-sm text-gray-600">Pro tip: Filter by "Entire place" for group-friendly rentals with common spaces.</p>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              {trip ? (
                <>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-green-600">${trip.estimatedBudget?.toLocaleString() || trip.budget?.toLocaleString() || '0'}</p>
                  </div>
                  <p className="text-center text-gray-600 py-6">Budget tracking coming soon</p>
                </>
              ) : (
                <p className="text-gray-600">Create a trip to see budget tracking</p>
              )}
            </div>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <div className="space-y-4">
              {trip ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trip Attendees</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition">
                      <Plus className="w-4 h-4" />
                      Add Attendee
                    </button>
                  </div>
                  <p className="text-gray-600">Guest list management coming soon</p>
                </>
              ) : (
                <p className="text-gray-600">Create a trip to manage attendees</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
