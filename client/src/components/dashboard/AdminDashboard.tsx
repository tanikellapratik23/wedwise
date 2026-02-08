import { useState, useEffect } from 'react';
import { Users, BarChart3, Calendar, TrendingUp, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AdminStats {
  totalUsers: number;
  completedOnboarding: number;
  pendingOnboarding: number;
  newUsersLast30Days: number;
  activeLogins: number;
  weddingsPlanned: number;
  venueSearches: number;
  usersByRole?: Array<{ _id: string; count: number }>;
}

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  type: string;
  onboardingCompleted: boolean;
  createdAt: string;
  weddingDate: string;
}

interface PaginationData {
  users: DashboardUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    completedOnboarding: 0,
    pendingOnboarding: 0,
    newUsersLast30Days: 0,
    activeLogins: 0,
    weddingsPlanned: 0,
    venueSearches: 0,
  });
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
    fetchUsers(1);
    
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchAdminStats();
      fetchUsers(currentPage);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminStats = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      console.log('📊 Fetching admin stats...');
      
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Admin stats response:', response.data);

      if (response.data.stats) {
        setStats(response.data.stats);
        setLastUpdated(new Date());
        console.log('✅ Admin stats loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error);
      setError(`Failed to fetch stats: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      console.log(`📋 Fetching users page ${page}...`);
      
      const response = await axios.get(`${API_URL}/api/admin/users?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Users response:', response.data);
      setPaginationData(response.data);
      setCurrentPage(page);
      console.log('✅ Users loaded successfully');
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      setError(`Failed to fetch users: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (paginationData?.pagination.hasPrevPage) {
      fetchUsers(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (paginationData?.pagination.hasNextPage) {
      fetchUsers(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
          <p className="font-semibold mb-2">⚠️ Error Loading Stats</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchAdminStats}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Analytics Dashboard</h1>
            <p className="text-slate-300">Monitor platform activity and user engagement</p>
            <p className="text-slate-400 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchAdminStats}
            disabled={loading}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Total Users</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-2">Registered accounts</p>
        </div>

        {/* Completed Onboarding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Completed Onboarding</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completedOnboarding}</p>
          <p className="text-xs text-gray-500 mt-2">Users who finished setup</p>
        </div>

        {/* New Users (30 days) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">New Users</h3>
            <Calendar className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.newUsersLast30Days}</p>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>

        {/* Weddings Planned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Weddings Planned</h3>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.weddingsPlanned}</p>
          <p className="text-xs text-gray-500 mt-2">Active wedding plans</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Real Users ({paginationData?.pagination.totalUsers || 0})
        </h2>

        {paginationData && paginationData.users.length > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              {paginationData.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{user.type}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${user.onboardingCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {user.onboardingCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    {user.weddingDate && user.weddingDate !== 'Not set' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Wedding: {user.weddingDate}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {paginationData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {paginationData.pagination.currentPage} of {paginationData.pagination.totalPages} 
                  {' • '}
                  Showing {((paginationData.pagination.currentPage - 1) * paginationData.pagination.usersPerPage) + 1}-{Math.min(paginationData.pagination.currentPage * paginationData.pagination.usersPerPage, paginationData.pagination.totalUsers)} of {paginationData.pagination.totalUsers}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!paginationData.pagination.hasPrevPage || usersLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!paginationData.pagination.hasNextPage || usersLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">{usersLoading ? 'Loading users...' : 'No users yet'}</p>
        )}
      </div>

      {/* Activity Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">📊 Platform Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Average Engagement Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.activeLogins > 0 ? Math.round((stats.activeLogins / stats.totalUsers) * 100) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Planning Success Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.weddingsPlanned / stats.totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Controls</h2>
        <button
          onClick={onLogout}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout from Admin Dashboard
        </button>
      </div>
    </div>
  );
}
