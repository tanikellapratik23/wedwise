import { useState, useEffect } from 'react';
import { Plus, Users, Grid, Download, FileText, Save } from 'lucide-react';
import { exportSeatingToExcel, exportSeatingTableToCSV } from '../../utils/excelExport';
import axios from 'axios';
import { userDataStorage } from '../../utils/userDataStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Guest {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
  shape: 'round' | 'rectangle';
  x: number;
  y: number;
}

export default function SeatingPlanner() {
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests] = useState<Guest[]>([]);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 8,
    shape: 'round' as 'round' | 'rectangle'
  });

  // Load seating from localStorage immediately, then from backend
  useEffect(() => {
    // Load from localStorage immediately for instant display
    try {
      const cached = userDataStorage.getData('seating');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTables(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cached seating:', e);
    }
    
    fetchSeating();
  }, []);

  // Save to localStorage immediately whenever tables change
  useEffect(() => {
    if (tables.length > 0) {
      try {
        userDataStorage.setData('seating', JSON.stringify(tables));
      } catch (e) {
        console.error('Failed to save seating:', e);
      }
    }
  }, [tables]);

  const fetchSeating = async () => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const cached = userDataStorage.getData('seating');
        if (cached) setTables(JSON.parse(cached));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/seating`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && response.data.data.tables) {
        setTables(response.data.data.tables);
      }
    } catch (error) {
      console.error('Failed to fetch seating:', error);
      // fallback to local cache
      const cached = userDataStorage.getData('seating');
      if (cached) setTables(JSON.parse(cached));
    }
  };

  const saveSeating = async () => {
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      
      if (offlineMode) {
        userDataStorage.setData('seating', JSON.stringify(tables));
        alert('Seating arrangement saved locally');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/seating`, { tables }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        alert('Seating arrangement saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save seating:', error);
      alert('Failed to save seating. Check console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0);
  const assignedSeats = tables.reduce((sum, table) => sum + table.guests.length, 0);

  const handleAddTable = () => {
    const table: Table = {
      id: Date.now().toString(),
      name: newTable.name || `Table ${tables.length + 1}`,
      capacity: newTable.capacity,
      guests: [],
      shape: newTable.shape,
      x: 50 + (tables.length * 150) % 600,
      y: 50 + Math.floor((tables.length * 150) / 600) * 150,
    };
    setTables([...tables, table]);
    setShowAddTableModal(false);
    setNewTable({ name: '', capacity: 8, shape: 'round' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Seating Planner</h1>
          <p className="text-gray-100 mt-1 drop-shadow-md">Arrange your guests' seating</p>
        </div>
        <div className="flex gap-3">
          {tables.length > 0 && (
            <>
              <button 
                onClick={saveSeating}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
              <button 
                onClick={() => exportSeatingTableToCSV(tables)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition font-medium"
              >
                <FileText className="w-5 h-5" />
                <span>Download CSV</span>
              </button>
              <button 
                onClick={() => exportSeatingToExcel(tables)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Download Excel</span>
              </button>
            </>
          )}
          <button 
            onClick={() => setShowAddTableModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Total Tables</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{tables.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Total Seats</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSeats}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">Assigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assignedSeats}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Unassigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{unassignedGuests.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seating Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Grid className="w-6 h-6 mr-2 text-primary-500" />
              Seating Layout
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                Zoom In
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                Zoom Out
              </button>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl bg-gray-50 relative" style={{ height: '500px' }}>
            {(Array.isArray(tables) ? tables : []).map((table) => (
              <div
                key={table.id}
                className="absolute bg-white border-2 border-primary-300 rounded-lg shadow-lg cursor-move hover:shadow-xl transition"
                style={{
                  left: `${table.x}px`,
                  top: `${table.y}px`,
                  width: table.shape === 'round' ? '120px' : '200px',
                  height: table.shape === 'round' ? '120px' : '80px',
                  borderRadius: table.shape === 'round' ? '50%' : '8px',
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <h3 className="font-bold text-sm text-gray-900">{table.name}</h3>
                  <p className="text-xs text-gray-500">
                    {table.guests.length}/{table.capacity}
                  </p>
                </div>
              </div>
            ))}

            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">Add tables to start planning</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-primary-300 bg-white"></div>
              <span>Round Table</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-5 border-2 border-primary-300 bg-white rounded"></div>
              <span>Rectangle Table</span>
            </div>
          </div>
        </div>

        {/* Tables and Guests List */}
        <div className="space-y-6">
          {/* Unassigned Guests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Unassigned Guests ({unassignedGuests.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(Array.isArray(unassignedGuests) ? unassignedGuests : []).map((guest) => (
                <div
                  key={guest.id}
                  className="p-3 bg-gray-50 hover:bg-primary-50 rounded-lg cursor-move border border-transparent hover:border-primary-300 transition"
                >
                  <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tables Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tables</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(tables) ? tables : []).map((table) => (
                <div key={table.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{table.name}</h3>
                    <span className="text-xs text-gray-500">
                      {table.guests.length}/{table.capacity}
                    </span>
                  </div>
                  
                  {table.guests.length > 0 ? (
                    <div className="space-y-1">
                      {(Array.isArray(table.guests) ? table.guests : []).map((guest) => (
                        <div
                          key={guest.id}
                          className="text-sm text-gray-600 flex items-center justify-between py-1"
                        >
                          <span>{guest.name}</span>
                          <button className="text-xs text-red-600 hover:text-red-800">Remove</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No guests assigned</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
        <p>
          💡 <strong>Tip:</strong> Drag and drop guests from the unassigned list to tables. You can also drag tables around to arrange your seating layout.
        </p>
      </div>

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Table</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder={`Table ${tables.length + 1}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 8 })}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shape
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'round' })}
                    className={`p-4 border-2 rounded-lg transition ${
                      newTable.shape === 'round'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-400 mb-2"></div>
                    <p className="text-sm font-medium text-center">Round</p>
                  </button>
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'rectangle' })}
                    className={`p-4 border-2 rounded-lg transition ${
                      newTable.shape === 'rectangle'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-20 h-12 mx-auto border-4 border-gray-400 rounded mb-2"></div>
                    <p className="text-sm font-medium text-center">Rectangle</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddTableModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTable}
                className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
