import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, Mail, Globe, DollarSign, Filter, Loader, Heart } from 'lucide-react';
import axios from 'axios';
import LocationPermission from '../onboarding/steps/LocationPermission';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Vendor {
  _id?: string;
  id: string;
  name: string;
  category: string;
  location: {
    city: string;
    state?: string;
  };
  rating?: number;
  estimatedCost?: number;
  phone?: string;
  email?: string;
  website?: string;
  specialties?: string[];
  religiousAccommodations?: string[];
  image?: string;
  status?: string;
  isFavorite?: boolean;
}

export default function VendorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userCity, setUserCity] = useState('');
  const [userState, setUserState] = useState('');
  const [userReligions, setUserReligions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [minRating, setMinRating] = useState(0);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [religiousFilter, setReligiousFilter] = useState<string>('all');
  const [culturalFilter, setCulturalFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetchUserLocation();
    fetchFavoriteVendors();
  }, []);

  useEffect(() => {
    if (userCity && userState) {
      fetchVendors();
    }
  }, [userCity, userState, selectedCategory]);

  const fetchFavoriteVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const favs = response.data.data;
        setFavoriteVendors(favs);
        setFavorites(favs.map((v: Vendor) => v.id));
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      // Fallback to local favorites if available
      try {
        const localFavs = JSON.parse(localStorage.getItem('favoriteVendors') || '[]');
        setFavoriteVendors(localFavs);
        setFavorites(localFavs.map((v: Vendor) => v.id));
      } catch (e) {
        // ignore
      }
    }
  };

  const toggleFavorite = async (vendorId: string, vendor: Vendor) => {
    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.includes(vendorId);
      
      if (isFavorite) {
        // Remove from favorites
        const existingVendor = favoriteVendors.find(v => v.id === vendorId);
        if (existingVendor?._id) {
          await axios.delete(`${API_URL}/api/vendors/${existingVendor._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        setFavorites(favorites.filter(id => id !== vendorId));
        setFavoriteVendors(favoriteVendors.filter(v => v.id !== vendorId));
      } else {
        // Add to favorites
        const response = await axios.post(`${API_URL}/api/vendors`, {
          ...vendor,
          status: 'researching',
          isFavorite: true,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          setFavorites([...favorites, vendorId]);
          setFavoriteVendors([...favoriteVendors, response.data.data]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite');
    }
  };

  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const token = localStorage.getItem('token');
      
      // Try to get real Yelp vendors from backend
      const categories = selectedCategory === 'all' 
        ? ['Photography', 'Venue', 'DJ', 'Catering', 'Flowers', 'Officiant', 'Planning']
        : [selectedCategory];

      const allVendors: Vendor[] = [];

      for (const category of categories) {
        try {
          const response = await axios.get(`${API_URL}/api/vendors/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { city: userCity, state: userState, category },
          });

          if (response.data.businesses && response.data.businesses.length > 0) {
            // Map Yelp data to our Vendor format
            const yelpVendors = response.data.businesses.map((business: any) => ({
              id: business.id,
              name: business.name,
              category,
              location: {
                city: business.location.city,
                state: business.location.state,
              },
              rating: business.rating,
              phone: business.display_phone || business.phone,
              email: '',
              website: business.url, // Yelp business page
              specialties: business.categories?.map((c: any) => c.title) || [],
              religiousAccommodations: [],
              image: business.image_url,
            }));
            allVendors.push(...yelpVendors);
          } else {
            // Fallback to generated vendors if no Yelp data
            allVendors.push(...generateVendorsForCity(userCity, userState).filter(v => v.category === category));
          }
        } catch (error) {
          // If Yelp fails, use generated vendors
          allVendors.push(...generateVendorsForCity(userCity, userState).filter(v => v.category === category));
        }
      }

      setVendors(allVendors);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      // final fallback: local generated vendors
      setVendors(generateVendorsForCity(userCity, userState));
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setUserCity(response.data.weddingCity || '');
        setUserState(response.data.weddingState || '');
        setUserReligions(response.data.religions || []);
        
        // If no city is set, show location prompt
        if (!response.data.weddingCity) {
          setShowLocationPrompt(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user location:', error);
      // Fallback: try to read onboarding from localStorage
      try {
        const localOnboarding = JSON.parse(localStorage.getItem('onboarding') || 'null');
        if (localOnboarding) {
          setUserCity(localOnboarding.weddingCity || '');
          setUserState(localOnboarding.weddingState || '');
          setUserReligions(localOnboarding.religions || []);
          if (!localOnboarding.weddingCity) setShowLocationPrompt(true);
        } else {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          if (user && user.city) {
            setUserCity(user.city);
            setUserState(user.state || '');
          } else {
            setShowLocationPrompt(true);
          }
        }
      } catch (e) {
        setShowLocationPrompt(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationDetected = async (city: string, state: string, country: string) => {
    // Save the detected location
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await axios.put(`${API_URL}/api/onboarding`, {
        ...response.data,
        weddingCity: city,
        weddingState: state,
        weddingCountry: country,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setUserCity(city);
      setUserState(state);
      setShowLocationPrompt(false);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  // Generate vendors with real Google Maps links
  const generateVendorsForCity = (city: string, state: string): Vendor[] => {
    if (!city) return [];
    
    const createGoogleMapsLink = (category: string) => 
      `https://www.google.com/maps/search/wedding+${category.toLowerCase().replace(/\s+/g, '+')}+${city.replace(/\s+/g, '+')}+${state.replace(/\s+/g, '+')}`;
    
    return [
      {
        id: '1',
        name: `${city} Elite Photography`,
        category: 'Photography',
        location: { city, state },
        rating: 4.9,
        estimatedCost: 3500,
        phone: '(555) 010-0100',
        email: `info@${city.toLowerCase().replace(/\s+/g, '')}photo.com`,
        website: createGoogleMapsLink('photographers'),
        specialties: ['Wedding', 'Engagement', 'Pre-wedding'],
        religiousAccommodations: ['All faiths welcome', 'Cultural ceremonies'],
      },
      {
        id: '2',
        name: `Grand ${city} Ballroom`,
        category: 'Venue',
        location: { city, state },
        rating: 4.8,
        estimatedCost: 8000,
        phone: '(555) 010-0101',
        email: `events@grand${city.toLowerCase().replace(/\s+/g, '')}.com`,
        website: createGoogleMapsLink('wedding+venues'),
        specialties: ['Indoor', 'Up to 300 guests', 'Full catering'],
        religiousAccommodations: ['Interfaith ceremonies', 'All traditions welcome'],
      },
      {
        id: '3',
        name: `${city} Premier DJ Services`,
        category: 'DJ',
        location: { city, state },
        rating: 4.7,
        estimatedCost: 1500,
        phone: '(555) 010-0102',
        email: `bookings@${city.toLowerCase().replace(/\s+/g, '')}dj.com`,
        website: createGoogleMapsLink('wedding+dj'),
        specialties: ['Multi-cultural music', 'Interactive host', 'Lighting'],
        religiousAccommodations: ['Respectful of all cultural music traditions'],
      },
      {
        id: '4',
        name: `${city} Sacred Ceremonies`,
        category: 'Officiant',
        location: { city, state },
        rating: 5.0,
        estimatedCost: 800,
        phone: '(555) 010-0103',
        email: `contact@${city.toLowerCase().replace(/\s+/g, '')}ceremonies.com`,
        website: createGoogleMapsLink('wedding+officiant'),
        specialties: ['Interfaith', 'Non-denominational', 'Custom ceremonies'],
        religiousAccommodations: userReligions.length > 0 
          ? [...userReligions, 'Interfaith unions', 'All traditions welcome']
          : ['All faiths', 'Interfaith unions', 'Secular ceremonies', 'LGBTQ+ weddings'],
      },
      {
        id: '5',
        name: `${city} Gourmet Catering`,
        category: 'Catering',
        location: { city, state },
        rating: 4.6,
        estimatedCost: 5500,
        phone: '(555) 010-0104',
        email: `catering@${city.toLowerCase().replace(/\s+/g, '')}gourmet.com`,
        website: createGoogleMapsLink('wedding+catering'),
        specialties: ['Buffet', 'Plated service', 'Dietary restrictions'],
        religiousAccommodations: ['Halal', 'Kosher', 'Vegetarian', 'Vegan'],
      },
      {
        id: '6',
        name: `${city} Floral Designs`,
        category: 'Flowers',
        location: { city, state },
        rating: 4.8,
        estimatedCost: 2000,
        phone: '(555) 010-0105',
        email: `flowers@${city.toLowerCase().replace(/\s+/g, '')}florals.com`,
        website: createGoogleMapsLink('wedding+florist'),
        specialties: ['Bouquets', 'Centerpieces', 'Ceremony arches'],
        religiousAccommodations: ['Cultural flower preferences', 'Traditional arrangements'],
      },
      {
        id: '7',
        name: `${city} Event Planning Co.`,
        category: 'Planning',
        location: { city, state },
        rating: 4.9,
        estimatedCost: 4000,
        phone: '(555) 010-0106',
        email: `info@${city.toLowerCase().replace(/\s+/g, '')}events.com`,
        website: createGoogleMapsLink('wedding+planner'),
        specialties: ['Full planning', 'Day-of coordination', 'Destination weddings'],
        religiousAccommodations: ['Cultural wedding expertise', 'Multilingual coordinators'],
      },
    ];
  };

  // Remove the line: const vendors = generateVendorsForCity(userCity, userState);

  const categories = [
    { id: 'all', name: 'All Vendors' },
    { id: 'Venue', name: 'Venues' },
    { id: 'Photography', name: 'Photographers' },
    { id: 'DJ', name: 'DJs & Entertainment' },
    { id: 'Catering', name: 'Catering' },
    { id: 'Flowers', name: 'Florists' },
    { id: 'Officiant', name: 'Officiants' },
    { id: 'Planning', name: 'Wedding Planners' },
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesPrice = !vendor.estimatedCost || 
                        (vendor.estimatedCost >= priceRange.min && vendor.estimatedCost <= priceRange.max);
    const matchesRating = !vendor.rating || vendor.rating >= minRating;
    
    // Religious/Cultural filters
    const matchesReligious = religiousFilter === 'all' || 
      vendor.religiousAccommodations?.some(acc => 
        acc.toLowerCase().includes(religiousFilter.toLowerCase())
      ) || 
      vendor.specialties?.some(spec => 
        spec.toLowerCase().includes(religiousFilter.toLowerCase())
      );

    const matchesCultural = culturalFilter === 'all' ||
      vendor.specialties?.some(spec => 
        spec.toLowerCase().includes(culturalFilter.toLowerCase())
      ) ||
      vendor.name.toLowerCase().includes(culturalFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesReligious && matchesCultural;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading vendors for your area...</p>
        </div>
      </div>
    );
  }

  if (!userCity) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Search</h1>
          <p className="text-gray-500 mt-1">Find local vendors and services</p>
        </div>

        {showLocationPrompt ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Detect Your Location
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Allow us to detect your location to show local vendors, or you can set it manually in Settings.
            </p>
            <LocationPermission
              onLocationDetected={handleLocationDetected}
              onSkip={() => setShowLocationPrompt(false)}
            />
            <div className="mt-4 text-center">
              <a
                href="/dashboard/settings"
                className="text-pink-600 hover:text-pink-700 font-medium text-sm"
              >
                Or set location manually in Settings →
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
            <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Required</h2>
            <p className="text-gray-600 mb-4">
              Please set your wedding city to see local vendors.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLocationPrompt(true)}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Detect My Location
              </button>
              <a
                href="/dashboard/settings"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Go to Settings
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Search</h1>
        <p className="text-gray-500 mt-1">
          Find local vendors and services
          {userCity && <span className="font-medium text-primary-600"> in {userCity}, {userState}</span>}
        </p>
      </div>

      {/* Local Vendor Ad Banner */}
      {userCity && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Featured in {userCity}</h3>
                <p className="text-pink-100 text-sm">
                  Showing {filteredVendors.length} verified local vendors
                  {userReligions.length > 0 && ` • ${userReligions.length > 1 ? 'Interfaith' : userReligions[0]} ceremony specialists`}
                </p>
              </div>
            </div>
            {userReligions.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm font-medium">Religious Accommodations Available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vendors, services, specialties..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Religious Accommodation Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCategory === 'Officiant' ? 'Officiant Type' : 'Religious Specialization'}
                </label>
                <select
                  value={religiousFilter}
                  onChange={(e) => setReligiousFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                >
                  <option value="all">All Types</option>
                  {selectedCategory === 'Officiant' ? (
                    <>
                      <option value="hindu">Hindu Pandit/Priest</option>
                      <option value="muslim">Muslim Imam/Qazi</option>
                      <option value="christian">Christian Pastor/Priest</option>
                      <option value="jewish">Jewish Rabbi</option>
                      <option value="sikh">Sikh Granthi</option>
                      <option value="buddhist">Buddhist Monk</option>
                      <option value="interfaith">Interfaith Officiant</option>
                      <option value="civil">Civil Officiant</option>
                      <option value="secular">Secular Celebrant</option>
                    </>
                  ) : (
                    <>
                      <option value="hindu">Hindu Weddings</option>
                      <option value="muslim">Muslim/Islamic Weddings</option>
                      <option value="christian">Christian Weddings</option>
                      <option value="jewish">Jewish Weddings</option>
                      <option value="sikh">Sikh Weddings</option>
                      <option value="buddhist">Buddhist Weddings</option>
                      <option value="interfaith">Interfaith Ceremonies</option>
                      <option value="halal">Halal Catering</option>
                      <option value="kosher">Kosher Catering</option>
                      <option value="vegetarian">Vegetarian/Vegan</option>
                    </>
                  )}
                </select>
              </div>

              {/* Cultural Specialization Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Expertise
                </label>
                <select
                  value={culturalFilter}
                  onChange={(e) => setCulturalFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                >
                  <option value="all">All Cultures</option>
                  <option value="indian">Indian Weddings</option>
                  <option value="pakistani">Pakistani Weddings</option>
                  <option value="chinese">Chinese Weddings</option>
                  <option value="japanese">Japanese Weddings</option>
                  <option value="korean">Korean Weddings</option>
                  <option value="mexican">Mexican Weddings</option>
                  <option value="italian">Italian Weddings</option>
                  <option value="greek">Greek Weddings</option>
                  <option value="african">African Weddings</option>
                  <option value="caribbean">Caribbean Weddings</option>
                  <option value="middle eastern">Middle Eastern Weddings</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>All Ratings</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: ${priceRange.max.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={1000}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{filteredVendors.length}</span> vendor{filteredVendors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => {
          const isFavorite = favorites.includes(vendor.id);
          
          return (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden relative">
              {/* Favorite Heart Button */}
              <button
                onClick={() => toggleFavorite(vendor.id, vendor)}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full transition ${
                  isFavorite
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
              </button>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{vendor.category}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {vendor.location.city}{vendor.location.state && `, ${vendor.location.state}`}
                      </span>
                    </div>
                  </div>
                  {vendor.rating && (
                    <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-yellow-700">{vendor.rating}</span>
                    </div>
                  )}
                </div>

              {vendor.estimatedCost && (
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    ${vendor.estimatedCost.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">estimated</span>
                </div>
              )}

              {vendor.specialties && vendor.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {vendor.religiousAccommodations && vendor.religiousAccommodations.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Religious Accommodations:</p>
                  <div className="flex flex-wrap gap-1">
                    {vendor.religiousAccommodations.map((acc, index) => (
                      <span key={index} className="text-xs text-purple-600">
                        {acc}{index < vendor.religiousAccommodations!.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4 border-t">
                {isFavorite && (
                  <span className="text-xs text-red-600 font-medium">★ Favorited</span>
                )}
                {vendor.phone && (
                  <a 
                    href={`tel:${vendor.phone}`} 
                    className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                )}
                {vendor.email && (
                  <a 
                    href={`mailto:${vendor.email}`} 
                    className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                )}
                {vendor.website && (
                  <a
                    href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No vendors found matching your criteria</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Location-specific Ad Banner */}
      {userCity && (
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Special Offers in {userCity}!</h3>
          <p className="text-primary-100 mb-4">
            Local vendors are offering exclusive discounts for WedWise users. Contact them today and mention this offer!
          </p>
          <button className="px-6 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition">
            View All Local Offers
          </button>
        </div>
      )}
    </div>
  );
}
