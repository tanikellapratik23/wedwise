import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Archive, Trash2, Copy, Search, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface WorkspaceCard {
  _id: string;
  name: string;
  weddingDate: string;
  weddingType: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  lastActivity: string;
  progressMetrics?: {
    tasksCompleted: number;
    tasksTotal: number;
    vendorsBooked: number;
    budgetAllocated: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function WorkspaceLibrary() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    weddingDate: '',
    weddingType: 'secular',
    notes: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setWorkspaces(response.data.workspaces || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (workspaceId: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/api/workspaces/${workspaceId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setWorkspaces(workspaces.filter(w => w._id !== workspaceId));
      setMenuOpen(null);
    } catch (error) {
      console.error('Error archiving workspace:', error);
    }
  };

  const handleDuplicate = async (workspaceId: string, name: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const newName = `${name} (Copy)`;
      const response = await axios.post(
        `${API_URL}/api/workspaces/${workspaceId}/duplicate`,
        { newName },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setWorkspaces([response.data.workspace, ...workspaces]);
      setMenuOpen(null);
    } catch (error) {
      console.error('Error duplicating workspace:', error);
    }
  };

  const handleDelete = async (workspaceId: string) => {
    if (confirm('Are you sure you want to permanently delete this workspace? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await axios.delete(`${API_URL}/api/workspaces/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setWorkspaces(workspaces.filter(w => w._id !== workspaceId));
        setMenuOpen(null);
      } catch (error) {
        console.error('Error deleting workspace:', error);
      }
    }
  };

  const handleOpenRename = (workspaceId: string, currentName: string) => {
    setRenamingWorkspaceId(workspaceId);
    setRenameValue(currentName);
    setShowRenameModal(true);
    setMenuOpen(null);
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !renamingWorkspaceId) return;

    setRenaming(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/workspaces/${renamingWorkspaceId}/rename`,
        { newName: renameValue.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setWorkspaces(
        workspaces.map(w => 
          w._id === renamingWorkspaceId 
            ? { ...w, name: response.data.workspace.name }
            : w
        )
      );
      setShowRenameModal(false);
      setRenameValue('');
      setRenamingWorkspaceId(null);
    } catch (error) {
      console.error('Error renaming workspace:', error);
      alert('Failed to rename workspace');
    } finally {
      setRenaming(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!formData.name || !formData.weddingDate) {
      setCreateError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setCreateError('');
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔍 DEBUG: Token available:', !!token);
      console.log('🔍 DEBUG: API URL:', API_URL);
      console.log('🔍 DEBUG: Full endpoint:', `${API_URL}/api/workspaces`);
      
      if (!token) {
        setCreateError('Not authenticated. Please log in again.');
        setCreating(false);
        return;
      }

      console.log('📤 Sending workspace creation request...');

      const response = await axios.post(
        `${API_URL}/api/workspaces`,
        {
          name: formData.name,
          weddingDate: formData.weddingDate,
          weddingType: formData.weddingType,
          notes: formData.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 15000,
        }
      );

      console.log('✅ Workspace created:', response.data);
      const workspace = response.data.workspace || response.data;
      if (!workspace || !workspace._id) {
        throw new Error('No workspace ID in response');
      }

      setWorkspaces([workspace, ...workspaces]);
      setShowCreateModal(false);
      setFormData({ name: '', weddingDate: '', weddingType: 'secular', notes: '' });
      setCreateError('');
    } catch (error: any) {
      console.error('❌ Error creating workspace:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        code: error?.code,
        url: `${API_URL}/api/workspaces`,
      });
      
      if (error.code === 'ECONNABORTED') {
        setCreateError('Request timeout. Backend server may be down. Please try again.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        setCreateError(`Cannot reach backend: ${API_URL}. Server may be offline.`);
      } else if (error?.response?.status === 401) {
        setCreateError('Authentication failed. Please log in again.');
      } else if (error?.response?.status === 400) {
        setCreateError(error?.response?.data?.error || 'Invalid input. Please check your entries.');
      } else if (!error?.response) {
        setCreateError(`Network error: ${error.message || 'Cannot reach the server'}`);
      } else {
        setCreateError(error?.response?.data?.error || error?.message || 'Failed to create workspace');
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || workspace.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'completed':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getProgressPercentage = (metrics?: { tasksCompleted: number; tasksTotal: number }) => {
    if (!metrics || metrics.tasksTotal === 0) return 0;
    return Math.round((metrics.tasksCompleted / metrics.tasksTotal) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Weddings</h1>
              <p className="text-gray-600 mt-2">Manage and organize all your wedding planning projects</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create New Wedding
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search weddings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'planning', 'active', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-pink-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No workspaces found</p>
            <p className="text-gray-500 mb-6">Create your first workspace to get started</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => navigate(`/dashboard/workspace/${workspace._id}`)}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition cursor-pointer border border-gray-200 overflow-hidden hover:border-pink-300"
              >
                {/* Card Header with Status */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 relative">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition">
                        {workspace.name}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(workspace.status)}`}>
                          {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {workspace.weddingType.charAt(0).toUpperCase() + workspace.weddingType.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === workspace._id ? null : workspace._id);
                        }}
                        className="p-2 hover:bg-white rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {menuOpen === workspace._id && (
                        <div
                          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRename(workspace._id, workspace.name);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Copy className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(workspace._id, workspace.name);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-200"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(workspace._id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-200"
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(workspace._id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Wedding Date */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span className="font-medium">{formatDate(workspace.weddingDate)}</span>
                  </div>

                  {/* Progress Indicator */}
                  {workspace.progressMetrics && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1 text-gray-700">
                          <TrendingUp className="w-4 h-4 text-pink-500" />
                          <span className="text-sm font-medium">Progress</span>
                        </div>
                        <span className="text-sm font-bold text-pink-600">
                          {getProgressPercentage(workspace.progressMetrics)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-rose-600 h-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(workspace.progressMetrics)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {workspace.progressMetrics && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Tasks</p>
                        <p className="text-lg font-bold text-gray-900">
                          {workspace.progressMetrics.tasksCompleted}/{workspace.progressMetrics.tasksTotal}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Vendors</p>
                        <p className="text-lg font-bold text-gray-900">{workspace.progressMetrics.vendorsBooked}</p>
                      </div>
                    </div>
                  )}

                  {/* Last Activity */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Last activity: {formatDate(workspace.lastActivity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Wedding</h2>

              {createError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{createError}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wedding Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setCreateError('');
                    }}
                    placeholder="e.g., Sarah & John - June 2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wedding Date *
                  </label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => {
                      setFormData({ ...formData, weddingDate: e.target.value });
                      setCreateError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wedding Type (Optional)
                  </label>
                  <select
                    value={formData.weddingType}
                    onChange={(e) => setFormData({ ...formData, weddingType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  >
                    <option value="secular">Secular</option>
                    <option value="religious">Religious</option>
                    <option value="interfaith">Interfaith</option>
                    <option value="destination">Destination</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                    setFormData({ name: '', weddingDate: '', weddingType: 'secular', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Workspace Modal */}
        {showRenameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rename Wedding</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Name *
                  </label>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                    placeholder="Enter new name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameValue('');
                    setRenamingWorkspaceId(null);
                  }}
                  disabled={renaming}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={renaming || !renameValue.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {renaming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Renaming...
                    </>
                  ) : (
                    'Rename'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
