/**
 * Utility for generating proper flight and accommodation booking URLs
 */

// Common US airport codes and popular bachelor/bachelorette destinations
const AIRPORT_CODES: { [key: string]: string } = {
  'los angeles': 'LAX',
  'new york': 'JFK',
  'chicago': 'ORD',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'denver': 'DEN',
  'san francisco': 'SFO',
  'seattle': 'SEA',
  'miami': 'MIA',
  'boston': 'BOS',
  'las vegas': 'LAS',
  'vegas': 'LAS',
  'phoenix': 'PHX',
  'houston': 'IAH',
  'orlando': 'MCO',
  'austin': 'AUS',
  'nashville': 'BNA',
  'new orleans': 'MSY',
  'nola': 'MSY',
  'cancun': 'CUN',
  'cabo': 'SJD',
  'cabo san lucas': 'SJD',
  'punta cana': 'PUJ',
  'acapulco': 'ACA',
  'mexico city': 'MEX',
  'toronto': 'YYZ',
  'vancouver': 'YVR',
  'cancún': 'CUN',
  'smokey mountains': 'TYS', // Knoxville
  'smoky mountains': 'TYS',
  'gatlinburg': 'TYS',
  'pigeon forge': 'TYS',
  'tennessee': 'BNA',
  'lake tahoe': 'RNO',
  'tahoe': 'RNO',
  'aspen': 'ASE',
  'vail': 'EGE',
  'napa': 'SFO',
  'napa valley': 'SFO',
  'san diego': 'SAN',
  'santa barbara': 'SBA',
  'monterey': 'MRY',
  'carmel': 'MRY',
  'santa monica': 'LAX',
  'malibu': 'LAX',
  'palm springs': 'PSP',
  'sedona': 'PHX',
  'scottsdale': 'PHX',
  'santa fe': 'SAF',
  'albuquerque': 'ABQ',
  'aruba': 'AUA',
  'bahamas': 'NAS',
  'nassau': 'NAS',
  'belize': 'BZE',
  'costa rica': 'SJO',
  'costarica': 'SJO',
  'san jose costa rica': 'SJO',
  'dominican republic': 'PUJ',
  'jamaica': 'MBJ',
  'montego bay': 'MBJ',
  'puerto rico': 'SJU',
  'san juan': 'SJU',
  'hawaii': 'HNL',
  'honolulu': 'HNL',
  'maui': 'OGG',
  'kauai': 'LIH',
  'big island': 'KOA',
  'kona': 'KOA',
  'charleston': 'CHS',
  'savannah': 'SAV',
  'key west': 'EYW',
  'fort lauderdale': 'FLL',
  'tampa': 'TPA',
  'portland': 'PDX',
  'wine country': 'SFO',
  'temecula': 'SAN',
  'san antonio': 'SAT',
  'memphis': 'MEM',
  'myrtle beach': 'MYR',
};

/**
 * Get airport code for a given city/destination
 * Uses fuzzy matching to handle variations
 */
export const getAirportCode = (destination: string): string => {
  if (!destination) return 'LAX'; // Default to Los Angeles
  
  const normalized = destination.toLowerCase().trim();
  
  // Direct match
  if (AIRPORT_CODES[normalized]) {
    return AIRPORT_CODES[normalized];
  }
  
  // Partial match - check if destination contains any known city
  for (const [city, code] of Object.entries(AIRPORT_CODES)) {
    if (normalized.includes(city) || city.includes(normalized.split(' ')[0])) {
      return code;
    }
  }
  
  // If we can't find it, default to LAX
  return 'LAX';
};

/**
 * Generate Google Flights URL with proper parameters
 */
export const generateGoogleFlightsUrl = (
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string,
  passengers: number = 1
): string => {
  const originCode = getAirportCode(origin || 'Los Angeles');
  const destCode = getAirportCode(destination);
  
  // Format dates for Google Flights (YYYY-MM-DD)
  const depart = departDate ? new Date(departDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnD = returnDate ? new Date(returnDate).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return `https://www.google.com/travel/flights?q=flights%20from%20${originCode}%20to%20${destCode}%20on%20${depart}%20returning%20${returnD}&curr=USD&tfs=CBwQARomEg10aG91c2FuZHNhbmRzGgoSCAwBn7gAAAAAAAAAAAESBQoDBZoA&hl=en`;
};

/**
 * Generate Skyscanner URL (more flexible)
 */
export const generateSkyscannerUrl = (
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string,
  passengers: number = 4
): string => {
  const originCode = getAirportCode(origin || 'Los Angeles');
  const destCode = getAirportCode(destination);
  
  const depart = departDate ? new Date(departDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnD = returnDate ? new Date(returnDate).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return `https://www.skyscanner.com/transport/flights/${originCode}/${destCode}/${depart}/?adults=${passengers}&children=0&cabinclass=economy&rtn=${returnD}`;
};

/**
 * Generate Airbnb search URL
 */
export const generateAirbnbUrl = (
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number = 4
): string => {
  const normalized = (destination || 'vacation').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const checkInDate = checkIn ? new Date(checkIn).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const checkOutDate = checkOut ? new Date(checkOut).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return `https://www.airbnb.com/s/${normalized}/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&query=${normalized}&checkin=${checkInDate}&checkout=${checkOutDate}&adults=${guests}`;
};

/**
 * Generate Booking.com search URL
 */
export const generateBookingComUrl = (
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number = 4
): string => {
  const checkInDate = checkIn ? new Date(checkIn).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const checkOutDate = checkOut ? new Date(checkOut).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return `https://www.booking.com/searchresults.html?ss=${destination}&checkin=${checkInDate}&checkout=${checkOutDate}&group_adults=${guests}&no_rooms=1`;
};

/**
 * Generate VRBO (Vacation Rental By Owner) URL
 */
export const generateVrboUrl = (
  destination: string,
  checkIn: string,
  checkOut: string
): string => {
  const normalized = (destination || 'vacation').toLowerCase().replace(/\s+/g, '%20');
  
  const checkInDate = checkIn ? new Date(checkIn).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const checkOutDate = checkOut ? new Date(checkOut).toISOString().split('T')[0] : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return `https://www.vrbo.com/search?destination=${normalized}&start_date=${checkInDate}&end_date=${checkOutDate}`;
};
