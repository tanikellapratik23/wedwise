import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MapPin, Users, DollarSign, Plane, Home, Loader, PartyPopper, Calendar, AlertCircle, Edit2, Save, X, Lock, Share2, CheckCircle, TrendingUp, Clock, Star, ExternalLink, Car, Sparkles, Link as LinkIcon, Copy, Check, Download } from 'lucide-react';
import axios from 'axios';
import { locationData } from '../../utils/locationData';
import { getAirportCode, generateSkyscannerUrl, generateAirbnbUrl, generateBookingComUrl, generateVrboUrl } from '../../utils/flightBooking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price: number;
  duration: string;
  image: string;
  bookingUrl: string;
}

interface Stay {
  id: string;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  bookingUrl: string;
}

interface Attendee {
  id: string;
  name: string;
  email?: string;
  paid?: boolean;
  amount?: number;
}

interface BachelorTrip {
  _id?: string;
  eventName: string;
  eventType: 'bachelor' | 'bachelorette';
  tripDate: string;
  location: { city: string; state: string; country: string };
  estimatedBudget: number;
}

export default function BachelorDashboard() {
  const [trip, setTrip] = useState<BachelorTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Trip Setup State
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<'bachelor' | 'bachelorette'>('bachelor');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedState, setSelectedState] = useState('CA');
  const [destination, setDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');

  // Flights & Stays
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  // Guests & Budget
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');

  useEffect(() => {
    fetchTrip();
  }, []);

  // Regenerate flights & stays when location/date changes
  useEffect(() => {
    if (tripDate && destination) {
      console.log('📍 Location/date changed, regenerating flights & stays for:', {
        destination,
        tripDate,
        state: selectedState,
        country: selectedCountry
      });
      const newFlights = generateMockFlights(destination, tripDate, selectedState, selectedCountry);
      const newStays = generateMockStays(destination, tripDate, selectedState, selectedCountry);
      setFlights(newFlights);
      setStays(newStays);
    }
  }, [tripDate, destination, selectedState, selectedCountry]);

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_URL}/api/bachelor-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.data) {
        const tripData = response.data.data;
        setTrip(tripData);
        setAttendees(tripData.attendees || []);
        setSelectedFlight(tripData.selectedFlight || null);
        setSelectedStay(tripData.selectedStay || null);
        
        // Update state variables from trip data
        if (tripData.tripDate) setTripDate(tripData.tripDate);
        if (tripData.location?.city) setDestination(tripData.location.city);
        if (tripData.location?.state) setSelectedState(tripData.location.state);
        if (tripData.location?.country) setSelectedCountry(tripData.location.country);
        if (tripData.eventName) setEventName(tripData.eventName);
        if (tripData.eventType) setEventType(tripData.eventType);
        if (tripData.estimatedBudget) setTotalBudget(tripData.estimatedBudget.toString());
        
        // Generate flights and stays for the trip with actual trip data
        console.log('🎉 Fetched trip, generating flights/stays with:', {
          destination: tripData.location?.city,
          tripDate: tripData.tripDate,
          state: tripData.location?.state,
          country: tripData.location?.country
        });
        const fetchedFlights = generateMockFlights(
          tripData.location?.city || '',
          tripData.tripDate,
          tripData.location?.state || 'CA',
          tripData.location?.country || 'US'
        );
        const fetchedStays = generateMockStays(
          tripData.location?.city || '',
          tripData.tripDate,
          tripData.location?.state || 'CA',
          tripData.location?.country || 'US'
        );
        setFlights(fetchedFlights);
        setStays(fetchedStays);
      }
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch trip:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load trip data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFlights = (dest: string, date: string, state: string, country: string): Flight[] => {
    const airlines = [
      { name: 'United', logo: 'https://images.unsplash.com/photo-1552881173-d3d42e0be9c3?w=400&h=300&fit=crop', code: 'UA' },
      { name: 'Delta', logo: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop', code: 'DL' },
      { name: 'American', logo: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop', code: 'AA' },
      { name: 'Southwest', logo: 'https://images.unsplash.com/photo-1513521399740-d52e2ff8e000?w=400&h=300&fit=crop', code: 'SW' },
    ];
    
    const baseDate = date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const departureDate = baseDate.toISOString().split('T')[0];
    const returnDate = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Use passed destination parameter instead of closure variable
    const targetDestination = dest || state || 'vacation';
    
    try {
      return Array.from({ length: 4 }).map((_, i) => {
        const airline = airlines[i];
        const departureTime = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000);
        const arrivalTime = new Date(baseDate.getTime() + (i * 2 + 5.5) * 60 * 60 * 1000);
        
        // Generate unique booking URL for each destination and date
        const bookingUrl = generateSkyscannerUrl('Los Angeles', targetDestination, departureDate, returnDate, 4);
        console.log(`✈️ Generated flight ${i + 1} to ${targetDestination} on ${departureDate}, URL: ${bookingUrl.substring(0, 80)}...`);
        
        return {
          id: `flight-${i}-${Date.now()}`,
          airline: airline.name,
          departure: departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          arrival: arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: 250 + Math.random() * 300,
          duration: '5h 30m',
          image: airline.logo,
          bookingUrl
        };
      });
    } catch (err) {
      console.error('Error generating flights:', err);
      return Array.from({ length: 4 }).map((_, i) => ({
        id: `flight-${i}-${Date.now()}`,
        airline: ['United', 'Delta', 'American', 'Southwest'][i],
        departure: ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM'][i],
        arrival: ['11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'][i],
        price: 250 + Math.random() * 300,
        duration: '5h 30m',
        image: 'https://images.unsplash.com/photo-1552881173-d3d42e0be9c3?w=400&h=300&fit=crop',
        bookingUrl: generateSkyscannerUrl('Los Angeles', targetDestination, departureDate, returnDate, 4)
      }));
    }
  };

  const generateMockStays = (dest: string, date: string, state: string, country: string): Stay[] => {
    const stayTypes = [
      { name: 'Luxury Hotel', type: 'Hotel', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Modern Airbnb', type: 'Airbnb', image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop', booking: 'airbnb.com' },
      { name: 'Beachfront Resort', type: 'Resort', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Boutique Inn', type: 'Boutique Hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Private Villa', type: 'Villa', image: 'https://images.unsplash.com/photo-1512376991164-a485fb76f51f?w=400&h=300&fit=crop', booking: 'airbnb.com' },
    ];
    
    const checkIn = date ? new Date(date).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = date ? new Date(new Date(date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Use passed destination parameter instead of closure variable
    const targetDestination = dest || state || 'vacation';
    
    return Array.from({ length: 5 }).map((_, i) => {
      const stay = stayTypes[i];
      
      // Generate proper booking URLs with actual destination and dates
      const bookingLink = stay.booking === 'airbnb.com' 
        ? generateAirbnbUrl(targetDestination, checkIn, checkOut, 4)
        : generateBookingComUrl(targetDestination, checkIn, checkOut, 4);
      
      console.log(`🏨 Generated stay ${i + 1} for ${targetDestination} (${checkIn} to ${checkOut}), URL: ${bookingLink.substring(0, 80)}...`);
      
      return {
        id: `stay-${i}-${Date.now()}`,
        name: stay.name,
        type: stay.type,
        price: 150 + Math.random() * 400,
        rating: 4 + Math.random(),
        image: stay.image,
        bookingUrl: bookingLink,
      };
    });
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

      const response = await axios.post(`${API_URL}/api/bachelor-trip/create`, newTrip, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.data.data) {
        setTrip(response.data.data);
        // Generate flights and stays with the actual trip parameters
        const generatedFlights = generateMockFlights(destination, tripDate, selectedState, selectedCountry);
        const generatedStays = generateMockStays(destination, tripDate, selectedState, selectedCountry);
        console.log('✈️ Generated flights:', generatedFlights.length, 'for', destination);
        console.log('🏨 Generated stays:', generatedStays.length, 'for', destination);
        setFlights(generatedFlights);
        setStays(generatedStays);
        setError('');
        alert('🎉 Trip created! Flights and stays loaded.');
      } else {
        setError(response.data.error || 'Failed to create trip');
      }
    } catch (error: any) {
      console.error('Bachelor trip creation error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create trip';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateTrip = async () => {
    setError('');
    if (!tripDate || !totalBudget || !trip?._id) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const updatedTripData = {
        eventName: eventName || trip.eventName,
        tripDate,
        location: { city: destination || trip.location.city, state: selectedState, country: selectedCountry },
        estimatedBudget: parseFloat(totalBudget),
      };

      const response = await axios.put(`${API_URL}/api/bachelor-trip/${trip._id}`, updatedTripData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.data.data) {
        const updatedTrip = response.data.data;
        setTrip(updatedTrip);
        
        // Regenerate flights and stays with updated parameters
        const newFlights = generateMockFlights(
          updatedTrip.location.city,
          updatedTrip.tripDate,
          updatedTrip.location.state,
          updatedTrip.location.country
        );
        const newStays = generateMockStays(
          updatedTrip.location.city,
          updatedTrip.tripDate,
          updatedTrip.location.state,
          updatedTrip.location.country
        );
        setFlights(newFlights);
        setStays(newStays);
        
        setEditMode(false);
        setError('');
        alert('✅ Trip updated! Flights and stays refreshed for new destination/dates.');
      } else {
        setError(response.data.error || 'Failed to update trip');
      }
    } catch (error: any) {
      console.error('Trip update error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update trip';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const addAttendee = () => {
    if (!newAttendeeName) return;
    const attendee: Attendee = {
      id: Date.now().toString(),
      name: newAttendeeName,
      email: newAttendeeEmail || undefined,
      paid: false,
      amount: trip?.estimatedBudget ? trip.estimatedBudget / (attendees.length + 2) : 0,
    };
    setAttendees([...attendees, attendee]);
    setNewAttendeeName('');
    setNewAttendeeEmail('');
  };

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const countryList = useMemo(() => {
    return Object.entries(locationData).map(([key, val]) => ({
      code: key,
      label: (val as any).label,
    }));
  }, []);

  const stateList = useMemo(() => {
    const country = locationData[selectedCountry as keyof typeof locationData];
    if (!country) return [];
    if ('states' in country) {
      return Object.entries((country as any).states).map(([key]) => ({
        code: key,
        label: key,
      }));
    }
    return [];
  }, [selectedCountry]);

  const cityList = useMemo(() => {
    const country = locationData[selectedCountry as keyof typeof locationData];
    if (!country || !('states' in country)) return [];
    const state = (country as any).states[selectedState];
    if (!state || !state.cities) return [];
    return state.cities.map((city: string) => ({
      code: city,
      label: city,
    }));
  }, [selectedCountry, selectedState]);

  const totalSpent = useMemo(() => {
    let total = 0;
    if (selectedFlight) total += selectedFlight.price;
    if (selectedStay) total += selectedStay.price;
    return total;
  }, [selectedFlight, selectedStay]);

  const perPersonCost = useMemo(() => {
    const headcount = attendees.length + 1;
    return (totalBudget ? parseFloat(totalBudget) : 0) / headcount;
  }, [totalBudget, attendees.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <PartyPopper className="w-8 h-8" />
          <h1 className="text-4xl font-bold">
            {trip ? `${trip.eventName} 🎉` : 'Plan Your Bachelor/Bachelorette Trip'}
          </h1>
        </div>
        <p className="text-white/90 max-w-2xl">
          Create an unforgettable celebration! Set up your trip, invite guests, book flights and accommodations, and manage your budget all in one place.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!trip ? (
        // Trip Setup Section
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Your Trip</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Vegas Bachelor Party"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="bachelor"
                    checked={eventType === 'bachelor'}
                    onChange={(e) => setEventType(e.target.value as 'bachelor')}
                  />
                  <span>Bachelor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="bachelorette"
                    checked={eventType === 'bachelorette'}
                    onChange={(e) => setEventType(e.target.value as 'bachelorette')}
                  />
                  <span>Bachelorette</span>
                </label>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {countryList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            {stateList.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {stateList.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* City - with text input for better flexibility */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destination City *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Las Vegas, Smokey Mountains, Miami, Cancun..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Type any destination - airports will be auto-detected</p>
            </div>

            {/* Trip Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Date *</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget *</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="$5,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={createTrip}
            disabled={submitting}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Creating Trip...' : '🎉 Create Trip & Load Flights/Stays'}
          </button>
        </div>
      ) : (
        // Seamless Dashboard
        <>
          {/* Trip Overview Cards */}
          {!editMode ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Trip Overview</h2>
                <button
                  onClick={() => {
                    setEventName(trip.eventName);
                    setTripDate(trip.tripDate);
                    setSelectedState(trip.location.state);
                    setSelectedCountry(trip.location.country);
                    setDestination(trip.location.city);
                    setTotalBudget(trip.estimatedBudget.toString());
                    setEditMode(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Trip
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Trip Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Trip</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{trip.eventName}</p>
                  <p className="text-sm text-blue-700 mt-2">
                    {new Date(trip.tripDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Location */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{trip.location.city}</p>
                  <p className="text-sm text-green-700 mt-2">{trip.location.state}, {trip.location.country}</p>
                </div>

                {/* Budget */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Budget</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">${trip.estimatedBudget.toLocaleString()}</p>
                  <p className="text-sm text-purple-700 mt-2">Per person: ${perPersonCost.toFixed(2)}</p>
                </div>

                {/* Attendees */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold text-gray-900">Guests</h3>
                  </div>
                  <p className="text-2xl font-bold text-pink-900">{attendees.length + 1}</p>
                  <p className="text-sm text-pink-700 mt-2">Including you</p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Trip Details</h2>
                <button
                  onClick={() => setEditMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Trip Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Date</label>
                  <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {countryList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                {stateList.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {stateList.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* City / Destination - text input for flexibility */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Destination City</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Las Vegas, Miami, Cancun..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Flights & stays will update based on your destination</p>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget</label>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateTrip}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Flights Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Plane className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Flights</h2>
              {selectedFlight && <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Selected</span>}
            </div>

            {flights.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">Create a trip first to see available flights</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className={`rounded-lg border-2 overflow-hidden cursor-pointer transition ${
                      selectedFlight?.id === flight.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Flight Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={flight.image} 
                        alt={flight.airline}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                        ${flight.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Flight Info */}
                    <div className="p-4" onClick={() => setSelectedFlight(flight)}>
                      <div className="font-semibold text-gray-900 mb-2">{flight.airline}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">{flight.departure}</span>
                        <span>→</span>
                        <span className="font-medium">{flight.arrival}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{flight.duration}</p>
                      
                      {/* Booking Link */}
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded transition"
                      >
                        Book Flight →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stays Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Accommodations</h2>
              {selectedStay && <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Selected</span>}
            </div>

            {stays.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">Create a trip first to see available stays</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stays.map((stay) => (
                  <div
                    key={stay.id}
                    className={`rounded-lg border-2 overflow-hidden cursor-pointer transition ${
                      selectedStay?.id === stay.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Stay Image */}
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      <img 
                        src={stay.image} 
                        alt={stay.name}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                        ${stay.price.toFixed(2)}/night
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-bold text-white bg-yellow-500/80 px-2 py-1 rounded">
                        <span>★</span>
                        <span>{stay.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Stay Info */}
                    <div className="p-4" onClick={() => setSelectedStay(stay)}>
                      <div className="font-semibold text-gray-900 mb-1">{stay.name}</div>
                      <p className="text-xs text-gray-600 mb-3">{stay.type}</p>
                      
                      {/* Booking Link */}
                      <a
                        href={stay.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded transition"
                      >
                        Book Now →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guest List Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">Guest List & Budget Split</h2>
            </div>

            <div className="space-y-4">
              {/* Add Guest */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newAttendeeName}
                    onChange={(e) => setNewAttendeeName(e.target.value)}
                    placeholder="Guest name"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="email"
                    value={newAttendeeEmail}
                    onChange={(e) => setNewAttendeeEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={addAttendee}
                    className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Guest
                  </button>
                </div>
              </div>

              {/* Guest List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <div>
                    <p className="font-semibold text-gray-900">You (Organizer)</p>
                    <p className="text-sm text-gray-600">${perPersonCost.toFixed(2)} per person</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Organizer</span>
                </div>

                {attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{attendee.name}</p>
                      <p className="text-sm text-gray-600">
                        ${attendee.amount?.toFixed(2) || perPersonCost.toFixed(2)} {attendee.paid ? '✓ Paid' : 'Unpaid'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAttendee(attendee.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Summary */}
            {selectedFlight || selectedStay ? (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Budget Summary</h3>
                <div className="space-y-2 text-sm">
                  {selectedFlight && <div className="flex justify-between"><span>Flight:</span><span className="font-semibold">${selectedFlight.price.toFixed(2)}</span></div>}
                  {selectedStay && <div className="flex justify-between"><span>Stay:</span><span className="font-semibold">${selectedStay.price.toFixed(2)}</span></div>}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Estimated:</span>
                    <span className="text-blue-600">${totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Per Person (split {attendees.length + 1} ways):</span>
                    <span>${(totalSpent / (attendees.length + 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
