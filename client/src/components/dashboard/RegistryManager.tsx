import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ExternalLink, Search, RefreshCw, ShoppingCart, X, Heart } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatting';
import { userDataStorage } from '../../utils/userDataStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Registry {
  _id?: string;
  id?: string;
  name: string;
  url: string;
  type: 'zola' | 'amazon' | 'target' | 'bed-bath-beyond' | 'other';
  notes?: string;
}

interface RegistryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
  registryType: string;
  category?: string;
  isLiked?: boolean;
}

// Mock registry items - in production, these would come from registry APIs
const MOCK_ITEMS: { [key: string]: RegistryItem[] } = {
  zola: [
    { id: '1', name: 'Luxury Bedding Set', price: 299, image: 'https://images.unsplash.com/photo-1585399363661-3c87dff9da1a?w=400&h=300&fit=crop', url: 'https://zola.com/example1', registryType: 'zola', category: 'Home' },
    { id: '2', name: 'Stainless Steel Cookware', price: 449, image: 'https://images.unsplash.com/photo-1595521624f1-7e8c9b2b0e4c?w=400&h=300&fit=crop', url: 'https://zola.com/example2', registryType: 'zola', category: 'Kitchen' },
    { id: '3', name: 'Crystal Wine Glasses', price: 89, image: 'https://images.unsplash.com/photo-1624953398376-05e5d9cf5e0f?w=400&h=300&fit=crop', url: 'https://zola.com/example3', registryType: 'zola', category: 'Kitchen' },
    { id: '4', name: 'Marble Serving Board', price: 125, image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop', url: 'https://zola.com/example4', registryType: 'zola', category: 'Kitchen' },
    { id: '5', name: 'Egyptian Cotton Towels', price: 79, image: 'https://images.unsplash.com/photo-1585399363661-3c87dff9da1a?w=400&h=300&fit=crop', url: 'https://zola.com/example5', registryType: 'zola', category: 'Bath' },
    { id: '6', name: 'Coffee Maker', price: 199, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&h=300&fit=crop', url: 'https://zola.com/example6', registryType: 'zola', category: 'Kitchen' },
    { id: '7', name: 'Decorative Pillows', price: 149, image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop', url: 'https://zola.com/example7', registryType: 'zola', category: 'Home' },
    { id: '8', name: 'Table Lamp Set', price: 189, image: 'https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=400&h=300&fit=crop', url: 'https://zola.com/example8', registryType: 'zola', category: 'Lighting' },
  ],
  amazon: [
    { id: 'a1', name: 'Instant Pot Pro', price: 129, image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop', url: 'https://amazon.com/example1', registryType: 'amazon', category: 'Kitchen' },
    { id: 'a2', name: 'Robot Vacuum', price: 399, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', url: 'https://amazon.com/example2', registryType: 'amazon', category: 'Home' },
    { id: 'a3', name: 'Wireless Speakers', price: 159, image: 'https://images.unsplash.com/photo-1589003077984-894e133814c9?w=400&h=300&fit=crop', url: 'https://amazon.com/example3', registryType: 'amazon', category: 'Electronics' },
    { id: 'a4', name: 'Blender Pro', price: 249, image: 'https://images.unsplash.com/photo-1584568694244-14fbbc50d737?w=400&h=300&fit=crop', url: 'https://amazon.com/example4', registryType: 'amazon', category: 'Kitchen' },
    { id: 'a5', name: 'Smart Thermostat', price: 179, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', url: 'https://amazon.com/example5', registryType: 'amazon', category: 'Electronics' },
    { id: 'a6', name: 'Air Fryer', price: 99, image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop', url: 'https://amazon.com/example6', registryType: 'amazon', category: 'Kitchen' },
  ],
  target: [
    { id: 't1', name: 'Dinnerware Set', price: 89, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop', url: 'https://target.com/example1', registryType: 'target', category: 'Kitchen' },
    { id: 't2', name: 'Bedframe Queen', price: 349, image: 'https://images.unsplash.com/photo-1558618665-4309f3a69dbe?w=400&h=300&fit=crop', url: 'https://target.com/example2', registryType: 'target', category: 'Bedroom' },
    { id: 't3', name: 'Area Rug', price: 199, image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=300&fit=crop', url: 'https://target.com/example3', registryType: 'target', category: 'Home' },
    { id: 't4', name: 'Desk Lamp', price: 45, image: 'https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=400&h=300&fit=crop', url: 'https://target.com/example4', registryType: 'target', category: 'Lighting' },
  ],
};

// Default registries to show
const DEFAULT_REGISTRIES: Registry[] = [
  { id: 'zola-default', name: 'Zola Registry', type: 'zola', url: 'https://www.zola.com' },
  { id: 'amazon-default', name: 'Amazon Registry', type: 'amazon', url: 'https://www.amazon.com' },
  { id: 'target-default', name: 'Target Registry', type: 'target', url: 'https://www.target.com' },
];

export default function RegistryManager() {
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistryType, setSelectedRegistryType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<RegistryItem[]>([]);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [newRegistry, setNewRegistry] = useState<Partial<Registry>>({
    name: '',
    url: '',
    type: 'zola',
    notes: '',
  });

  useEffect(() => {
    fetchRegistries();
  }, []);

  useEffect(() => {
    loadRegistryItems();
  }, [selectedRegistryType]);

  useEffect(() => {
    filterAndSearchItems();
  }, [searchTerm, selectedCategory, registryItems]);

  const fetchRegistries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        const cached = userDataStorage.getData('registries');
        if (cached) {
          const regs = Array.isArray(cached) ? cached : [];
          setRegistries(regs);
          if (regs.length > 0 && !selectedRegistryType) {
            setSelectedRegistryType(regs[0].type);
          }
        } else {
          // Use default registries if none cached
          setRegistries(DEFAULT_REGISTRIES);
          setSelectedRegistryType('zola');
        }
        return;
      }

      const response = await axios.get(`${API_URL}/api/registries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const regs = response.data && response.data.length > 0 ? response.data : DEFAULT_REGISTRIES;
      setRegistries(regs);
      if (regs.length > 0 && !selectedRegistryType) {
        setSelectedRegistryType(regs[0].type);
      }
      userDataStorage.setData('registries', regs);
    } catch (error) {
      console.error('Failed to fetch registries:', error);
      const cached = userDataStorage.getData('registries');
      if (cached) {
        const regs = Array.isArray(cached) ? cached : [];
        setRegistries(regs);
        if (regs.length > 0 && !selectedRegistryType) {
          setSelectedRegistryType(regs[0].type);
        }
      } else {
        setRegistries(DEFAULT_REGISTRIES);
        setSelectedRegistryType('zola');
      }
    }
  };

  const loadRegistryItems = () => {
    if (!selectedRegistryType) return;
    const items = MOCK_ITEMS[selectedRegistryType] || [];
    setRegistryItems(items);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const filterAndSearchItems = () => {
    let filtered = registryItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    setDisplayedItems(filtered.slice(startIdx, endIdx));
  };

  const addRegistry = async () => {
    if (!newRegistry.name || !newRegistry.url) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        const local = [...registries, { id: `local-${Date.now()}`, ...newRegistry } as Registry];
        setRegistries(local);
        userDataStorage.setData('registries', local);
        setShowAddModal(false);
        setNewRegistry({ name: '', url: '', type: 'zola' });
        return;
      }

      await axios.post(
        `${API_URL}/api/registries`,
        newRegistry,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRegistries();
      setShowAddModal(false);
      setNewRegistry({ name: '', url: '', type: 'zola' });
    } catch (error) {
      console.error('Failed to add registry:', error);
      alert('Failed to add registry');
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistry = async (id: string) => {
    if (!confirm('Delete this registry?')) return;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.delete(`${API_URL}/api/registries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const updated = registries.filter(r => (r._id || r.id) !== id);
      setRegistries(updated);
      userDataStorage.setData('registries', updated);

      if (updated.length > 0) {
        setSelectedRegistryType(updated[0].type);
      } else {
        setSelectedRegistryType(null);
        setRegistryItems([]);
      }
    } catch (error) {
      console.error('Failed to delete registry:', error);
    }
  };

  const categories = Array.from(new Set(registryItems.map(item => item.category))).filter(Boolean) as string[];
  const totalPages = Math.ceil(
    registryItems.filter(item => {
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).length / itemsPerPage
  );

  const typeIcons: {[key: string]: string} = {
    zola: '💍',
    amazon: '📦',
    target: '🎯',
    'bed-bath-beyond': '🛁',
    other: '🎁',
  };

  const typeColors: {[key: string]: string} = {
    zola: 'from-blue-500 to-blue-600',
    amazon: 'from-orange-500 to-orange-600',
    target: 'from-red-500 to-red-600',
    'bed-bath-beyond': 'from-green-500 to-green-600',
    other: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white drop-shadow-md">Registry Shopping Hub</h1>
        <p className="text-gray-100 mt-1 drop-shadow-md">Browse and shop all your registry gifts in one place</p>
      </div>

      {/* Registry Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {registries.map(reg => (
          <button
            key={reg._id || reg.id}
            onClick={() => setSelectedRegistryType(reg.type)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-2 ${
              selectedRegistryType === reg.type
                ? `bg-gradient-to-r ${typeColors[reg.type]} text-white shadow-lg`
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="text-xl">{typeIcons[reg.type] || '🎁'}</span>
            {reg.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteRegistry(reg._id || reg.id || '');
              }}
              className="ml-1 p-0.5 hover:bg-white/20 rounded transition"
              title="Delete registry"
            >
              <X className="w-4 h-4" />
            </button>
          </button>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Registry
        </button>
      </div>

      {/* Search & Filters */}
      {selectedRegistryType && (
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gifts, categories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={loadRegistryItems}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {selectedRegistryType && registryItems.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
                    {item.category}
                  </div>
                  <div className="absolute top-2 left-2 bg-primary-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                    ${item.price}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-sm">{item.name}</h3>

                  {/* Button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View Product
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center mt-6 flex-wrap">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={loadRegistryItems}
                className="ml-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Load More
              </button>
            </div>
          )}
        </div>
      ) : selectedRegistryType ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No items in this registry</p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg font-medium">Add a registry to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Add Your First Registry
          </button>
        </div>
      )}

      {/* Add Registry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Add Registry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registry Name *</label>
                <input
                  type="text"
                  value={newRegistry.name || ''}
                  onChange={(e) => setNewRegistry({ ...newRegistry, name: e.target.value })}
                  placeholder="e.g., Our Zola Registry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registry Type *</label>
                <select
                  value={newRegistry.type || 'zola'}
                  onChange={(e) => setNewRegistry({ ...newRegistry, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="zola">Zola</option>
                  <option value="amazon">Amazon Registry</option>
                  <option value="target">Target Registry</option>
                  <option value="bed-bath-beyond">Bed Bath & Beyond</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registry URL *</label>
                <input
                  type="url"
                  value={newRegistry.url || ''}
                  onChange={(e) => setNewRegistry({ ...newRegistry, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRegistry({ name: '', url: '', type: 'zola' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addRegistry}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Registry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
