import { useState, useRef, useEffect } from 'react';
import { importBackupFile } from '../../utils/offlineBackup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Mail, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Login({ setIsAuthenticated }: LoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Wait up to 5 seconds for the API; if it doesn't respond, automatically
    // fallback to offline mode and continue to onboarding.
    let didFallback = false;
    const timer = window.setTimeout(() => {
      didFallback = true;
      setError('Server did not respond — continuing offline.');
      continueOffline();
      setLoading(false);
    }, 5000);

    try {
      console.log('Attempting login with:', formData.email);
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, { timeout: 30000 });
      if (didFallback) {
        // already continued offline, ignore late response
        clearTimeout(timer);
        return;
      }
      clearTimeout(timer);
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);

      // Check if onboarding is completed
      if (response.data.user.onboardingCompleted) {
        localStorage.setItem('onboardingCompleted', 'true');
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      clearTimeout(timer);
      if (didFallback) return;
      console.error('Login error:', err.response?.data || err.message);
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        setError('Login timed out — the server may be waking up. Try again in a few seconds.');
      } else if (err.response) {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } else {
        setError('Unable to reach the server. Check your connection or try again later.');
      }
      // Leave an option for the user to continue without the API
    } finally {
      setLoading(false);
    }
  };

  const continueOffline = () => {
    // mark offline mode and store minimal user info so onboarding/dashboard can proceed
    localStorage.setItem('offlineMode', 'true');
    localStorage.setItem('user', JSON.stringify({ email: formData.email }));
    // mark not fully onboarded so user goes through onboarding
    localStorage.setItem('onboardingCompleted', 'false');
    setIsAuthenticated(true);
    navigate('/onboarding');
  };

  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackupFile(file);
      // ensure app reads restored data
      const base = import.meta.env.BASE_URL || '/';
      window.location.href = base.replace(/\/$/, '') + '/dashboard';
    } catch (err) {
      console.error('Import failed', err);
      setError('Failed to import backup file.');
    }
  };

  useEffect(() => {
    // clear file input value on mount
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 text-white p-4 rounded-full">
              <Heart className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vivaha</h1>
          <p className="text-gray-600">Plan your wedding like a pro</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {error && (
              <div className="mt-2 text-center">
                <button
                  onClick={continueOffline}
                  type="button"
                  className="text-sm text-primary-500 hover:underline"
                >
                  Continue without API (use app locally)
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-gray-500 mb-1">Or restore a local backup</label>
              <input ref={fileRef} onChange={handleUpload} accept="application/json" type="file" className="text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in... (may take 30s on first load)</span>
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
