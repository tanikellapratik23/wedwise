import { useState, useRef, useEffect } from 'react';
import { isAutoSaveEnabled, setWithTTL } from '../../utils/autosave';
import { userDataStorage } from '../../utils/userDataStorage';
import { Plus, Search, Filter, Mail, Phone, Check, X, Upload, Download, Share2, Save, BarChart3, Users, TrendingUp, Grid, List as ListIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Guest {
  _id?: string;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  mealPreference?: string;
  plusOne: boolean;
  group?: string;
}

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytics'>('list');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: '',
    email: '',
    phone: '',
    rsvpStatus: 'pending',
    mealPreference: '',
    plusOne: false,
    group: '',
  });

  // Initialize on mount and set up unload handler
  useEffect(() => {
    // Load from user-specific localStorage immediately for instant display
    try {
      const cached = userDataStorage.getData('guests');
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setGuests(cached);
      }
    } catch (e) {
      console.error('Failed to load cached guests:', e);
    }
    
    fetchGuests();

    // Save guests before page unload - only set up once on mount
    const handleBeforeUnload = () => {
      try {
        // Get latest guests from storage
        const guestData = userDataStorage.getData('guests') || [];
        if (Array.isArray(guestData) && guestData.length > 0) {
          userDataStorage.setData('guests', guestData);
          console.log('✅ Guests saved before unload');
        }
      } catch (e) {
        console.error('Failed to save guests before unload:', e);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Only run on mount

  // Save to user-specific localStorage immediately whenever guests change
  useEffect(() => {
    if (guests.length > 0) {
      try {
        userDataStorage.setData('guests', guests);
        if (isAutoSaveEnabled()) {
          setWithTTL('guests', guests, 24 * 60 * 60 * 1000);
        }
      } catch (e) {
        console.error('Failed to save guests:', e);
      }
    }
  }, [guests]);

  const fetchGuests = async () => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        console.log('📴 Offline mode - loading guests from cache');
        const cached = userDataStorage.getData('guests');
        if (cached) setGuests(JSON.parse(cached));
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found - using cached guests');
        const cached = userDataStorage.getData('guests');
        if (cached) setGuests(JSON.parse(cached));
        return;
      }

      const response = await axios.get(`${API_URL}/api/guests`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      
      if (response.data.success) {
        console.log('✅ Fetched', response.data.data.length, 'guests from server');
        setGuests(response.data.data);
        // Update user-specific localStorage with server data
        userDataStorage.setData('guests', response.data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch guests from server:', error);
      // fallback to local cache
      const cached = userDataStorage.getData('guests');
      if (cached) {
        console.log('📦 Using cached guests');
        setGuests(JSON.parse(cached));
      }
    }
  };

  const addGuest = async () => {
    if (!newGuest.name) {
      alert('Please enter guest name');
      return;
    }
    
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      const token = localStorage.getItem('token');

      // Online mode - save to server
      if (!offlineMode && token) {
        try {
          const response = await axios.post(`${API_URL}/api/guests`, newGuest, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          
          if (response.data.success) {
            const updatedGuests = [...guests, response.data.data];
            setGuests(updatedGuests);
            userDataStorage.setData('guests', updatedGuests);
            console.log('✅ Guest added and saved to server');
            setShowAddModal(false);
            setNewGuest({
              name: '',
              email: '',
              phone: '',
              rsvpStatus: 'pending',
              mealPreference: '',
              plusOne: false,
              group: '',
            });
            return;
          }
        } catch (error) {
          console.error('❌ Failed to save to server, saving locally:', error);
        }
      }

      // Offline mode or server failed - save locally
      const guest = {
        id: `local-${Date.now()}`,
        name: newGuest.name || '',
        email: newGuest.email || '',
        phone: newGuest.phone || '',
        rsvpStatus: (newGuest.rsvpStatus as any) || 'pending',
        mealPreference: newGuest.mealPreference || '',
        plusOne: !!newGuest.plusOne,
        group: newGuest.group || '',
      } as Guest;
      
      const next = [...guests, guest];
      setGuests(next);
      userDataStorage.setData('guests', next);
      console.log('💾 Guest saved locally');
      
      setShowAddModal(false);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        rsvpStatus: 'pending',
        mealPreference: '',
        plusOne: false,
        group: '',
      });
    } catch (error) {
      console.error('Failed to add guest:', error);
      alert('Failed to add guest');
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (id: string) => {
    if (!confirm('Delete this guest?')) return;
    
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const next = (Array.isArray(guests) ? guests : []).filter(g => g.id !== id && g._id !== id);
        setGuests(next);
        userDataStorage.setData('guests', next);
        return;
      }

      const token = localStorage.getItem('token');
      const guest = (Array.isArray(guests) ? guests : []).find(g => g.id === id || g._id === id);
      const guestId = guest?._id || id;

      await axios.delete(`${API_URL}/api/guests/${guestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGuests((Array.isArray(guests) ? guests : []).filter(g => g.id !== id && g._id !== id));
    } catch (error) {
      console.error('Failed to delete guest:', error);
      alert('Failed to delete guest');
    }
  };

  const updateGuestRSVP = async (id: string, status: 'pending' | 'accepted' | 'declined') => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const guestArray = Array.isArray(guests) ? guests : [];
        const next = guestArray.map(g => (g.id === id || g._id === id) ? { ...g, rsvpStatus: status } : g);
        setGuests(next);
        userDataStorage.setData('guests', next);
        return;
      }

      const token = localStorage.getItem('token');
      const guest = (Array.isArray(guests) ? guests : []).find(g => g.id === id || g._id === id);
      const guestId = guest?._id || id;

      const response = await axios.put(`${API_URL}/api/guests/${guestId}`, {
        rsvpStatus: status,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const guestArray = Array.isArray(guests) ? guests : [];
        setGuests(guestArray.map(g => 
          (g.id === id || g._id === id) ? { ...g, rsvpStatus: status } : g
        ));
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  const saveGuests = async () => {
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      
      if (offlineMode) {
        userDataStorage.setData('guests', guests);
        alert('Guest list saved locally');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Save each guest individually
      for (const guest of guests) {
        if (guest._id) {
          // Update existing guest
          await axios.put(`${API_URL}/api/guests/${guest._id}`, guest, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (guest.id && !guest.id.startsWith('local-')) {
          // Create new guest if not local
          await axios.post(`${API_URL}/api/guests`, guest, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      
      alert('Guest list saved successfully!');
    } catch (error) {
      console.error('Failed to save guests:', error);
      alert('Failed to save guest list. Check console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to Guest format
        const importedGuests: Guest[] = jsonData.map((row: any, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: row.Name || row.name || row.NAME || `Guest ${index + 1}`,
          email: row.Email || row.email || row.EMAIL || '',
          phone: row.Phone || row.phone || row.PHONE || row['Phone Number'] || '',
          rsvpStatus: 'pending' as const,
          mealPreference: row['Meal Preference'] || row.meal || row.MEAL || '',
          plusOne: row['Plus One'] === 'Yes' || row['Plus One'] === 'yes' || row.plusOne === true || false,
          group: row.Group || row.group || row.GROUP || row.Category || '',
        }));

        setGuests([...guests, ...importedGuests]);
        alert(`Successfully imported ${importedGuests.length} guests!`);
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Error importing file. Please make sure it has columns: Name, Email, Phone, Group');
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportToExcel = () => {
    const exportData = guests.map(g => ({
      Name: g.name,
      Email: g.email || '',
      Phone: g.phone || '',
      'RSVP Status': g.rsvpStatus,
      'Meal Preference': g.mealPreference || '',
      'Plus One': g.plusOne ? 'Yes' : 'No',
      Group: g.group || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
    XLSX.writeFile(workbook, 'wedding-guest-list.xlsx');
  };

  const filteredGuests = (Array.isArray(guests) ? guests : []).filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || guest.rsvpStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: (Array.isArray(guests) ? guests : []).length,
    accepted: (Array.isArray(guests) ? guests : []).filter((g) => g.rsvpStatus === 'accepted').length,
    pending: (Array.isArray(guests) ? guests : []).filter((g) => g.rsvpStatus === 'pending').length,
    declined: (Array.isArray(guests) ? guests : []).filter((g) => g.rsvpStatus === 'declined').length,
  };

  const getRsvpStatusColor = (status: string) => {
    const colors = {
      accepted: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      declined: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getRsvpStatusIcon = (status: string) => {
    if (status === 'accepted') return <Check className="w-4 h-4" />;
    if (status === 'declined') return <X className="w-4 h-4" />;
    return <span className="w-4 h-4">?</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Guest List</h1>
          <p className="text-gray-100 mt-1 drop-shadow-md">Manage your wedding guests and RSVPs</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-white/20 backdrop-blur rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded transition ${viewMode === 'list' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded transition ${viewMode === 'grid' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-2 rounded transition ${viewMode === 'analytics' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={saveGuests}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>Save</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Guest</span>
          </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Total Guests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Accepted</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">Declined</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.declined}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guest List - List View */}
      {viewMode === 'list' && (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RSVP Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plus One
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-primary-100 text-primary-600 w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                      {guest.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      {guest.mealPreference && (
                        <div className="text-xs text-gray-500">{guest.mealPreference}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {guest.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {guest.email}
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {guest.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => updateGuestRSVP(guest._id || guest.id, 'accepted')}
                      className={`px-2 py-1 rounded text-xs ${
                        guest.rsvpStatus === 'accepted' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => updateGuestRSVP(guest._id || guest.id, 'pending')}
                      className={`px-2 py-1 rounded text-xs ${
                        guest.rsvpStatus === 'pending' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                      }`}
                    >
                      ?
                    </button>
                    <button
                      onClick={() => updateGuestRSVP(guest._id || guest.id, 'declined')}
                      className={`px-2 py-1 rounded text-xs ${
                        guest.rsvpStatus === 'declined' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                      }`}
                    >
                      ✗
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{guest.group || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{guest.plusOne ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-primary-600 hover:text-primary-800 font-medium mr-3">Edit</button>
                  <button 
                    onClick={() => deleteGuest(guest.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Guest List - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <div key={guest.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{guest.name}</h3>
                  {guest.group && <p className="text-xs text-gray-600 mt-1">Group: {guest.group}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRsvpStatusColor(guest.rsvpStatus)}`}>
                  {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {guest.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${guest.email}`} className="hover:text-primary-600 truncate">
                      {guest.email}
                    </a>
                  </div>
                )}
                {guest.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${guest.phone}`} className="hover:text-primary-600">
                      {guest.phone}
                    </a>
                  </div>
                )}
              </div>
              {guest.mealPreference && (
                <p className="text-xs text-gray-600 mb-3">Meal: {guest.mealPreference}</p>
              )}
              {guest.plusOne && (
                <p className="text-xs text-blue-600 font-medium mb-3">+ 1 Guest</p>
              )}
              <div className="flex gap-2 pt-3 border-t">
                <button className="flex-1 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition">
                  Edit
                </button>
                <button
                  onClick={() => deleteGuest(guest.id)}
                  className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No guests found</p>
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RSVP Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              RSVP Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Accepted', value: stats.accepted, fill: '#10b981' },
                    { name: 'Pending', value: stats.pending, fill: '#f59e0b' },
                    { name: 'Declined', value: stats.declined, fill: '#ef4444' },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[{ fill: '#10b981' }, { fill: '#f59e0b' }, { fill: '#ef4444' }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Rate Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Response Rate
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Acceptance Rate</span>
                  <span className="text-sm font-bold text-primary-500">{stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                  <p className="text-xs text-gray-600 mt-1">Accepted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-600 mt-1">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
                  <p className="text-xs text-gray-600 mt-1">Declined</p>
                </div>
              </div>
            </div>
          </div>

          {/* Group Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Group Summary</h3>
            <div className="space-y-2">
              {(() => {
                const groups = new Map<string, number>();
                guests.forEach(g => {
                  const grp = g.group || 'Ungrouped';
                  groups.set(grp, (groups.get(grp) || 0) + 1);
                });
                return Array.from(groups.entries()).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{group}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold">
                      {count}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Plus Ones Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Plus Ones Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">With Plus Ones</span>
                <span className="font-bold text-gray-900">{guests.filter(g => g.plusOne).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Without Plus Ones</span>
                <span className="font-bold text-gray-900">{guests.filter(g => !g.plusOne).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4">Add New Guest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Guest name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="(555) 555-5555"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                <input
                  type="text"
                  value={newGuest.group}
                  onChange={(e) => setNewGuest({...newGuest, group: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Family, Friends, Work"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Preference</label>
                <input
                  type="text"
                  value={newGuest.mealPreference}
                  onChange={(e) => setNewGuest({...newGuest, mealPreference: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Vegetarian, Vegan"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newGuest.plusOne}
                  onChange={(e) => setNewGuest({...newGuest, plusOne: e.target.checked})}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Plus One</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addGuest}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
