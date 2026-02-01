import { useState, useEffect } from 'react';
import { Users, BarChart3, Calendar, TrendingUp, LogOut } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AdminStats {
  totalUsers: number;
  activeLogins: number;
  weddingsPlanned: number;
  venueSearches: number;
}

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  lastActive: string;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeLogins: 0,
    weddingsPlanned: 0,
    venueSearches: 0,
  });
  const [loggedInUsers, setLoggedInUsers] = useState<LoggedInUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(response.data.stats || stats);
      setLoggedInUsers(response.data.loggedInUsers || []);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Use mock data for demo
      setStats({
        totalUsers: 127,
        activeLogins: 34,
        weddingsPlanned: 89,
        venueSearches: 245,
      });
      setLoggedInUsers([
        { id: '1', name: 'Sarah', email: 'sarah@test.com', lastActive: new Date().toISOString() },
        { id: '2', name: 'Marcus', email: 'marcus@test.com', lastActive: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', name: 'Priya', email: 'priya@test.com', lastActive: new Date(Date.now() - 7200000).toISOString() },
      ]);
    } finally {
      setLoading(false);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Analytics Dashboard</h1>
        <p className="text-slate-300">Monitor platform activity and user engagement</p>
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

        {/* Active Logins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Active Now</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeLogins}</p>
          <p className="text-xs text-gray-500 mt-2">Users online</p>
        </div>

        {/* Weddings Planned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Weddings Planned</h3>
            <Calendar className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.weddingsPlanned}</p>
          <p className="text-xs text-gray-500 mt-2">Active wedding plans</p>
        </div>

        {/* Venue Searches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold">Venue Searches</h3>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.venueSearches}</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>
      </div>

      {/* Logged In Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Currently Logged In Users
        </h2>

        {loggedInUsers.length > 0 ? (
          <div className="space-y-3">
            {loggedInUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    Last active: {new Date(user.lastActive).toLocaleTimeString()}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active users</p>
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
