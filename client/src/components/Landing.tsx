import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Heart, MapPin, Star, Loader, Phone, Mail, Map, X } from 'lucide-react';
import axios from 'axios';
import Welcome from './onboarding/steps/Welcome';
import RoleSelection from './onboarding/steps/RoleSelection';
import WeddingDate from './onboarding/steps/WeddingDate';
import Location from './onboarding/steps/Location';
import Preferences from './onboarding/steps/Preferences';
import CeremonyDetails from './onboarding/steps/CeremonyDetails';
import Goals from './onboarding/steps/Goals';
import Summary from './onboarding/steps/Summary';
import { OnboardingData } from './onboarding/Onboarding';
import VivahaMap from './VivahaMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PreviewVendor {
  id: string;
  name: string;
  category: string;
  location: { city: string; state: string };
  rating?: number;
  estimatedCost?: number;
  phone?: string;
  email?: string;
  image?: string;
}

function VendorPreview() {
  const [vendors, setVendors] = useState<PreviewVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ city: string; state: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Photography'); // Default to Photography

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    // Immediately start fetching Photography in San Francisco while detecting location
    setUserLocation({ city: 'San Francisco', state: 'CA' });
    fetchVendors('San Francisco', 'CA');

    try {
      // Try to get location from browser geolocation (non-blocking)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use reverse geocoding
              const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { timeout: 3000 }
              );
              const city = response.data.address.city || response.data.address.town || 'San Francisco';
              const state = response.data.address.state || 'CA';
              setUserLocation({ city, state });
              fetchVendors(city, state); // Refetch with real location
            } catch (e) {
              // Keep San Francisco
            }
          },
          () => {
            // Geolocation denied - keep San Francisco
          },
          { timeout: 5000 }
        );
      }
    } catch (e) {
      // Keep San Francisco as fallback
    }
  };

  const fetchVendors = async (city: string, state: string) => {
    setLoading(true);
    try {
      const categories = selectedCategory === 'all'
        ? ['Photography', 'Venue', 'DJ', 'Catering', 'Flowers']
        : [selectedCategory];

      let allVendors: PreviewVendor[] = [];

      for (const category of categories) {
        try {
          // Try to fetch real vendors from Yelp API via backend
          const response = await axios.get(`${API_URL}/api/vendors/search`, {
            params: { city, state, category },
            timeout: 5000,
          });

          if (response.data?.businesses && response.data.businesses.length > 0) {
            const mapped = response.data.businesses.map((business: any) => ({
              id: business.id,
              name: business.name,
              category,
              location: {
                city: business.location.city,
                state: business.location.state,
              },
              rating: business.rating,
              estimatedCost: 2000 + Math.random() * 5000, // placeholder cost
              phone: business.display_phone || business.phone,
              email: '',
              image: business.image_url,
            } as PreviewVendor));
            
            allVendors = [...allVendors, ...mapped];
          } else {
            // Fallback to mock vendors if API returns empty
            const mockVendors = generateMockVendors(city, state, category);
            allVendors = [...allVendors, ...mockVendors];
          }
        } catch (err) {
          console.error(`Failed to fetch ${category}:`, err);
          // Fallback to mock vendors on error
          const mockVendors = generateMockVendors(city, state, category);
          allVendors = [...allVendors, ...mockVendors];
        }
      }

      // Show only 6 vendors total, respecting category filter
      const limitedVendors = allVendors.slice(0, 6);
      setVendors(limitedVendors);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockVendors = (city: string, state: string, category: string): PreviewVendor[] => {
    const vendors: PreviewVendor[] = [];
    
    const categoryImages: Record<string, string[]> = {
      Photography: [
        'https://images.unsplash.com/photo-1606216174928-cebf47ba24ca?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1606214174585-fe31582dc1d3?w=600&h=400&fit=crop',
      ],
      Venue: [
        'https://images.unsplash.com/photo-1519671482677-e389f3dd404b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519167271-5d9b8c24e46c?w=600&h=400&fit=crop',
      ],
      DJ: [
        'https://images.unsplash.com/photo-1493225457124-06091f128d93?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=400&fit=crop',
      ],
      Catering: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1504674900936-f534170b00fd?w=600&h=400&fit=crop',
      ],
      Flowers: [
        'https://images.unsplash.com/photo-1578509332210-a500ae6c36f0?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1550434156-98d3aa20ba8f?w=600&h=400&fit=crop',
      ],
    };

    const categoryNames: { [key: string]: string[] } = {
      Photography: [
        `${city} Wedding Photography`,
        `${city} Professional Photographers`,
      ],
      Venue: [
        `${city} Wedding Venue`,
        `Elegant Ballroom ${city}`,
      ],
      DJ: [
        `${city} Wedding DJ Services`,
        `Professional DJ - ${city}`,
      ],
      Catering: [
        `${city} Wedding Catering`,
        `Fine Dining Catering ${city}`,
      ],
      Flowers: [
        `${city} Wedding Florist`,
        `Fresh Flower Arrangements ${city}`,
      ],
    };

    const names = categoryNames[category] || [];
    const images = categoryImages[category] || [];
    
    names.slice(0, 2).forEach((name, i) => {
      vendors.push({
        id: `${category}-${i}`,
        name,
        category,
        location: { city, state },
        rating: 4.5 + Math.random() * 0.5,
        estimatedCost: category === 'Photography' ? 2500 + Math.random() * 2500 :
                       category === 'Venue' ? 5000 + Math.random() * 5000 :
                       category === 'DJ' ? 1000 + Math.random() * 2000 :
                       category === 'Catering' ? 3000 + Math.random() * 3000 :
                       1000 + Math.random() * 2000,
        phone: `(555) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 8999)}`,
        email: name.toLowerCase().replace(/\s+/g, '') + '@example.com',
        image: images[i] || `https://images.unsplash.com/photo-1519671482677-e389f3dd404b?w=600&h=400&fit=crop`,
      });
    });

    return vendors;
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-pink-100 rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            {loading ? 'Detecting location...' : `Vendors near ${userLocation?.city}, ${userLocation?.state}`}
          </h3>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'Photography', 'Venue', 'DJ', 'Catering', 'Flowers'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (userLocation) {
                  fetchVendors(userLocation.city, userLocation.state);
                }
              }}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No vendors found for this category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-gradient-to-b from-white to-white/95 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition">
                {/* Vendor Image */}
                <div className="h-72 bg-gray-200 overflow-hidden relative">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                  {/* Fade overlay at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-white"></div>
                </div>

                {/* Vendor Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{vendor.name}</h4>
                  
                  {/* Category Badge */}
                  <span className="inline-block text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded mb-2 font-medium">
                    {vendor.category}
                  </span>

                  {/* Rating */}
                  {vendor.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{vendor.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Cost */}
                  {vendor.estimatedCost && (
                    <p className="text-sm text-gray-600 mb-3">
                      Est. ${vendor.estimatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  )}

                  {/* Contact Info Preview */}
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    {vendor.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search More CTA */}
          <div className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg border border-primary-200 p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Want to see more vendors?</h4>
            <p className="text-gray-600 mb-4">Sign up to unlock full vendor search, favorites, ratings, and more!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
              >
                🔍 Search Vendors (Sign Up)
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition"
              >
                Already have account? Sign In
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Feature = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-900 break-words">{title}</h3>
    <p className="text-sm text-gray-600 mt-2 break-words whitespace-normal">{desc}</p>
  </div>
);

function OnboardingPreview() {
  const steps = [
    { title: 'Role', text: 'Who are you planning for? (Getting Married / Parent / Planner)', example: 'Example: "I\'m getting married"' },
    { title: 'Date', text: 'When is your wedding? We\'ll help you track everything leading up to it.', example: 'Example: "March 15, 2026"' },
    { title: 'Location', text: "Where's the wedding? We use this to find local vendors.", example: 'Example: "San Francisco, CA"' },
    { title: 'Vendors', text: 'We find photographers, DJs, venues and caterers near you.', example: 'Example: "Show me photographers near San Francisco"' },
    { title: 'Preferences', text: 'Tell us your style, budget, and what matters most.', example: 'Example: "Modern wedding, $50,000 budget, 150 guests"' },
    { title: 'Ceremonies', text: 'Plan your ceremonies and cultural traditions.', example: 'Example: "Hindu ceremony with modern reception"' },
    { title: 'Summary', text: 'Quick summary and dashboard preview — you are ready to go!', example: 'Example: "Review your wedding plan"' },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((s) => (s + 1) % steps.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-40 relative">
      <div className="absolute inset-0 transition-transform duration-500" style={{ transform: `translateY(${-i * 100}%)` }}>
        {steps.map((s, idx) => (
          <div key={idx} className="h-40 flex items-center p-4 border-b last:border-b-0">
            <div className="w-full">
              <div className="text-sm text-primary-700 font-semibold">{s.title}</div>
              <div className="mt-2 text-gray-700 text-sm">{s.text}</div>
              <div className="mt-3 text-xs text-gray-500">{s.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [step, setStep] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const base = import.meta.env.BASE_URL || '/';
  const heroImages = [
    `${base}hero-images/back-view-islamic-couple-spending-time-together.jpg`,
    `${base}hero-images/beautiful-wedding-ceremony-nature.jpg`,
    `${base}hero-images/side-view-happy-man-proposing.jpg`,
    `${base}hero-images/young-wedding-couple-enjoying-romantic-moments.jpg`,
  ];
  const [showHero, setShowHero] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoRef = useRef<HTMLDivElement | null>(null);
  useScrollIntoDemo(demoRef, demoPlaying);

  // start demo and ensure demo container is scrolled into view
  const startDemo = () => {
    setDemoPlaying(true);
    // ensure demo content is rendered before scrolling
    window.setTimeout(() => demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
  };

  // preload images and start carousel (start with preferred image first)
  useEffect(() => {
    // prefer the side-view image first
    const preferred = heroImages.findIndex((p) => p.includes('side-view-happy-man-proposing'));
    if (preferred >= 0) setCurrentHero(preferred);

    heroImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    if (!showHero) return;
    const r = setInterval(() => setCurrentHero((c) => (c + 1) % heroImages.length), 3000);
    // auto-stop hero carousel after 12s so page returns to pink background
    const stop = setTimeout(() => setShowHero(false), 12_000);
    return () => {
      clearInterval(r);
      clearTimeout(stop);
    };
  }, [showHero]);
  const lines = [
    'Vivaha Planning for Modern & Interfaith Weddings',
    'Manage multicultural ceremonies & celebrations',
    'Organize guest lists, budgets & vendors in one place',
    'Plan bachelor/bachelorette parties with ease',
  ];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % lines.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-pink-50 to-white text-gray-900 flex flex-col">

      {/* Hero background carousel (absolute behind content) */}
      <div className="fixed inset-0 -z-10 transition-opacity duration-700">
        {showHero ? (
          <div
            className="absolute inset-0 bg-center bg-cover opacity-90 transition-opacity duration-900"
            style={{ backgroundImage: `url(${heroImages[currentHero]})` }}
            onClick={() => setShowHero(false)}
          />
        ) : null}
        {/* subtle gradient overlay to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-60 pointer-events-none" />
      </div>
      <header className="w-full border-b border-white/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 text-white p-2 rounded-md">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vivaha</h1>
              <p className="text-sm text-black/70 font-medium tracking-wide uppercase">Wedding Planning</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setShowMap(true)}
              className="hidden p-2 bg-transparent text-black rounded-md border-2 border-black hover:bg-black hover:text-white transition flex items-center justify-center"
              title="Explore Weddings"
            >
              <Map className="h-5 w-5" />
            </button>
            <Link to="/what-is-vivaha" className="px-4 py-2 bg-transparent text-black rounded-md font-medium border-2 border-black hover:bg-black hover:text-white transition">About</Link>
            <Link to="/login" className="px-4 py-2 bg-white text-primary-700 rounded-md font-medium">Log in</Link>
            <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium">Sign up</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full lg:w-[500px] flex flex-col justify-center items-start border">
            <div className="w-full">
              <div className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
                <span className="block text-primary-700">{lines[step]}</span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 font-normal">Vivaha helps you manage guests, budget, vendors and ceremony details — all in one beautiful dashboard.</p>

              <div className="flex gap-3 mb-4">
                <Link to="/register" onClick={() => setShowHero(false)} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold">Get started — it's free</Link>
                <DemoLauncher stopHero={() => setShowHero(false)} />
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Feature title="Fast Onboarding" desc="Answer a few quick questions and we customize your dashboard instantly." />
                <Feature title="Offline Mode" desc="Access your wedding details anytime, anywhere — even without internet." />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 w-full lg:w-[500px] flex flex-col justify-center items-start border">
            <h3 className="text-2xl font-semibold tracking-tight mb-4">Onboarding Preview</h3>
            <div className="overflow-hidden rounded-md border p-2 bg-white w-full mb-4 break-words">
              <OnboardingPreview />
            </div>

            <div className="mt-2 w-full">
              <h4 className="text-sm font-medium text-gray-700">How it helps</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>We ask a few quick questions (role, religion, location, date).</li>
                <li>We use your location to suggest nearby vendors (photographers, DJs, venues).</li>
                <li>Favorites and saved vendors show up instantly on your dashboard.</li>
              </ul>
            </div>
          </div>
        </div>
        {/* demo is rendered below the two boxes when playing */}

        {/* Demo container: appears below the two centered boxes when playing */}
        <div className="w-full flex justify-center">
          <div
            ref={demoRef}
            className={`max-w-6xl mx-auto w-full transition-transform duration-700 ease-in-out ${demoPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}
          >
            {demoPlaying && (
              <div className="mx-6">
                <div className="bg-white rounded-2xl shadow-xl p-4 max-h-[86vh] overflow-hidden border">
                  <div className="h-full overflow-auto min-w-0 break-words">
                    <DemoPlayer inline onClose={() => setDemoPlaying(false)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Find Vendors Section */}
      <section className="w-full py-16 bg-gradient-to-b from-pink-50 via-pink-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Promotional Text */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Find Vendors Near You
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Discover photographers, venues, caterers, and more in your area
            </p>
            <p className="text-sm text-primary-600 font-semibold">
              ✨ And many more features when you sign up
            </p>
          </div>

          {/* Location Detection & Vendor Display */}
          <VendorPreview />
        </div>
      </section>

      {/* Gallery carousel section */}
      <section className="w-full py-12">
        <div className="max-w-6xl mx-auto px-6">
          <GalleryCarousel images={heroImages} />
        </div>
      </section>

      <footer className="py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>Already have an account? <Link to="/login" className="text-primary-700 font-semibold">Sign in</Link></p>
        </div>
      </footer>

      {/* helper error pointer to login/signup area */}
      <div className="fixed right-6 bottom-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 shadow">
          <div className="font-semibold">Need help?</div>
          <div className="text-sm">Use the top-right buttons to Sign up or Log in.</div>
        </div>
      </div>
      
      {/* Vivaha Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50">
          <VivahaMap onClose={() => setShowMap(false)} />
        </div>
      )}
    </div>
  );
}

function GalleryCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // start autoplay when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => setPlaying(e.isIntersecting));
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // autoplay every ~20s when playing
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 20_000);
    return () => clearInterval(id);
  }, [playing, images.length]);

  useEffect(() => {
    // preload images
    images.forEach((src) => { const img = new Image(); img.src = src; });
  }, [images]);

  return (
    <div ref={containerRef} className="py-6">
      <h3 className="text-2xl font-semibold mb-4">Gallery</h3>
      <div className="relative w-full bg-white/90 rounded-2xl shadow-lg p-6 overflow-hidden">
        <div className="w-full h-[240px] sm:h-[320px] md:h-[520px] flex items-center justify-center">
          <div className="w-full max-w-[1100px] h-full relative">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`hero-${i}`}
                className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)', borderRadius: 12 }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setPlaying(true); }}
              className={`w-3 h-3 rounded-full ${i === index ? 'bg-primary-600' : 'bg-gray-300'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// scroll demo into view when it starts
function useScrollIntoDemo(demoRef: React.RefObject<HTMLDivElement>, playing: boolean) {
  useEffect(() => {
    if (playing && demoRef.current) {
      // small timeout to allow layout/transition to settle
      const id = window.setTimeout(() => demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140);
      return () => clearTimeout(id);
    }
    return;
  }, [playing, demoRef]);
}

function DemoLauncher({ stopHero }: { stopHero?: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <button
        onClick={() => {
          stopHero?.();
          navigate('/demo');
        }}
        className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold border"
      >
        View demo
      </button>
    </>
  );
}

function DemoPlayer({ onClose, inline }: { onClose: () => void; inline?: boolean }) {
  // Demo shows onboarding on the left and a dashboard preview on the right.
  const [demoStep, setDemoStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({ role: '', weddingStyle: '', topPriority: [], goals: '' });
  const [showDashboard, setShowDashboard] = useState(false);

  const script = useRef<Array<{ delay: number; run: () => void }>>([]);

  useEffect(() => {
    // Prepare scripted actions
    let t = 0;
    const push = (delay: number, fn: () => void) => {
      t += delay;
      script.current.push({ delay: t, run: fn });
    };

    push(1200, () => { setData(d => ({ ...d, role: 'self' })); });
    push(800, () => setDemoStep(2)); // next to WeddingDate
    push(1200, () => { setData(d => ({ ...d, weddingDate: new Date().toISOString().split('T')[0] })); });
    push(800, () => setDemoStep(3));
    push(1000, () => { setData(d => ({ ...d, weddingCity: 'San Francisco', weddingState: 'CA' })); });
    push(800, () => setDemoStep(4));
    push(1000, () => { setData(d => ({ ...d, religions: ['Christian', 'Muslim'], isReligious: true })); });
    push(800, () => setDemoStep(5));
    push(900, () => { setData(d => ({ ...d, estimatedBudget: 15000, guestCount: 120 })); });
    push(800, () => setDemoStep(6));
    push(1000, () => { setData(d => ({ ...d, goals: 'Beautiful cultural ceremony' })); });
    push(700, () => setDemoStep(7));
    push(900, () => setDemoStep(8));
    push(900, () => { setShowDashboard(true); });

    const timers: number[] = [];
    script.current.forEach(({ delay, run }) => {
      const id = window.setTimeout(run, delay) as unknown as number;
      timers.push(id);
    });

    // auto-close after ~25s (user asked for 20-25s; choose 25s for full demo)
    const finish = window.setTimeout(() => onClose(), 25_000) as unknown as number;
    timers.push(finish);

    return () => timers.forEach((id) => clearTimeout(id));
  }, [onClose]);

  const updateData = (d: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...d }));
  const next = () => setDemoStep(s => Math.min(s + 1, 8));
  const back = () => setDemoStep(s => Math.max(s - 1, 1));

  const container = (
    <div className={`relative w-full bg-white rounded-2xl p-4 shadow-xl ${inline ? '' : 'max-w-5xl mx-4'}`}>
      <div className={`md:flex md:flex-row md:items-start gap-6`}>
        <div className="min-w-0 md:w-2/5 pr-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Onboarding (Preview)</h3>
              <p className="text-sm text-gray-500">This simulates the quick onboarding that presets your dashboard.</p>
            </div>
            <button onClick={onClose} className="text-sm text-gray-500">Close</button>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow p-6 max-h-[44vh] overflow-auto break-words whitespace-normal">
            {demoStep === 1 && <RoleSelection data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 2 && <WeddingDate data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 3 && <Location data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 4 && <Preferences data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 5 && <CeremonyDetails data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 6 && <Goals data={data} updateData={updateData} onNext={next} onBack={back} />}
            {demoStep === 7 && <Summary data={data} onBack={back} onComplete={() => { setDemoStep(8); }} />}
            {demoStep === 8 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold">Finishing…</h3>
                <p className="text-sm text-gray-500 mt-2">Opening your personalized dashboard now.</p>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 md:w-3/5 pl-3">
          <h3 className="text-lg font-semibold mb-3">Dashboard Preview</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-4 max-h-[44vh] overflow-auto">
            <div className="p-3 bg-white rounded-md border">
              <div className="text-xs text-gray-500">Wedding Location</div>
              <div className="text-lg font-bold">{data.weddingCity || 'San Francisco'}, {data.weddingState || 'CA'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary-50 rounded-md">
                <div className="text-xs text-gray-500">Total Guests</div>
                <div className="text-2xl font-bold">{data.guestCount || 120}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-xs text-gray-500">Budget</div>
                <div className="text-2xl font-bold">${(data.estimatedBudget || 15000).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-md border">
              <div className="text-xs text-gray-500 font-semibold">Quick Stats</div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-medium">{data.role === 'self' ? 'Getting Married' : data.role || 'Parent'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span className="font-medium text-primary-600 truncate">{data.goals || 'Beautiful celebration'}</span>
                </div>
              </div>
            </div>

            {showDashboard ? (
              <div className="p-4 bg-gradient-to-r from-primary-50 to-green-50 rounded-md border-2 border-primary-200 space-y-3">
                <div className="font-semibold text-primary-900">✓ Dashboard Ready!</div>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>• Guest list management enabled</div>
                  <div>• Budget tracking configured</div>
                  <div>• Vendor search for {data.weddingCity || 'your location'}</div>
                  <div>• Task management active</div>
                </div>
                <div className="pt-2 text-xs text-gray-600 font-medium">
                  Sign up now to access your personalized wedding planning dashboard!
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200 text-blue-800 text-sm">
                Completing onboarding... Your dashboard will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vivaha Demo</h2>
            <p className="text-sm text-gray-600">Auto-run onboarding to show how your dashboard gets populated.</p>
          </div>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        {container}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-5xl w-full mx-4">{container}</div>
    </div>
  );

}
