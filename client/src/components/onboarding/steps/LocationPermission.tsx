import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

interface LocationPermissionProps {
  onLocationDetected: (city: string, state: string, country: string) => void;
  onSkip: () => void;
}

export default function LocationPermission({ onLocationDetected, onSkip }: LocationPermissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestLocation = async () => {
    console.log('Location request started');
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Got position:', position.coords);
          // Use reverse geocoding to get city from coordinates
          const { latitude, longitude } = position.coords;
          
          // Using OpenStreetMap Nominatim API (free, no API key needed)
          console.log('Fetching location from Nominatim...');
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Vivaha Wedding Planner'
              }
            }
          );
          
          const data = await response.json();
          console.log('Nominatim response:', data);
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            const country = data.address.country || 'United States';
            
            console.log('Detected location:', { city, state, country });
            onLocationDetected(city, state, country);
          } else {
            setError('Could not determine your location');
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setError('Failed to get location details');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === 1) {
          setError('Location permission denied. Please enter your city manually.');
        } else if (err.code === 2) {
          setError('Location unavailable. Please enter your city manually.');
        } else {
          setError('Timeout getting location. Please enter your city manually.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Detect Your Location</h3>
          <p className="text-sm text-gray-600">Find local vendors and get accurate pricing</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={requestLocation}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              Use My Location
            </>
          )}
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Skip
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        We'll use your location to show nearby vendors and accurate local pricing. 
        Your location is never shared with vendors without your permission.
      </p>
    </div>
  );
}
