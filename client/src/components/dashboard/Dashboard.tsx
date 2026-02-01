import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Users, DollarSign, CheckSquare, Briefcase, LayoutGrid, LogOut, Search, Settings as SettingsIcon, Church, Music, PartyPopper } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { downloadBackupFile, importBackupFile, downloadBackupAsDoc } from '../../utils/offlineBackup';
import axios from 'axios';
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
    <button onClick={toggle} className={`px-3 py-2 text-sm rounded-md ${enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      Auto-save: {enabled ? 'On' : 'Off'}
    </button>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReligious, setIsReligious] = useState(false);
  const [wantsBachelorParty, setWantsBachelorParty] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setIsReligious(response.data.isReligious || false);
        setWantsBachelorParty(response.data.wantsBachelorParty || false);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('guests');
    localStorage.removeItem('todos');
    localStorage.removeItem('budget');
    localStorage.removeItem('favoriteVendors');
    localStorage.removeItem('ceremonies');
    localStorage.removeItem('playlists');
    localStorage.removeItem('seatingCharts');
    navigate('/login');
  };

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Guest List', path: '/dashboard/guests', icon: Users },
    { name: 'Budget', path: '/dashboard/budget', icon: DollarSign },
    { name: 'To-Dos', path: '/dashboard/todos', icon: CheckSquare },
    { name: 'Ceremony', path: '/dashboard/ceremony', icon: Church },
    { name: 'Sound & Music', path: '/dashboard/music', icon: Music },
    { name: 'Vendor Search', path: '/dashboard/vendor-search', icon: Search },
    { name: 'My Vendors', path: '/dashboard/vendors', icon: Briefcase },
    { name: 'Seating', path: '/dashboard/seating', icon: LayoutGrid },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
    ...(wantsBachelorParty ? [{ name: 'Bachelor / Bachelorette', path: '/dashboard/bachelor', icon: PartyPopper }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vivaha</h1>
                <p className="text-sm text-gray-500">Your Wedding Planner</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => downloadBackupAsDoc()}
                className="px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
              >
                Download Backup (Word)
              </button>
              <AutoSaveToggle />
              <input
                type="file"
                accept="application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    await importBackupFile(f);
                    window.location.reload();
                  } catch (err) {
                    console.error('Import failed', err);
                    alert('Failed to import backup file');
                  }
                }}
                className="text-sm"
              />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/guests" element={<GuestList />} />
                <Route path="/budget" element={<BudgetTracker />} />
                <Route path="/todos" element={<TodoList />} />
                <Route path="/ceremony" element={<CeremonyPlanning />} />
                <Route path="/music" element={<MusicPlanner />} />
                <Route path="/vendor-search" element={<VendorSearch />} />
                <Route path="/vendors" element={<VendorManagement />} />
                <Route path="/seating" element={<SeatingPlanner />} />
                <Route path="/settings" element={<Settings />} />
                {wantsBachelorParty && <Route path="/bachelor" element={<BachelorDashboard />} />}
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
