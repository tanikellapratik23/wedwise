import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, MapPin, Users, DollarSign, Plane, Home, Loader, PartyPopper, 
  Calendar, AlertCircle, Edit2, Save, X, Lock, Share2, CheckCircle, TrendingUp, 
  Clock, Star, ExternalLink, Car, Sparkles, Link as LinkIcon, Copy, Check, 
  Download, Hotel, Utensils, Activity, AlertTriangle, Info, ChevronRight, ChevronDown
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type PartyType = 'bachelor' | 'bachelorette' | 'joint';
type Phase = 'planning' | 'locked';
type BudgetRisk = 'green' | 'yellow' | 'red';

interface DateRange {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  estimatedFlightCost: number;
  lodgingAvailability: 'high' | 'medium' | 'low';
  totalCost: number;
  recommended?: boolean;
}

interface Destination {
  id: string;
  city: string;
  state?: string;
  country: string;
  avgFlight: number;
  avgLodging: number;
  avgActivityCost: number;
  costPerPerson: number;
  rank: number;
  whyWins: string;
}

interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price: number;
  duration: string;
  type: 'cheapest' | 'best-time';
  bookingUrl: string;
}

interface Lodging {
  id: string;
  name: string;
  type: 'airbnb' | 'hotel';
  pricePerPerson: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  location: string;
  partyTolerance: 'low' | 'medium' | 'high';
  bookingUrl: string;
  image: string;
}

interface TransportOption {
  id: string;
  type: 'rental' | 'rideshare' | 'shuttle';
  name: string;
  capacity: number;
  estimatedCost: number;
  bookingUrl?: string;
}

interface Activity {
  id: string;
  name: string;
  day: number;
  timeBlock: string;
  cost: number;
  description: string;
  vibeMatch: number;
  bookingUrl?: string;
}

interface BudgetBreakdown {
  flights: number;
  lodging: number;
  transport: number;
  activities: number;
  buffer: number;
  total: number;
  perPerson: number;
}

export default function BachelorDashboard() {
  const [phase, setPhase] = useState<Phase>('planning');
  const [loading, setLoading] = useState(true);
  
  // Phase 1: Master Planning State
  const [partyType, setPartyType] = useState<PartyType>('bachelor');
  const [honoreeName, setHonoreeName] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [targetDayOfMonth, setTargetDayOfMonth] = useState('15');
  const [groupSize, setGroupSize] = useState(8);
  const [budgetTarget, setBudgetTarget] = useState(2000);
  const [budgetType, setBudgetType] = useState<'per-person' | 'total'>('per-person');
  const [flyingFrom, setFlyingFrom] = useState('');
  const [flyingFromAirport, setFlyingFromAirport] = useState('');
  
  // Date Optimizer
  const [candidateDates, setCandidateDates] = useState<DateRange[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [tripNights, setTripNights] = useState(3);
  
  // Destination
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [transportType, setTransportType] = useState<'flight' | 'drive' | null>(null);
  const [showTransportModal, setShowTransportModal] = useState(false);
  
  // Flights & Lodging
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [selectedLodging, setSelectedLodging] = useState<Lodging | null>(null);
  
  // Drive directions
  const [driveTime, setDriveTime] = useState<string>('');
  const [driveDirectionsUrl, setDriveDirectionsUrl] = useState<string>('');
  
  // Transportation
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  
  // Activities & Itinerary
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  
  // Budget
  const [budget, setBudget] = useState<BudgetBreakdown>({
    flights: 0,
    lodging: 0,
    transport: 0,
    activities: 0,
    buffer: 0,
    total: 0,
    perPerson: 0
  });
  
  // Public Link
  const [publicLink, setPublicLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showPublicLinkModal, setShowPublicLinkModal] = useState(false);
  
  // UI State
  const [activeSection, setActiveSection] = useState<string>('master');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['master']));

  useEffect(() => {
    fetchTripData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
        }
      );
    }
  };

  // Calculate budget whenever selections change
  useEffect(() => {
    calculateBudget();
  }, [selectedFlight, selectedLodging, selectedTransport, selectedActivities, groupSize]);

  const fetchTripData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Load cached data first
      const cached = localStorage.getItem('bachelorTrip');
      if (cached) {
        const data = JSON.parse(cached);
        loadTripState(data);
      }
      
      // Then fetch from server
      const response = await axios.get(`${API_URL}/api/bachelor-trip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        loadTripState(response.data);
        localStorage.setItem('bachelorTrip', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripState = (data: any) => {
    if (data.phase) setPhase(data.phase);
    if (data.partyType) setPartyType(data.partyType);
    if (data.honoreeName) setHonoreeName(data.honoreeName);
    if (data.targetMonth) setTargetMonth(data.targetMonth);
    if (data.groupSize) setGroupSize(data.groupSize);
    if (data.budgetTarget) setBudgetTarget(data.budgetTarget);
    if (data.selectedDestination) setSelectedDestination(data.selectedDestination);
    if (data.selectedFlight) setSelectedFlight(data.selectedFlight);
    if (data.selectedLodging) setSelectedLodging(data.selectedLodging);
    if (data.selectedTransport) setSelectedTransport(data.selectedTransport);
    if (data.selectedActivities) setSelectedActivities(data.selectedActivities);
    if (data.publicLink) setPublicLink(data.publicLink);
  };

  const saveTripData = async () => {
    try {
      const token = localStorage.getItem('token');
      const tripData = {
        phase,
        partyType,
        honoreeName,
        targetMonth,
        groupSize,
        budgetTarget,
        budgetType,
        selectedDateRange,
        selectedDestination,
        selectedFlight,
        selectedLodging,
        selectedTransport,
        selectedActivities,
        budget,
        publicLink
      };
      
      localStorage.setItem('bachelorTrip', JSON.stringify(tripData));
      
      await axios.post(`${API_URL}/api/bachelor-trip`, tripData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const calculateBudget = () => {
    const flightCost = selectedFlight ? parseFloat((selectedFlight.price * groupSize).toFixed(2)) : 0;
    const lodgingCost = selectedLodging ? parseFloat((selectedLodging.pricePerPerson * groupSize * tripNights).toFixed(2)) : 0;
    const transportCost = selectedTransport ? parseFloat(selectedTransport.estimatedCost.toFixed(2)) : 0;
    const activitiesCost = parseFloat(activities
      .filter(a => selectedActivities.includes(a.id))
      .reduce((sum, a) => sum + (a.cost * groupSize), 0).toFixed(2));
    const buffer = parseFloat(((flightCost + lodgingCost + transportCost + activitiesCost) * 0.15).toFixed(2));
    const total = parseFloat((flightCost + lodgingCost + transportCost + activitiesCost + buffer).toFixed(2));
    const perPerson = parseFloat((total / groupSize).toFixed(2));

    setBudget({
      flights: flightCost,
      lodging: lodgingCost,
      transport: transportCost,
      activities: activitiesCost,
      buffer,
      total,
      perPerson
    });
  };

  const getBudgetRisk = (): BudgetRisk => {
    const targetTotal = budgetType === 'per-person' ? budgetTarget * groupSize : budgetTarget;
    const percentOver = ((budget.total - targetTotal) / targetTotal) * 100;
    
    if (percentOver <= 5) return 'green';
    if (percentOver <= 15) return 'yellow';
    return 'red';
  };

  const lockPlan = async () => {
    if (!selectedDestination || !selectedFlight || !selectedLodging) {
      alert('Please complete all required selections before locking the plan.');
      return;
    }
    
    setPhase('locked');
    await generatePublicLink();
    await saveTripData();
  };

  const generatePublicLink = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/bachelor-trip/generate-link`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.link) {
        const fullLink = `${window.location.origin}/bachelor/public/${response.data.token}`;
        setPublicLink(fullLink);
        setShowPublicLinkModal(true);
      }
    } catch (error) {
      console.error('Error generating public link:', error);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const searchDestination = async () => {
    if (!destinationSearch.trim()) {
      alert('Please enter a destination to search');
      return;
    }

    // Show transport type modal
    setShowTransportModal(true);
  };

  const generateTripWithTransport = (type: 'flight' | 'drive') => {
    setTransportType(type);
    setShowTransportModal(false);

    // For flights, require flying from location
    if (type === 'flight' && !flyingFrom.trim()) {
      alert('Please enter where you\'re flying from first');
      return;
    }

    // Create destination from search
    const newDestination: Destination = {
      id: Date.now().toString(),
      city: destinationSearch,
      state: '',
      country: 'USA',
      avgFlight: type === 'flight' ? 300.00 : 0,
      avgLodging: 150.00,
      avgActivityCost: 200.00,
      costPerPerson: 0,
      rank: 1,
      whyWins: 'Selected destination with great party options'
    };
    newDestination.costPerPerson = newDestination.avgFlight + (newDestination.avgLodging * tripNights) + (newDestination.avgActivityCost * tripNights);
    
    setDestinations([newDestination]);
    setSelectedDestination(newDestination);
    
    // Auto-generate transport and lodging after destination is selected
    setTimeout(() => {
      if (type === 'flight') {
        generateFlightsWithAPI(newDestination.city);
      } else {
        generateDriveDirections(newDestination.city);
      }
      generateAirbnbWithAPI(newDestination.city);
      
      // Auto-expand those sections
      setExpandedSections(new Set(['master', 'destination', 'flights', 'lodging']));
    }, 500);
  };

  const generateFlightsWithAPI = (destination: string) => {
    // Use flying from location or fallback
    const originAirport = flyingFromAirport || flyingFrom.substring(0, 3).toUpperCase() || 'JFK';

    // Generate dates based on target month and day
    let departureDate: Date;
    if (targetMonth && targetDayOfMonth) {
      // targetMonth is now just MM format (e.g., "01" for January)
      const currentYear = new Date().getFullYear();
      const month = parseInt(targetMonth);
      const day = parseInt(targetDayOfMonth);
      departureDate = new Date(currentYear, month - 1, day);
      
      // If date is in the past, use next year
      if (departureDate < new Date()) {
        departureDate = new Date(currentYear + 1, month - 1, day);
      }
    } else {
      // Default to 2 weeks from now
      departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 14);
    }
    
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + tripNights);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    // Map destinations to airports and realistic flight info
    const destinationAirports: {[key: string]: {code: string, name: string, airlines: string[], duration: string}} = {
      'las vegas': {code: 'LAS', name: 'Harry Reid Intl', airlines: ['Southwest', 'Delta', 'American'], duration: '5h 15m'},
      'miami': {code: 'MIA', name: 'Miami Intl', airlines: ['American', 'United', 'JetBlue'], duration: '5h 30m'},
      'nashville': {code: 'BNA', name: 'Nashville Intl', airlines: ['Southwest', 'Delta', 'United'], duration: '3h 45m'},
      'austin': {code: 'AUS', name: 'Austin-Bergstrom', airlines: ['Southwest', 'American', 'United'], duration: '4h 20m'},
      'new orleans': {code: 'MSY', name: 'Louis Armstrong', airlines: ['Southwest', 'United', 'Delta'], duration: '4h 10m'},
      'scottsdale': {code: 'PHX', name: 'Phoenix Sky Harbor', airlines: ['Southwest', 'American', 'Delta'], duration: '4h 45m'},
      'san diego': {code: 'SAN', name: 'San Diego Intl', airlines: ['Southwest', 'Alaska', 'United'], duration: '5h 40m'},
      'denver': {code: 'DEN', name: 'Denver Intl', airlines: ['United', 'Southwest', 'Frontier'], duration: '4h 00m'},
      'chicago': {code: 'ORD', name: "O'Hare Intl", airlines: ['United', 'American', 'Southwest'], duration: '3h 30m'}
    };

    const destLower = destination.toLowerCase();
    const destInfo = destinationAirports[destLower] || {
      code: destination.substring(0, 3).toUpperCase(),
      name: destination,
      airlines: ['Major Airlines'],
      duration: '4-6 hours'
    };

    // Create proper Google Flights URL with origin, destination, and dates
    const departureDateStr = formatDate(departureDate);
    const returnDateStr = formatDate(returnDate);
    const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(destination)}%20from%20${originAirport}%20on%20${departureDateStr}%20returning%20${returnDateStr}&curr=USD&hl=en`;

    const mockFlights: Flight[] = [
      {
        id: '1',
        airline: `${destInfo.airlines[0]} • ${destInfo.airlines[1]}`,
        departure: `${originAirport} → ${destInfo.code}`,
        arrival: destInfo.name,
        price: 289.00,
        duration: destInfo.duration,
        type: 'cheapest',
        bookingUrl: googleFlightsUrl
      },
      {
        id: '2',
        airline: `${destInfo.airlines[0]} • Premium`,
        departure: `${originAirport} → ${destInfo.code}`,
        arrival: destInfo.name,
        price: 385.00,
        duration: destInfo.duration,
        type: 'best-time',
        bookingUrl: googleFlightsUrl
      }
    ];
    setFlights(mockFlights);
  };

  const generateDriveDirections = (destination: string) => {
    if (!userLocation) return;

    // Generate Google Maps directions URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    
    setDriveDirectionsUrl(googleMapsUrl);

    // Estimate drive time (this is rough - actual would come from Distance Matrix API)
    // Using rough estimates based on common bachelor party destinations
    const driveTimeEstimates: {[key: string]: string} = {
      'las vegas': '4-5 hours',
      'miami': '20-24 hours',
      'nashville': '12-16 hours',
      'austin': '14-18 hours',
      'new orleans': '16-20 hours',
      'scottsdale': '5-6 hours',
      'san diego': '2-3 hours',
      'denver': '10-14 hours',
      'chicago': '12-16 hours'
    };
    
    const destLower = destination.toLowerCase();
    const estimatedDuration = driveTimeEstimates[destLower] || 'Check Google Maps';
    
    setDriveTime(estimatedDuration);
  };

  const generateAirbnbWithAPI = (destination: string) => {
    // Calculate dates based on target month and day
    let checkInDate: Date;
    if (targetMonth && targetDayOfMonth) {
      // targetMonth is now just MM format (e.g., "01" for January)
      const currentYear = new Date().getFullYear();
      const month = parseInt(targetMonth);
      const day = parseInt(targetDayOfMonth);
      checkInDate = new Date(currentYear, month - 1, day);
      
      // If date is in the past, use next year
      if (checkInDate < new Date()) {
        checkInDate = new Date(currentYear + 1, month - 1, day);
      }
    } else {
      // Default to 2 weeks from now
      checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 14);
    }
    
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + tripNights);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Generate Airbnb URL with actual query parameters
    const airbnbBaseUrl = `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes`;
    const params = new URLSearchParams({
      'adults': groupSize.toString(),
      'checkin': formatDate(checkInDate),
      'checkout': formatDate(checkOutDate),
      'price_max': Math.floor((budgetType === 'per-person' ? budgetTarget : budgetTarget / groupSize) * tripNights).toString(),
      'room_types[]': 'Entire home/apt',
      'search_type': 'user_map_move'
    });
    const airbnbSearchUrl = `${airbnbBaseUrl}?${params.toString()}`;

    // Destination-specific images
    const destImages: {[key: string]: string[]} = {
      'miami': ['https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'],
      'las vegas': ['https://images.unsplash.com/photo-1522364723953-452492584e26?w=400', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', 'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=400', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
      'nashville': ['https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400', 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400'],
      'default': ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400']
    };
    
    const destKey = destination.toLowerCase();
    const images = destImages[destKey] || destImages['default'];

    const mockLodging: Lodging[] = [
      {
        id: '1',
        name: `${destination} Party House`,
        type: 'airbnb',
        pricePerPerson: 150.00,
        bedrooms: Math.ceil(groupSize / 2),
        bathrooms: Math.ceil(groupSize / 3),
        rating: 4.85,
        location: `${destination} Center`,
        partyTolerance: 'high',
        bookingUrl: airbnbSearchUrl,
        image: images[0]
      },
      {
        id: '2',
        name: `Luxury ${destination} Villa`,
        type: 'airbnb',
        pricePerPerson: 225.00,
        bedrooms: Math.ceil(groupSize / 2) + 1,
        bathrooms: Math.ceil(groupSize / 3) + 1,
        rating: 4.92,
        location: `${destination} Downtown`,
        partyTolerance: 'high',
        bookingUrl: airbnbSearchUrl,
        image: images[1]
      },
      {
        id: '3',
        name: `Modern ${destination} Penthouse`,
        type: 'airbnb',
        pricePerPerson: 175.00,
        bedrooms: Math.ceil(groupSize / 2),
        bathrooms: Math.ceil(groupSize / 4) + 1,
        rating: 4.78,
        location: `${destination} Entertainment District`,
        partyTolerance: 'medium',
        bookingUrl: airbnbSearchUrl,
        image: images[2]
      },
      {
        id: '4',
        name: `${destination} Pool House`,
        type: 'airbnb',
        pricePerPerson: 180.00,
        bedrooms: Math.ceil(groupSize / 2),
        bathrooms: Math.ceil(groupSize / 3),
        rating: 4.88,
        location: `${destination} Near Attractions`,
        partyTolerance: 'high',
        bookingUrl: airbnbSearchUrl,
        image: images[3]
      }
    ];
    setLodgings(mockLodging);
  };

  const generateMockDestinations = () => {
    const mockDestinations: Destination[] = [
      {
        id: '1',
        city: 'Las Vegas',
        state: 'NV',
        country: 'USA',
        avgFlight: 250,
        avgLodging: 150,
        avgActivityCost: 200,
        costPerPerson: 600,
        rank: 1,
        whyWins: 'Lowest total cost with maximum entertainment options and easy logistics'
      },
      {
        id: '2',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        avgFlight: 280,
        avgLodging: 180,
        avgActivityCost: 220,
        costPerPerson: 680,
        rank: 2,
        whyWins: 'Beach + nightlife combo, great weather year-round'
      },
      {
        id: '3',
        city: 'Nashville',
        state: 'TN',
        country: 'USA',
        avgFlight: 220,
        avgLodging: 140,
        avgActivityCost: 180,
        costPerPerson: 540,
        rank: 3,
        whyWins: 'Most affordable with unique music scene and bar culture'
      }
    ];
    setDestinations(mockDestinations);
  };

  const generateMockFlights = (destination: string) => {
    const mockFlights: Flight[] = [
      {
        id: '1',
        airline: 'Southwest',
        departure: '8:00 AM',
        arrival: '11:30 AM',
        price: 240,
        duration: '3h 30m',
        type: 'cheapest',
        bookingUrl: 'https://kayak.com'
      },
      {
        id: '2',
        airline: 'Delta',
        departure: '10:00 AM',
        arrival: '1:45 PM',
        price: 310,
        duration: '3h 45m',
        type: 'best-time',
        bookingUrl: 'https://google.com/flights'
      }
    ];
    setFlights(mockFlights);
  };

  const generateMockLodging = () => {
    const mockLodging: Lodging[] = [
      {
        id: '1',
        name: 'Modern Downtown Penthouse',
        type: 'airbnb',
        pricePerPerson: 120,
        bedrooms: 4,
        bathrooms: 3,
        rating: 4.9,
        location: 'Downtown',
        partyTolerance: 'high',
        bookingUrl: 'https://airbnb.com',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
      },
      {
        id: '2',
        name: 'Luxury Pool Villa',
        type: 'airbnb',
        pricePerPerson: 180,
        bedrooms: 5,
        bathrooms: 4,
        rating: 5.0,
        location: 'Suburbs',
        partyTolerance: 'high',
        bookingUrl: 'https://airbnb.com',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
      }
    ];
    setLodgings(mockLodging);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const budgetRisk = getBudgetRisk();
  const isPlanning = phase === 'planning';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">
                  Bachelor/Bachelorette Party Planner
                </h1>
                <p className="text-gray-100 mt-1 drop-shadow-md">
                  {isPlanning ? 'Plan your perfect trip' : '🔒 Plan locked - Share with your crew'}
                </p>
              </div>
            </div>
            
            {isPlanning && (
              <button
                onClick={lockPlan}
                disabled={!selectedDestination || !selectedFlight || !selectedLodging}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                Lock Plan & Share
              </button>
            )}
            
            {!isPlanning && publicLink && (
              <button
                onClick={() => setShowPublicLinkModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition"
              >
                <Share2 className="w-5 h-5" />
                View Public Link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section 1: Master Planning Dashboard */}
        <CollapsibleSection
          title="1. Master Planning Dashboard"
          icon={<Sparkles className="w-6 h-6" />}
          isExpanded={expandedSections.has('master')}
          onToggle={() => toggleSection('master')}
          locked={!isPlanning}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Party Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Party Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['bachelor', 'bachelorette', 'joint'] as PartyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => isPlanning && setPartyType(type)}
                    disabled={!isPlanning}
                    className={`px-4 py-3 rounded-xl font-medium transition capitalize ${
                      partyType === type
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Honoree Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Honoree Name</label>
              <input
                type="text"
                value={honoreeName}
                onChange={(e) => setHonoreeName(e.target.value)}
                disabled={!isPlanning}
                placeholder="Who's getting married?"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Target Month */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Target Month</label>
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                disabled={!isPlanning}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select month...</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Day of Month */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Day of Month</label>
              <select
                value={targetDayOfMonth}
                onChange={(e) => setTargetDayOfMonth(e.target.value)}
                disabled={!isPlanning}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select day...</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Group Size</label>
              <input
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 0)}
                disabled={!isPlanning}
                min="2"
                placeholder="Number of people"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Budget Target */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Budget Target</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={budgetTarget}
                  onChange={(e) => setBudgetTarget(parseInt(e.target.value) || 0)}
                  disabled={!isPlanning}
                  placeholder="Amount"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <select
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value as 'per-person' | 'total')}
                  disabled={!isPlanning}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="per-person">Per Person</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>

            {/* Trip Length (Nights) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Trip Length (Nights)</label>
              <select
                value={tripNights}
                onChange={(e) => setTripNights(parseInt(e.target.value) || 2)}
                disabled={!isPlanning}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(nights => (
                  <option key={nights} value={nights}>{nights} {nights === 1 ? 'night' : 'nights'}</option>
                ))}
              </select>
            </div>

            {/* Flying From Location (for flights) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Flying From (City/Airport)</label>
              <input
                type="text"
                value={flyingFrom}
                onChange={(e) => setFlyingFrom(e.target.value)}
                disabled={!isPlanning}
                placeholder="e.g., Charlotte, CLT"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Required for flight searches</p>
            </div>
          </div>

          {/* Live Calculations */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">Total Estimated Cost</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">
                ${budget.total.toFixed(2)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Cost Per Person</span>
              </div>
              <div className="text-3xl font-bold text-purple-900">
                ${budget.perPerson.toFixed(2)}
              </div>
            </div>

            <div className={`rounded-xl p-6 border-2 ${
              budgetRisk === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
              budgetRisk === 'yellow' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
              'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            }`}>
              <div className={`flex items-center gap-2 mb-2 ${
                budgetRisk === 'green' ? 'text-green-700' :
                budgetRisk === 'yellow' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Budget Status</span>
              </div>
              <div className={`text-2xl font-bold ${
                budgetRisk === 'green' ? 'text-green-900' :
                budgetRisk === 'yellow' ? 'text-yellow-900' :
                'text-red-900'
              }`}>
                {budgetRisk === 'green' ? '✓ On Track' :
                 budgetRisk === 'yellow' ? '⚠ Slightly Over' :
                 '⚠ Over Budget'}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Destination Search - Only show if master planning is complete */}
        {honoreeName && targetMonth && groupSize > 0 && budgetTarget > 0 && tripNights > 0 && isPlanning && (
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Search Your Destination</h2>
            </div>
            <p className="text-white/90 mb-6">
              Enter a city or location to find flights from your area and nearby accommodations
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                placeholder="e.g., Las Vegas, Miami, Nashville..."
                className="flex-1 px-6 py-4 rounded-xl text-gray-900 text-lg font-medium focus:ring-4 focus:ring-white/30 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && searchDestination()}
              />
              <button
                onClick={searchDestination}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Search & Generate Trip
              </button>
            </div>
            {userLocation && (
              <p className="text-sm text-white/80 mt-3">
                📍 Flights will be searched from your current location
              </p>
            )}
          </div>
        )}

        {/* Section 2: Destination Cost Comparison */}
        <CollapsibleSection
          title="2. Destination Cost Comparison"
          icon={<MapPin className="w-6 h-6" />}
          isExpanded={expandedSections.has('destination')}
          onToggle={() => toggleSection('destination')}
          locked={!isPlanning}
        >
          {destinations.length === 0 && isPlanning && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No destination selected yet</p>
              <p className="text-gray-500 text-sm">Complete the form above and search for a destination</p>
            </div>
          )}

          {destinations.length > 0 && (
            <div className="space-y-4">
              {destinations.map((dest) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition ${
                    selectedDestination?.id === dest.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => isPlanning && setSelectedDestination(dest)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-blue-600">#{dest.rank}</span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {dest.city}, {dest.state || dest.country}
                        </h3>
                        {selectedDestination?.id === dest.id && (
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Avg Flight</div>
                          <div className="font-semibold text-gray-900">${dest.avgFlight}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Avg Lodging/Night</div>
                          <div className="font-semibold text-gray-900">${dest.avgLodging}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Activities/Day</div>
                          <div className="font-semibold text-gray-900">${dest.avgActivityCost}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Total Per Person</div>
                          <div className="text-lg font-bold text-blue-600">${dest.costPerPerson}</div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-green-900 text-sm">Why this city wins:</div>
                            <div className="text-sm text-green-800">{dest.whyWins}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* Section 3: Flights/Drive Planner */}
        {selectedDestination && (
          <CollapsibleSection
            title={transportType === 'drive' ? '3. Drive Directions' : '3. Flight Options'}
            icon={transportType === 'drive' ? <Car className="w-6 h-6" /> : <Plane className="w-6 h-6" />}
            isExpanded={expandedSections.has('flights')}
            onToggle={() => toggleSection('flights')}
            locked={!isPlanning}
          >
            {/* Only show flights if transport type is flight */}
            {transportType === 'flight' && (
              <>
                {flights.length === 0 && isPlanning && (
                  <button
                    onClick={() => generateMockFlights(selectedDestination.city)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <Plane className="w-5 h-5" />
                    Find Best Flights to {selectedDestination.city}
                  </button>
                )}

                {flights.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flights.map((flight) => (
                      <motion.div
                        key={flight.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition ${
                          selectedFlight?.id === flight.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => isPlanning && setSelectedFlight(flight)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{flight.airline}</div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                              flight.type === 'cheapest' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {flight.type === 'cheapest' ? '💰 Cheapest' : '⏰ Best Time'}
                            </div>
                          </div>
                          {selectedFlight?.id === flight.id && (
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-semibold">{flight.departure}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Arrival:</span>
                            <span className="font-semibold">{flight.arrival}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold">{flight.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-2xl font-bold text-blue-600">${flight.price.toFixed(2)}</div>
                          <a
                            href={flight.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Search Flights <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Only show drive directions if transport type is drive */}
            {transportType === 'drive' && driveTime && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Car className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">Drive to {selectedDestination.city}</h3>
                    <p className="text-gray-600 text-sm">Road trip directions from your location</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Estimated Drive Time</div>
                        <div className="text-2xl font-bold text-gray-900">{driveTime}</div>
                      </div>
                    </div>
                  </div>

                  <a
                    href={driveDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition"
                  >
                    <MapPin className="w-5 h-5" />
                    View Directions on Google Maps
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Section 4: Lodging Selector */}
        {selectedDestination && (
          <CollapsibleSection
            title="4. Lodging Options"
            icon={<Home className="w-6 h-6" />}
            isExpanded={expandedSections.has('lodging')}
            onToggle={() => toggleSection('lodging')}
            locked={!isPlanning}
          >
            {lodgings.length === 0 && isPlanning && (
              <button
                onClick={generateMockLodging}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Find Best Lodging for {groupSize} People
              </button>
            )}

            {lodgings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lodgings.map((lodging) => (
                  <motion.div
                    key={lodging.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`border-2 rounded-xl overflow-hidden cursor-pointer transition ${
                      selectedLodging?.id === lodging.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => isPlanning && setSelectedLodging(lodging)}
                  >
                    <div className="relative h-48">
                      <img
                        src={lodging.image}
                        alt={lodging.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedLodging?.id === lodging.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-8 h-8 text-blue-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{lodging.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                          <span className="text-sm font-semibold">{lodging.rating.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Bedrooms:</span>
                          <span className="ml-2 font-semibold">{lodging.bedrooms}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bathrooms:</span>
                          <span className="ml-2 font-semibold">{lodging.bathrooms}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-semibold">{lodging.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Party OK:</span>
                          <span className={`ml-2 font-semibold capitalize ${
                            lodging.partyTolerance === 'high' ? 'text-green-600' : 
                            lodging.partyTolerance === 'medium' ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {lodging.partyTolerance}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${lodging.pricePerPerson.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">per person/night</div>
                        </div>
                        <a
                          href={lodging.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 px-3 py-2 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Airbnb <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Click to see all options for {groupSize} guests, {tripNights} nights
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Budget Summary - Always Visible */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="w-7 h-7" />
            Trip Budget Breakdown
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">Flights</div>
              <div className="text-2xl font-bold">${budget.flights.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">Lodging</div>
              <div className="text-2xl font-bold">${budget.lodging.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">Transport</div>
              <div className="text-2xl font-bold">${budget.transport.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">Activities</div>
              <div className="text-2xl font-bold">${budget.activities.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90 mb-1">Buffer (15%)</div>
              <div className="text-2xl font-bold">${budget.buffer.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/30">
            <div>
              <div className="text-lg opacity-90">Total Trip Cost</div>
              <div className="text-4xl font-bold">${budget.total.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-lg opacity-90">Per Person ({groupSize} people)</div>
              <div className="text-4xl font-bold">${budget.perPerson.toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Type Modal */}
      <AnimatePresence>
        {showTransportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowTransportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How are you getting there?</h3>
                <p className="text-gray-600">Choose your transportation method to {destinationSearch}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateTripWithTransport('flight')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 hover:from-blue-600 hover:to-blue-700 transition flex flex-col items-center gap-3"
                >
                  <Plane className="w-12 h-12" />
                  <div className="text-center">
                    <div className="font-bold text-xl">Flight</div>
                    <div className="text-sm text-blue-100 mt-1">We'll find flights from your location</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateTripWithTransport('drive')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-8 hover:from-purple-600 hover:to-purple-700 transition flex flex-col items-center gap-3"
                >
                  <Car className="w-12 h-12" />
                  <div className="text-center">
                    <div className="font-bold text-xl">Drive</div>
                    <div className="text-sm text-purple-100 mt-1">Get directions from your location</div>
                  </div>
                </motion.button>
              </div>

              <button
                onClick={() => setShowTransportModal(false)}
                className="w-full mt-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Public Link Modal */}
      <AnimatePresence>
        {showPublicLinkModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowPublicLinkModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Trip Locked!</h3>
                    <p className="text-gray-600">Share this link with your crew</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPublicLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Public Trip Link</span>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={publicLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyPublicLink}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">What your crew will see:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Full trip itinerary with dates and locations</li>
                      <li>Flight and lodging details with booking links</li>
                      <li>Daily activity schedule</li>
                      <li>Cost breakdown and payment instructions</li>
                      <li>Packing list and important info</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  locked: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, locked, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl text-white">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {locked && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Locked
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-8 pb-8 border-t border-gray-200">
              <div className="pt-6">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
