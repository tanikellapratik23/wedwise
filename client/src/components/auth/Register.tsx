import { useState, useRef, useEffect } from 'react';
import { importBackupFile } from '../../utils/offlineBackup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Mail, Lock, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RegisterProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Register({ setIsAuthenticated }: RegisterProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    let didFallback = false;
    const timer = window.setTimeout(() => {
      didFallback = true;
      setError('Server did not respond — continuing offline.');
      continueOffline();
      setLoading(false);
    }, 5000);

    try {
      console.log('Attempting registration with:', { name: formData.name, email: formData.email });
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }, { timeout: 30000 });

      if (didFallback) {
        clearTimeout(timer);
        return;
      }
      clearTimeout(timer);
      console.log('Registration successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      navigate('/onboarding');
    } catch (err: any) {
      clearTimeout(timer);
      if (didFallback) return;
      console.error('Registration error:', err.response?.data || err.message);
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        setError('Registration timed out — the server may be waking up. Try again in a few seconds.');
      } else if (err.response) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError('Unable to reach the server. Check your connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const continueOffline = () => {
    localStorage.setItem('offlineMode', 'true');
    localStorage.setItem('user', JSON.stringify({ name: formData.name, email: formData.email }));
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
      const base = import.meta.env.BASE_URL || '/';
      window.location.href = base.replace(/\/$/, '') + '/dashboard';
    } catch (err) {
      console.error('Import failed', err);
      setError('Failed to import backup file.');
    }
  };

  useEffect(() => {
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs text-gray-500 mb-1">Or restore a local backup</label>
              <input ref={fileRef} onChange={handleUpload} accept="application/json" type="file" className="text-sm" />
            </div>

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
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Create a password"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  minLength={6}
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
                  <span>Creating account... (may take 30s on first load)</span>
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
