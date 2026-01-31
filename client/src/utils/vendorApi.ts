// Vendor API integration using Yelp Fusion API
// To use: Get API key from https://www.yelp.com/developers/v3/manage_app

const YELP_API_KEY = process.env.VITE_YELP_API_KEY || '';
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';

export interface RealVendor {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  phone: string;
  url: string;
  image_url: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  categories: { alias: string; title: string }[];
  price?: string;
}

const categoryMapping: { [key: string]: string } = {
  Photography: 'photographers',
  Venue: 'venues',
  DJ: 'djs',
  Officiant: 'officiants',
  Catering: 'caterers',
  Flowers: 'florists',
  Planning: 'wedding_planning',
};

export async function searchYelpVendors(
  city: string,
  state: string,
  category: string
): Promise<RealVendor[]> {
  // If no API key, return empty array (graceful degradation)
  if (!YELP_API_KEY) {
    console.warn('Yelp API key not configured. Set VITE_YELP_API_KEY in .env file');
    return [];
  }

  try {
    const yelpCategory = categoryMapping[category] || 'wedding';
    const location = `${city}, ${state}`;

    const response = await fetch(
      `${YELP_API_URL}?location=${encodeURIComponent(location)}&term=wedding+${encodeURIComponent(
        yelpCategory
      )}&limit=20&sort_by=rating`,
      {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Yelp API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.businesses || [];
  } catch (error) {
    console.error('Error fetching vendors from Yelp:', error);
    return [];
  }
}

// Google Places API alternative
const GOOGLE_API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY || '';

export async function searchGooglePlaces(
  city: string,
  state: string,
  category: string
): Promise<any[]> {
  if (!GOOGLE_API_KEY) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const query = `wedding ${category} in ${city}, ${state}`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_API_KEY}`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return [];
  }
}

// Fallback: Generate realistic-looking vendors with Google Maps links
export function generateFallbackVendors(
  city: string,
  state: string,
  category: string,
  count: number = 5
): any[] {
  const businessNames: { [key: string]: string[] } = {
    Photography: ['Photography', 'Photo Studio', 'Imaging', 'Pictures', 'Moments Photography'],
    Venue: ['Ballroom', 'Gardens', 'Estate', 'Hall', 'Event Center'],
    DJ: ['DJ Services', 'Entertainment', 'Music', 'Sound & Lighting', 'Party DJ'],
    Officiant: ['Wedding Officiants', 'Ceremonies', 'Ministers', 'Wedding Services', 'Celebrations'],
    Catering: ['Catering', 'Culinary Services', 'Events Catering', 'Gourmet Catering', 'Banquet Services'],
    Flowers: ['Florist', 'Floral Designs', 'Flowers & Gifts', 'Botanical', 'Floral Boutique'],
    Planning: ['Event Planning', 'Wedding Coordination', 'Event Design', 'Wedding Planners', 'Celebrations Co'],
  };

  const names = businessNames[category] || ['Wedding Services'];

  return Array.from({ length: count }, (_, i) => ({
    id: `fallback-${category}-${i}`,
    name: `${city} ${names[i % names.length]}`,
    category,
    location: { city, state },
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    reviewCount: Math.floor(Math.random() * 200) + 20,
    estimatedCost: Math.floor(Math.random() * 5000) + 1000,
    phone: `(555) ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`,
    // Real Google Maps search link
    website: `https://www.google.com/maps/search/wedding+${category.toLowerCase()}+${city.replace(
      /\s+/g,
      '+'
    )}+${state.replace(/\s+/g, '+')}`,
    googleMapsLink: `https://www.google.com/maps/search/wedding+${category.toLowerCase()}+${city.replace(
      /\s+/g,
      '+'
    )}+${state.replace(/\s+/g, '+')}`,
    specialties: ['Professional', 'Experienced', 'Highly Rated'],
  }));
}
