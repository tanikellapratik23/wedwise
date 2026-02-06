import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Heart, Users, DollarSign, CheckSquare, Briefcase, LayoutGrid, LogOut, Search, Settings as SettingsIcon, Church, Music, PartyPopper, Sparkles, BookOpen, MoreHorizontal, Split } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { downloadBackupFile, importBackupFile, downloadBackupAsDoc } from '../../utils/offlineBackup';
import { authStorage } from '../../utils/auth';
import axios from 'axios';
import Tutorial from '../Tutorial';
import Overview from './Overview';
import GuestList from './GuestList';
import BudgetTracker from './BudgetTracker';
import TodoList from './TodoList';
import VendorManagement from './VendorManagement';
import VendorSearch from './VendorSearch';
import SeatingPlanner from './SeatingPlanner';
import Settings from './Settings';
import CeremonyPlanning from './CeremonyPlanning';
import MusicPlanner from './MusicPlanner';
import BachelorDashboard from './BachelorDashboard';
import OutfitPlanner from './OutfitPlanner';
import PostWeddingStory from './PostWeddingStory';
import VivahaSplit from './VivahaSplit';
import AdminDashboard from './AdminDashboard';
import { setAutoSaveEnabled, isAutoSaveEnabled } from '../../utils/autosave';
import { ErrorBoundary } from '../ErrorBoundary';

function AutoSaveToggle() {
  const [enabled, setEnabled] = useState<boolean>(isAutoSaveEnabled());
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAutoSaveEnabled(next);
  };
  return (
    <button onClick={toggle} className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${enabled ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      Auto-save: {enabled ? 'On' : 'Off'}
    </button>
  );
}

interface DashboardProps {
  isAdmin?: boolean;
}

export default function Dashboard({ isAdmin: propIsAdmin = false }: DashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReligious, setIsReligious] = useState(false);
  const [isAdmin, setIsAdmin] = useState(propIsAdmin);
  const [wantsBachelorParty, setWantsBachelorParty] = useState(() => {
    return localStorage.getItem('wantsBachelorParty') === 'true';
  });
  const [emailSent, setEmailSent] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if user is admin from token
    const token = authStorage.getToken();
    const onboardingCompleted = sessionStorage.getItem('onboardingCompleted') === 'true';
    setHasCompletedOnboarding(onboardingCompleted);
    
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decoded.isAdmin || propIsAdmin || false);
      } catch (e) {
        setIsAdmin(propIsAdmin || false);
      }
    }
    
    if (!isAdmin && !onboardingCompleted) {
      // Non-admin without onboarding should not be here
      navigate('/onboarding', { replace: true });
    }
    
    if (!isAdmin) {
      fetchUserSettings();
      sendWelcomeEmail();
    }
  }, [isAdmin, propIsAdmin, navigate]);

  const sendWelcomeEmail = async () => {
    try {
      const token = authStorage.getToken();
      const hasEmailBeenSent = sessionStorage.getItem('welcomeEmailSent');
      if (hasEmailBeenSent || emailSent) return;

      await axios.post('/api/send-welcome-email', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      sessionStorage.setItem('welcomeEmailSent', 'true');
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;
      
      const response = await axios.get('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      if (response.data) {
        setIsReligious(response.data.isReligious || false);
        setWantsBachelorParty(response.data.wantsBachelorParty || false);
        localStorage.setItem('wantsBachelorParty', response.data.wantsBachelorParty ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      const localWantsBachelor = localStorage.getItem('wantsBachelorParty') === 'true';
      if (localWantsBachelor) {
        setWantsBachelorParty(true);
      }
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Clear all stored data using authStorage helper
    authStorage.clearAll();
    sessionStorage.clear();
    // Also clear other app data from localStorage
    localStorage.removeItem('guests');
    localStorage.removeItem('todos');
    localStorage.removeItem('budget');
    localStorage.removeItem('favoriteVendors');
    localStorage.removeItem('ceremonies');
    localStorage.removeItem('playlists');
    localStorage.removeItem('seatingCharts');
    localStorage.removeItem('wantsBachelorParty');
    localStorage.removeItem('onboarding');
    localStorage.removeItem('ceremony');
    localStorage.removeItem('isNewUser');
    // Navigate and reload to ensure App component re-evaluates auth state
    navigate('/', { replace: true });
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Guest List', path: '/dashboard/guests', icon: Users },
    { name: 'Budget', path: '/dashboard/budget', icon: DollarSign },
    { name: 'Vivaha Split', path: '/dashboard/split', icon: Split },
    { name: 'To-Dos', path: '/dashboard/todos', icon: CheckSquare },
    { name: 'Ceremony', path: '/dashboard/ceremony', icon: Church },
    { name: 'Sound & Music', path: '/dashboard/music', icon: Music },
    { name: 'Vendor Search', path: '/dashboard/vendor-search', icon: Search },
    { name: 'My Vendors', path: '/dashboard/vendors', icon: Briefcase },
    { name: 'Seating', path: '/dashboard/seating', icon: LayoutGrid },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
    ...(wantsBachelorParty ? [{ name: 'Bachelor / Bachelorette', path: '/dashboard/bachelor', icon: PartyPopper }] : []),
  ];

  const moreFeatures = [
    { name: 'Outfit Planner', path: '/dashboard/outfits', icon: Sparkles },
    { name: 'Story Builder', path: '/dashboard/story', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-pink-500 text-white p-2.5 rounded-xl shadow-md">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">Vivaha</h1>
                <p className="text-sm text-gray-600 font-medium">Your Wedding Planner</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                Tutorial
              </button>
              <AutoSaveToggle />
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-all font-medium shadow-sm border border-gray-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-sm mx-auto border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Logout</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Are you sure you want to logout? You will be redirected to the home page.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-md"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Dashboard - Show only for admins */}
        {isAdmin && (
          <AdminDashboard onLogout={handleLogoutClick} />
        )}

        {/* Regular Dashboard - Show only for regular users */}
        {!isAdmin && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white backdrop-blur-md rounded-2xl shadow-lg p-4 space-y-1 border border-gray-200">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md border border-primary-300'
                        : 'text-gray-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-700 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* More Features Dropdown */}
              <div className="relative mt-2">
                <button
                  ref={moreButtonRef}
                  onClick={() => setShowMoreFeatures(!showMoreFeatures)}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-gray-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-700 hover:shadow-sm transition-all font-semibold"
                >
                  <MoreHorizontal className="w-5 h-5" />
                  <span>More features</span>
                </button>
                
                {showMoreFeatures && (
                  <>
                    {/* Click outside to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMoreFeatures(false)}
                    />
                    {/* Dropdown menu */}
                    <div className="absolute left-0 mt-2 w-full bg-white backdrop-blur-md rounded-xl shadow-xl z-50 border border-gray-200 overflow-hidden">
                      {moreFeatures.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowMoreFeatures(false)}
                            className={`flex items-center space-x-3 px-4 py-3.5 transition-all block w-full text-left font-semibold ${
                              isActive
                                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                                : 'text-gray-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/guests" element={<GuestList />} />
                <Route path="/budget" element={<BudgetTracker />} />
                <Route path="/split" element={<VivahaSplit />} />
                <Route path="/todos" element={<TodoList />} />
                <Route path="/ceremony" element={<CeremonyPlanning />} />
                <Route path="/music" element={<MusicPlanner />} />
                <Route path="/vendor-search" element={<VendorSearch />} />
                <Route path="/vendors" element={<VendorManagement />} />
                <Route path="/seating" element={<SeatingPlanner />} />
                <Route path="/outfits" element={<OutfitPlanner />} />
                <Route path="/story" element={<PostWeddingStory />} />
                <Route path="/settings" element={<Settings />} />
                {wantsBachelorParty && <Route path="/bachelor" element={<BachelorDashboard />} />}
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
        )}
      </div>

      {/* Tutorial Modal */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
