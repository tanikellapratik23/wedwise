import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Heart, Users, DollarSign, CheckSquare, Briefcase, LayoutGrid, LogOut, Search, Settings as SettingsIcon, Church, Music, PartyPopper, Sparkles, BookOpen, MoreHorizontal, Split, Hotel, FileText, Edit3, Save, X, Eye, EyeOff, GripVertical, MessageSquare, Share2, FolderOpen, Gift } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { downloadBackupFile, importBackupFile, downloadBackupAsDoc } from '../../utils/offlineBackup';
import { authStorage } from '../../utils/auth';
import { userDataStorage } from '../../utils/userDataStorage';
import { getThemeClasses } from '../../utils/themeColors';
import { syncUserData } from '../../utils/dataSync';
import { useApp } from '../../context/AppContext';
import axios from 'axios';
import Tutorial from '../Tutorial';
import SingleSourceOfTruth from './SingleSourceOfTruth';
import HotelBlock from './HotelBlock';
import AIAssistant from '../AIAssistant';
import PlannerDashboard from './PlannerDashboard';
import WorkspaceLibrary from '../workspace/WorkspaceLibrary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
import VivahaPost from './VivahaPost';
import WeddingInfoEditor from './WeddingInfoEditor';
import RegistryManager from './RegistryManager';
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
  workspaceId?: string;
  isPlanner?: boolean;
  setIsAuthenticated?: (value: boolean) => void;
}

export default function Dashboard({ isAdmin: propIsAdmin = false, workspaceId, isPlanner = false, setIsAuthenticated }: DashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { onboardingData } = useApp();
  
  // Route planners to their workspace dashboard
  if (isPlanner || location.pathname.includes('/planner')) {
    return <PlannerDashboard setIsAuthenticated={setIsAuthenticated || (() => {})} />;
  }
  const [isReligious, setIsReligious] = useState(onboardingData?.isReligious || false);
  const [isAdmin, setIsAdmin] = useState(propIsAdmin);
  const [wantsBachelorParty, setWantsBachelorParty] = useState(() => {
    return onboardingData?.wantsBachelorParty || localStorage.getItem('wantsBachelorParty') === 'true';
  });
  const [emailSent, setEmailSent] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isEditingNav, setIsEditingNav] = useState(false);
  const [customNavOrder, setCustomNavOrder] = useState<string[]>([]);
  const [hiddenNavItems, setHiddenNavItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>('view');
  const [shareEmail, setShareEmail] = useState('');
  const [shareLinkType, setShareLinkType] = useState<'anyone' | 'email'>('anyone');
  const [showSaveExitModal, setShowSaveExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);  
  const [preferredColorTheme, setPreferredColorTheme] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if user is admin from token
    const token = authStorage.getToken();
    const onboardingCompleted = sessionStorage.getItem('onboardingCompleted') === 'true';
    setHasCompletedOnboarding(onboardingCompleted);
    
    let userIsAdmin = propIsAdmin || false;
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        userIsAdmin = decoded.isAdmin || propIsAdmin || false;
        setIsAdmin(userIsAdmin);
      } catch (e) {
        setIsAdmin(propIsAdmin || false);
      }
    }
    
    // Skip onboarding check for admins
    if (!userIsAdmin && !onboardingCompleted) {
      // Non-admin without onboarding should not be here
      navigate('/onboarding', { replace: true });
      return;
    }
    
    if (!userIsAdmin) {
      fetchUserSettings();
      sendWelcomeEmail();
      loadNavigationPreferences();
      syncAllUserData();
    }

    // Set up page unload handler to save all data before leaving
    const handleBeforeUnload = () => {
      try {
        const token = authStorage.getToken();
        if (!token) return;

        // Save all cached data to localStorage (it will auto-sync on next load)
        console.log('💾 Page unloading - ensuring all data is saved to cache');
        const guests = userDataStorage.getData('guests');
        const budget = userDataStorage.getData('budget');
        const todos = userDataStorage.getData('todos');
        const onboarding = localStorage.getItem('onboarding');
        
        if (guests) console.log('✅ Guests cached before unload');
        if (budget) console.log('✅ Budget cached before unload');
        if (todos) console.log('✅ Todos cached before unload');
        if (onboarding) console.log('✅ Onboarding data cached before unload');
      } catch (e) {
        console.error('Error saving data before unload:', e);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [propIsAdmin, navigate]);

  const syncAllUserData = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;
      await syncUserData(token);
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  };

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
        setPreferredColorTheme(response.data.preferredColorTheme || '');
        setUserRole(response.data.role || null);
        localStorage.setItem('wantsBachelorParty', response.data.wantsBachelorParty ? 'true' : 'false');
        localStorage.setItem('preferredColorTheme', response.data.preferredColorTheme || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      const localWantsBachelor = localStorage.getItem('wantsBachelorParty') === 'true';
      const localTheme = localStorage.getItem('preferredColorTheme') || '';
      if (localWantsBachelor) {
        setWantsBachelorParty(true);
      }
      if (localTheme) {
        setPreferredColorTheme(localTheme);
      }
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Clear all user-specific data
    userDataStorage.clearUserData();
    
    // Clear authentication
    authStorage.clearAll();
    sessionStorage.clear();
    
    // Update authentication state
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    
    console.log('✅ Logged out - all user data cleared');
    
    // Navigate directly to landing without reload
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const loadNavigationPreferences = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/navigation/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.preferences) {
        setCustomNavOrder(response.data.preferences.order || []);
        setHiddenNavItems(response.data.preferences.hidden || []);
      }
    } catch (error) {
      console.error('Failed to load navigation preferences:', error);
    }
  };

  const saveNavigationPreferences = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      await axios.post(
        `${API_URL}/api/navigation/preferences`,
        {
          order: customNavOrder,
          hidden: hiddenNavItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsEditingNav(false);
    } catch (error) {
      console.error('Failed to save navigation preferences:', error);
      alert('Failed to save navigation preferences');
    }
  };

  const discardNavigationChanges = () => {
    loadNavigationPreferences();
    setIsEditingNav(false);
  };

  const generateShareLink = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/api/sharing/generate`,
        { accessLevel: shareAccess },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.shareToken) {
        const base = import.meta.env.BASE_URL || '/';
        const baseUrl = base === '/' ? '' : base.replace(/\/$/, '');
        const currentUrl = window.location.origin;
        const link = shareLinkType === 'anyone' 
          ? `${currentUrl}${baseUrl}/shared/${response.data.shareToken}`
          : `${currentUrl}${baseUrl}/shared/${response.data.shareToken}?email=${shareEmail}`;
        setShareLink(link);
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleNavItemVisibility = (itemName: string) => {
    if (hiddenNavItems.includes(itemName)) {
      setHiddenNavItems(hiddenNavItems.filter((name) => name !== itemName));
    } else {
      setHiddenNavItems([...hiddenNavItems, itemName]);
    }
  };

  const handleDragStart = (itemName: string) => {
    setDraggedItem(itemName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetItemName: string) => {
    if (!draggedItem || draggedItem === targetItemName) return;

    const currentOrder = customNavOrder.length > 0 ? customNavOrder : navigation.map((item) => item.name);
    const draggedIndex = currentOrder.indexOf(draggedItem);
    const targetIndex = currentOrder.indexOf(targetItemName);

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setCustomNavOrder(newOrder);
    setDraggedItem(null);
  };

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Wedding Info', path: '/dashboard/wedding-info', icon: Heart },
    { name: 'Guest List', path: '/dashboard/guests', icon: Users },
    { name: 'Budget', path: '/dashboard/budget', icon: DollarSign },
    { name: 'Vivaha Split', path: '/dashboard/split', icon: Split },
    { name: 'To-Dos', path: '/dashboard/todos', icon: CheckSquare },
    { name: 'Ceremony', path: '/dashboard/ceremony', icon: Church },
    { name: 'Sound & Music', path: '/dashboard/music', icon: Music },
    { name: 'Hotel Block', path: '/dashboard/hotel-block', icon: Hotel },
    { name: 'Vendor Search', path: '/dashboard/vendor-search', icon: Search },
    { name: 'My Vendors', path: '/dashboard/vendors', icon: Briefcase },
    { name: 'Registries', path: '/dashboard/registries', icon: Gift },
    { name: 'VivahaPost', path: '/dashboard/community', icon: MessageSquare },
    { name: 'Seating', path: '/dashboard/seating', icon: LayoutGrid },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
    ...(wantsBachelorParty ? [{ name: 'Bachelor / Bachelorette', path: '/dashboard/bachelor', icon: PartyPopper }] : []),
  ];

  const moreFeatures: typeof navigation = [
    // { name: 'Outfit Planner', path: '/dashboard/outfits', icon: Sparkles },
    // { name: 'Story Builder', path: '/dashboard/story', icon: BookOpen },
    // Hidden for now - code retained for future use
  ];

  return (
    <div className={`min-h-screen ${getThemeClasses(preferredColorTheme).bg} dark:from-gray-800 dark:via-gray-900 dark:to-black`}>
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
              {userRole === 'planner' && (
                <button
                  onClick={() => {
                    setShowSaveExitModal(true);
                    setPendingNavigation('/workspaces');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FolderOpen className="w-4 h-4" />
                  Workspace Library
                </button>
              )}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => navigate('/dashboard/single-source')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Share Wedding Info
              </button>
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

      {/* AI Assistant */}
      <AIAssistant />

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
                {/* Edit Button */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                  {!isEditingNav ? (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setIsEditingNav(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Nav
                      </button>
                      {hiddenNavItems.length > 0 && (
                        <button
                          onClick={async () => {
                            setHiddenNavItems([]);
                            try {
                              const token = authStorage.getToken();
                              if (!token) return;
                              await axios.post(`${API_URL}/api/navigation/preferences`, {
                                order: customNavOrder,
                                hidden: [],
                              }, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                            } catch (err) {
                              console.error('Failed to save navigation preferences:', err);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all"
                          title="Show all hidden items"
                        >
                          <Eye className="w-3 h-3" />
                          Show All
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={saveNavigationPreferences}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={discardNavigationChanges}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Discard
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Items */}
                {(() => {
                  const orderedNav = customNavOrder.length > 0
                    ? customNavOrder.map((name) => navigation.find((item) => item.name === name)).filter(Boolean)
                    : navigation;

                  return orderedNav.map((item: any) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const isHidden = hiddenNavItems.includes(item.name);

                    if (isHidden && !isEditingNav) return null;

                    return (
                      <div
                        key={item.path}
                        draggable={isEditingNav}
                        onDragStart={() => handleDragStart(item.name)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(item.name)}
                        className={`relative ${isEditingNav ? 'cursor-move' : ''} ${isHidden ? 'opacity-40' : ''}`}
                      >
                        {isEditingNav && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            if (isEditingNav) {
                              e.preventDefault();
                            }
                          }}
                          className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${
                            isEditingNav ? 'pl-8' : ''
                          } ${
                            isActive && !isEditingNav
                              ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md border border-primary-300'
                              : 'text-gray-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-pink-50 hover:text-primary-700 hover:shadow-sm'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1">{item.name}</span>
                          {isEditingNav && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleNavItemVisibility(item.name);
                              }}
                              className="p-1 hover:bg-white/20 rounded"
                            >
                              {isHidden ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </Link>
                      </div>
                    );
                  });
                })()}
              
              {/* More Features Dropdown - Only show if there are features */}
              {moreFeatures.length > 0 && (
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
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/workspaces" element={<WorkspaceLibrary />} />
                <Route path="/single-source" element={<SingleSourceOfTruth />} />
                <Route path="/hotel-block" element={<HotelBlock />} />
                <Route path="/guests" element={<GuestList />} />
                <Route path="/budget" element={<BudgetTracker />} />
                <Route path="/split" element={<VivahaSplit />} />
                <Route path="/wedding-info" element={<WeddingInfoEditor />} />
                <Route path="/todos" element={<TodoList />} />
                <Route path="/ceremony" element={<CeremonyPlanning />} />
                <Route path="/music" element={<MusicPlanner />} />
                <Route path="/vendor-search" element={<VendorSearch />} />
                <Route path="/vendors" element={<VendorManagement />} />
                <Route path="/registries" element={<RegistryManager />} />
                <Route path="/seating" element={<SeatingPlanner />} />
                <Route path="/community" element={<VivahaPost />} />
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Share Dashboard</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Share Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Share With</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShareLinkType('anyone')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shareLinkType === 'anyone'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Anyone with link</div>
                    <div className="text-xs text-gray-600 mt-1">No login required</div>
                  </button>
                  <button
                    onClick={() => setShareLinkType('email')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shareLinkType === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Specific User</div>
                    <div className="text-xs text-gray-600 mt-1">Must be logged in</div>
                  </button>
                </div>
              </div>

              {/* Email Input (if specific user) */}
              {shareLinkType === 'email' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User Email</label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Access Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShareAccess('view')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shareAccess === 'view'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-semibold text-gray-900">View Only</div>
                  </button>
                  <button
                    onClick={() => setShareAccess('edit')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shareAccess === 'edit'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Edit3 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="font-semibold text-gray-900">Can Edit</div>
                  </button>
                </div>
              </div>

              {/* Generate Link Button */}
              <button
                onClick={generateShareLink}
                disabled={shareLinkType === 'email' && !shareEmail}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Share Link
              </button>

              {/* Generated Link */}
              {shareLink && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {shareAccess === 'view' ? 'Recipients can view but not edit' : 'Recipients can view and edit'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      {/* Save & Exit Confirmation Modal */}
      {showSaveExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Save & Exit?</h2>
            <p className="text-gray-600 mb-6">Do you want to save and exit this workspace before switching?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveExitModal(false);
                  setPendingNavigation(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSaveExitModal(false);
                  if (pendingNavigation) {
                    navigate(pendingNavigation);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition"
              >
                Exit & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
