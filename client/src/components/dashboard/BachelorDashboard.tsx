import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, MapPin, Users, DollarSign, Plane, Home, Loader, PartyPopper, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { locationData } from '../../utils/locationData';

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
        
        // Update state variables from trip data so generateMockFlights/Stays uses correct location/date
        if (tripData.tripDate) setTripDate(tripData.tripDate);
        if (tripData.location?.state) setSelectedState(tripData.location.state);
        if (tripData.location?.country) setSelectedCountry(tripData.location.country);
        
        // Generate flights and stays for the trip
        console.log('🎉 Fetched trip, generating flights/stays with:', {
          tripDate: tripData.tripDate,
          state: tripData.location?.state,
          country: tripData.location?.country
        });
        setFlights(generateMockFlights());
        setStays(generateMockStays());
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

  const generateMockFlights = (): Flight[] => {
    const airlines = [
      { name: 'United', logo: 'https://images.unsplash.com/photo-1552881173-d3d42e0be9c3?w=400&h=300&fit=crop', code: 'UA' },
      { name: 'Delta', logo: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop', code: 'DL' },
      { name: 'American', logo: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop', code: 'AA' },
      { name: 'Southwest', logo: 'https://images.unsplash.com/photo-1513521399740-d52e2ff8e000?w=400&h=300&fit=crop', code: 'SW' },
    ];
    
    try {
      const baseDate = tripDate ? new Date(tripDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
      
      return Array.from({ length: 4 }).map((_, i) => {
        const airline = airlines[i];
        const departureTime = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000);
        const arrivalTime = new Date(baseDate.getTime() + (i * 2 + 3) * 60 * 60 * 1000);
        
        return {
          id: `flight-${i}`,
          airline: airline.name,
          departure: departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          arrival: arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: 250 + Math.random() * 300,
          duration: '5h 30m',
          image: airline.logo,
          bookingUrl: `https://www.google.com/flights/search?tfs=CBwQAxoL${departureTime.toISOString().split('T')[0]}rAGgAQE&q=${selectedState || 'CA'}%20to%20${selectedCountry || 'US'}`
        };
      });
    } catch (err) {
      console.error('Error generating flights:', err);
      // Fallback flights
      return Array.from({ length: 4 }).map((_, i) => ({
        id: `flight-${i}`,
        airline: ['United', 'Delta', 'American', 'Southwest'][i],
        departure: '08:00 AM',
        arrival: '11:00 AM',
        price: 250 + Math.random() * 300,
        duration: '5h 30m',
        image: 'https://images.unsplash.com/photo-1552881173-d3d42e0be9c3?w=400&h=300&fit=crop',
        bookingUrl: `https://www.google.com/flights/search?q=${selectedState || 'CA'}%20to%20${selectedCountry || 'US'}`
      }));
    }
  };

  const generateMockStays = (): Stay[] => {
    const stayTypes = [
      { name: 'Luxury Hotel', type: 'Hotel', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Modern Airbnb', type: 'Airbnb', image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop', booking: 'airbnb.com' },
      { name: 'Beachfront Resort', type: 'Resort', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Boutique Inn', type: 'Boutique Hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', booking: 'booking.com' },
      { name: 'Private Villa', type: 'Villa', image: 'https://images.unsplash.com/photo-1512376991164-a485fb76f51f?w=400&h=300&fit=crop', booking: 'airbnb.com' },
    ];
    return Array.from({ length: 5 }).map((_, i) => {
      const stay = stayTypes[i];
      const bookingLink = stay.booking === 'airbnb.com' 
        ? `https://www.airbnb.com/s/${selectedState || 'CA'}/homes`
        : `https://www.booking.com/searchresults.html?ss=${selectedState || 'CA'}`;
      
      return {
        id: `stay-${i}`,
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
        const generatedFlights = generateMockFlights();
        const generatedStays = generateMockStays();
        console.log('✈️ Generated flights:', generatedFlights.length);
        console.log('🏨 Generated stays:', generatedStays.length);
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

            {/* City */}
            {cityList.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a city</option>
                  {cityList.map((c: any) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                        Book on Google Flights →
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
