import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Lock, AlertCircle, Eye, Edit, Home } from 'lucide-react';
import Overview from './Overview';
import GuestList from './GuestList';
import BudgetTracker from './BudgetTracker';
import TodoList from './TodoList';
import VendorManagement from './VendorManagement';
import SeatingPlanner from './SeatingPlanner';
import CeremonyPlanning from './CeremonyPlanning';
import MusicPlanner from './MusicPlanner';
import BachelorDashboard from './BachelorDashboard';
import OutfitPlanner from './OutfitPlanner';
import VivahaSplit from './VivahaSplit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SharedDashboard() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');
  const [coupleName, setCoupleName] = useState('');
  const [activePage, setActivePage] = useState('overview');

  useEffect(() => {
    fetchSharedDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSharedDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sharing/access/${token}`);
      
      if (response.data.success) {
        setAccessLevel(response.data.accessLevel);
        setCoupleName(response.data.coupleName || 'Wedding');
        
        // Store shared access info in sessionStorage
        sessionStorage.setItem('sharedAccess', JSON.stringify({
          token,
          accessLevel: response.data.accessLevel,
          isShared: true,
        }));
        
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to access shared dashboard:', err);
      if (err.response?.status === 404) {
        setError('This share link is invalid or has been revoked.');
      } else if (err.response?.status === 403) {
        setError('This share link has expired.');
      } else {
        setError('Failed to load shared dashboard. Please check your link and try again.');
      }
      setLoading(false);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'guests':
        return <GuestList />;
      case 'budget':
        return <BudgetTracker />;
      case 'todos':
        return <TodoList />;
      case 'vendors':
        return <VendorManagement />;
      case 'seating':
        return <SeatingPlanner />;
      case 'ceremony':
        return <CeremonyPlanning />;
      case 'music':
        return <MusicPlanner />;
      case 'bachelor':
        return <BachelorDashboard />;
      case 'outfits':
        return <OutfitPlanner />;
      case 'split':
        return <VivahaSplit />;
      default:
        return <Overview />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading shared dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition mx-auto"
          >
            <Home className="w-5 h-5" />
            Go to Vivaha Home
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'guests', label: 'Guests', icon: '👥' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'split', label: 'Vivaha Split', icon: '💸' },
    { id: 'todos', label: 'To-Dos', icon: '✓' },
    { id: 'ceremony', label: 'Ceremony', icon: '💒' },
    { id: 'seating', label: 'Seating', icon: '🪑' },
    { id: 'vendors', label: 'Vendors', icon: '🤝' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'bachelor', label: 'Bachelor/ette', icon: '🎉' },
    { id: 'outfits', label: 'Outfits', icon: '👔' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Access Banner */}
      <div className={`${accessLevel === 'edit' ? 'bg-green-500' : 'bg-blue-500'} text-white py-3 px-4 shadow-md`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">{coupleName}'s Wedding Dashboard</h1>
              <p className="text-sm opacity-90">
                Shared with {accessLevel === 'edit' ? 'editing' : 'view-only'} access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {accessLevel === 'edit' ? (
              <>
                <Edit className="w-5 h-5" />
                <span className="text-sm font-medium">You can edit</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">View only</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activePage === item.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Read-only notice */}
        {accessLevel === 'view' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-900 font-medium">You're viewing in read-only mode</p>
              <p className="text-blue-700 text-sm">
                This dashboard has been shared with you for viewing only. You cannot make changes.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div>{renderPage()}</div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Powered by <span className="font-semibold text-pink-600">Vivaha</span> - Your Perfect Wedding Planner
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 text-pink-600 hover:text-pink-700 font-medium"
          >
            Create your own wedding dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
