import { useState, useRef, useEffect } from 'react';
import { importBackupFile } from '../../utils/offlineBackup';
import { authStorage } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent, retryCount: number = 0) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Wait up to 8 seconds for the API to respond
    let didFallback = false;
    const timer = window.setTimeout(() => {
      didFallback = true;
      setError('Server did not respond. Please try again.');
      setLoading(false);
    }, 8000);

    try {
      console.log(`Attempting login with: ${formData.email}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, { timeout: 30000 });
      if (didFallback) {
        // already timed out, ignore late response
        clearTimeout(timer);
        return;
      }
      clearTimeout(timer);
      console.log('Login successful:', response.data);
      authStorage.setToken(response.data.token, keepSignedIn);
      authStorage.setUser(response.data.user);
      
      // Always mark onboarding as complete for authenticated users
      sessionStorage.setItem('onboardingCompleted', 'true');
      
      setIsAuthenticated(true);

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        // Check if admin - go directly to dashboard
        if (response.data.user.isAdmin) {
          console.log('✅ Admin user detected, going to dashboard');
          navigate('/dashboard');
        } else {
          // For ALL returning users (anyone who successfully logs in), show welcome back
          console.log('✅ Returning user, showing welcome back');
          navigate('/welcome-back');
        }
      }, 100);
    } catch (err: any) {
      clearTimeout(timer);
      if (didFallback) return;
      console.error('Login error:', err.response?.data || err.message);
      
      // Auto-retry once on connection errors (don't retry on auth errors)
      if (retryCount === 0 && (!err.response || err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout'))) {
        console.log('⚠️ Connection error, retrying login...');
        setError('Connection unstable, retrying...');
        setLoading(false);
        // Wait 1 second before retrying
        setTimeout(() => {
          handleSubmit(e, 1);
        }, 1000);
        return;
      }
      
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        setError('Connection timeout. The server may be starting up. Please try again.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 404) {
        setError('Account not found. Please check your email or sign up first.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError('Login failed. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const continueOffline = () => {
    // Remove offline mode - users should NOT skip login
    // This ensures users are always prompted to authenticate
    navigate('/login');
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
  // Background carousel for auth pages: alternate two hero images every 10s
  const base = import.meta.env.BASE_URL || '/';
  // Use the requested romantic couple hero as the primary background for auth pages
  const authBgImages = [
    `${base}hero-images/young-wedding-couple-enjoying-romantic-moments.jpg`,
  ];
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    // preload
    authBgImages.forEach((s) => { const i = new Image(); i.src = s; });
    // Single static background - no interval needed
    return () => {};
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundImage: `url(${authBgImages[bgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-left mb-4">
            <button onClick={() => navigate('/')} className="text-lg text-white font-medium hover:underline">← Back to Home</button>
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 text-white p-4 rounded-full">
              <Heart className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Vivaha</h1>
          <p className="text-white font-medium">Plan your wedding like a pro</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setError('')}
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Try again
                  </button>
                </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 text-primary-500 border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  Forgot password?
                </button>
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
