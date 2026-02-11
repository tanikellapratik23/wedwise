import { useState, useEffect } from 'react';
import { isAutoSaveEnabled, setWithTTL } from '../../utils/autosave';
import { userDataStorage } from '../../utils/userDataStorage';
import { Plus, CheckCircle, Circle, Calendar, AlertCircle, Trash2, Save, Download, Clock, Zap, Eye, List, BarChart3, X, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import axios from 'axios';
import { exportTodosToCSV } from '../../utils/excelExport';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Todo {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dependsOn?: string[];
  reminderDays?: number;
  tags?: string[];
}

// Task Templates for different wedding phases
const TASK_TEMPLATES = {
  '12-months-before': [
    { title: 'Set wedding date and time', priority: 'high', category: 'Planning', reminderDays: 365 },
    { title: 'Create budget and financing plan', priority: 'high', category: 'Budget', reminderDays: 360 },
    { title: 'Make guest list', priority: 'high', category: 'Guests', reminderDays: 355 },
    { title: 'Book venue', priority: 'high', category: 'Venue', reminderDays: 350 },
  ],
  '6-months-before': [
    { title: 'Book caterer', priority: 'high', category: 'Catering', reminderDays: 180 },
    { title: 'Book photographer/videographer', priority: 'high', category: 'Media', reminderDays: 175 },
    { title: 'Book florist', priority: 'medium', category: 'Flowers', reminderDays: 170 },
    { title: 'Order invitations', priority: 'medium', category: 'Invitations', reminderDays: 165 },
  ],
  '3-months-before': [
    { title: 'Send invitations', priority: 'high', category: 'Invitations', reminderDays: 90 },
    { title: 'Plan menu tasting', priority: 'medium', category: 'Catering', reminderDays: 85 },
    { title: 'Book music/DJ', priority: 'medium', category: 'Music', reminderDays: 80 },
    { title: 'Finalize guest accommodations', priority: 'medium', category: 'Accommodations', reminderDays: 75 },
  ],
  '1-month-before': [
    { title: 'Confirm final headcount with caterer', priority: 'high', category: 'Catering', reminderDays: 30 },
    { title: 'Finalize ceremony details', priority: 'high', category: 'Ceremony', reminderDays: 28 },
    { title: 'Arrange rehearsal dinner', priority: 'medium', category: 'Events', reminderDays: 25 },
    { title: 'Break in wedding shoes', priority: 'low', category: 'Personal', reminderDays: 20 },
  ],
  '1-week-before': [
    { title: 'Final venue walkthrough', priority: 'high', category: 'Venue', reminderDays: 7 },
    { title: 'Confirm all vendor details', priority: 'high', category: 'Vendors', reminderDays: 6 },
    { title: 'Prepare timeline for vendors', priority: 'high', category: 'Planning', reminderDays: 5 },
    { title: 'Pack for honeymoon', priority: 'medium', category: 'Honeymoon', reminderDays: 3 },
  ],
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'stats'>('list');
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: '',
    description: '',
    dueDate: undefined,
    priority: 'medium',
    category: 'General',
    reminderDays: 7,
  });

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const toggleTodo = async (id: string) => {
    const todo = (Array.isArray(todos) ? todos : []).find(t => t.id === id || t._id === id);
    if (!todo) return;
    const todoId = todo._id || id;
    const updated = { ...todo, completed: !todo.completed } as any;

    // optimistic update
    const todosArray = Array.isArray(todos) ? todos : [];
    setTodos(todosArray.map((t) => (t.id === id || t._id === id ? { ...t, completed: !t.completed } : t)));

    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const todosArr = Array.isArray(todos) ? todos : [];
        const next = todosArr.map((t) => (t.id === id || t._id === id ? { ...t, completed: !t.completed } : t));
        setTodos(next);
        // persist locally
        const serial = next.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/todos/${todoId}`, updated, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.error('Failed to update todo:', error);
      // revert
      fetchTodos();
    }
  };

  const fetchTodos = async () => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        console.log('📴 Offline mode - loading todos from cache');
        const cached = userDataStorage.getData('todos');
        if (cached) {
          const parsed = JSON.parse(cached) as any[];
          const items = parsed.map((t) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        }
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found - using cached todos');
        const cached = userDataStorage.getData('todos');
        if (cached) {
          const parsed = JSON.parse(cached) as any[];
          const items = parsed.map((t) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        }
        return;
      }

      const res = await axios.get(`${API_URL}/api/todos`, { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      if (res.data.success) {
        console.log('✅ Fetched', res.data.data.length, 'todos from server');
        // convert dates
        const items = res.data.data.map((t: any) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
        setTodos(items);
        // Update localStorage with server data
        const serial = items.map((t: any) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
      }
    } catch (error) {
      console.error('❌ Failed to fetch todos from server:', error);
      // fallback to cache
      const cached = userDataStorage.getData('todos');
      if (cached) {
        try {
          console.log('📦 Using cached todos');
          const parsed = JSON.parse(cached) as any[];
          const items = parsed.map((t) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        } catch (e) {
          console.error('Failed to parse cached todos', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load from user-specific localStorage immediately for instant display
    try {
      const cached = userDataStorage.getData('todos');
      if (cached) {
        const parsed = Array.isArray(cached) ? cached : [];
        if (parsed.length > 0) {
          const items = parsed.map((t: any) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        }
      }
    } catch (e) {
      console.error('Failed to load cached todos:', e);
    }
    
    fetchTodos();
  }, []);

  // Save to user-specific localStorage immediately whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      try {
        const serial = todos.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
        if (isAutoSaveEnabled()) {
          setWithTTL('todos', serial, 24 * 60 * 60 * 1000);
        }
      } catch (e) {
        console.error('Failed to save todos:', e);
      }
    }
  }, [todos]);

  const applyTemplate = (templateKey: string) => {
    const template = TASK_TEMPLATES[templateKey as keyof typeof TASK_TEMPLATES];
    if (!template) return;

    const newTodos: Todo[] = template.map((task) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: task.title,
      priority: task.priority as 'low' | 'medium' | 'high',
      category: task.category,
      reminderDays: task.reminderDays,
      completed: false,
      dueDate: new Date(Date.now() + (task.reminderDays || 30) * 24 * 60 * 60 * 1000),
    }));

    setTodos([...todos, ...newTodos]);
    setShowTemplateModal(false);
  };

  const addTodo = async () => {
    if (!newTodo.title) {
      alert('Please enter a task title');
      return;
    }
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const todo = {
          id: `local-${Date.now()}`,
          title: newTodo.title || '',
          description: newTodo.description || '',
          dueDate: newTodo.dueDate,
          completed: false,
          priority: (newTodo.priority as any) || 'medium',
          category: newTodo.category || 'General',
        } as Todo;
        const next = [...(todos || []), todo];
        setTodos(next);
        // persist
        const serial = next.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
        setShowAddModal(false);
        setNewTodo({ title: '', description: '', dueDate: undefined, priority: 'medium', category: 'General' });
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        title: newTodo.title,
        description: newTodo.description || '',
        dueDate: newTodo.dueDate || null,
        completed: false,
        priority: newTodo.priority,
        category: newTodo.category,
      };
      const res = await axios.post(`${API_URL}/api/todos`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const item = res.data.data;
        item.dueDate = item.dueDate ? new Date(item.dueDate) : undefined;
        setTodos([...(todos || []), item]);
        setShowAddModal(false);
        setNewTodo({ title: '', description: '', dueDate: undefined, priority: 'medium', category: 'General' });
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
      alert('Unable to create task');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const next = (Array.isArray(todos) ? todos : []).filter(t => t._id !== id && t.id !== id);
        setTodos(next);
        const serial = next.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
        return;
      }

      const todo = (Array.isArray(todos) ? todos : []).find(t => t._id === id || t.id === id);
      const todoId = todo?._id || id;
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/todos/${todoId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTodos((Array.isArray(todos) ? todos : []).filter(t => t._id !== id && t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('Unable to delete task');
    }
  };

  const saveTodos = async () => {
    try {
      setLoading(true);
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      
      if (offlineMode) {
        const serial = todos.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        userDataStorage.setData('todos', serial);
        alert('To-dos saved locally');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Save each todo individually
      for (const todo of todos) {
        if (todo._id) {
          // Update existing todo
          await axios.put(`${API_URL}/api/todos/${todo._id}`, todo, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (todo.id && !todo.id.startsWith('local-')) {
          // Create new todo if not local
          await axios.post(`${API_URL}/api/todos`, todo, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      
      alert('To-dos saved successfully!');
    } catch (error) {
      console.error('Failed to save todos:', error);
      alert('Failed to save to-dos. Check console for errors.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTodos = (Array.isArray(todos) ? todos : []).filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  });

  const stats = {
    total: (Array.isArray(todos) ? todos : []).length,
    completed: (Array.isArray(todos) ? todos : []).filter((t) => t.completed).length,
    active: (Array.isArray(todos) ? todos : []).filter((t) => !t.completed).length,
    overdue: (Array.isArray(todos) ? todos : []).filter((t) => !t.completed && t.dueDate && t.dueDate < new Date()).length,
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[priority as keyof typeof colors];
  };

  const isOverdue = (todo: Todo) => {
    return !todo.completed && todo.dueDate && todo.dueDate < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">To-Do List</h1>
          <p className="text-gray-100 mt-1 drop-shadow-md">Track your wedding planning tasks</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-white/20 backdrop-blur rounded-lg p-1 gap-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded transition ${viewMode === 'list' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 rounded transition ${viewMode === 'timeline' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
              title="Timeline View"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('stats')}
              className={`px-3 py-2 rounded transition ${viewMode === 'stats' ? 'bg-white text-pink-600' : 'text-white hover:bg-white/10'}`}
              title="Stats View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          {todos.length > 0 && (
            <button onClick={() => exportTodosToCSV(todos)} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition shadow-lg">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
          <button onClick={() => setShowTemplateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition shadow-lg">
            <Zap className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button onClick={saveTodos} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition shadow-lg">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">Active</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Show:</span>
          <div className="flex space-x-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Todo Views */}
      {viewMode === 'list' && (
        <div className="space-y-3">
        {sortedTodos.map((todo) => (
          <div
            key={todo._id || todo.id}
            className={`bg-white rounded-xl shadow-sm p-6 transition hover:shadow-md ${
              todo.completed ? 'opacity-60' : ''
            } ${isOverdue(todo) ? 'border-l-4 border-red-500' : ''}`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => toggleTodo(todo._id || todo.id || '')}
                className="flex-shrink-0 mt-1"
              >
                {todo.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 fill-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 hover:text-primary-500 transition" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-gray-100 mt-1 drop-shadow-md">{todo.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                    {isOverdue(todo) && (
                      <span className="flex items-center space-x-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium">
                    {todo.category}
                  </span>
                  {todo.dueDate && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {format(todo.dueDate, 'MMM dd, yyyy')}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {sortedTodos.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'completed' ? 'No completed tasks yet' : 'No tasks to show'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            {sortedTodos.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tasks to display in timeline</p>
              </div>
            ) : (
              sortedTodos.map((todo, idx) => (
                <div key={todo._id || todo.id} className="relative">
                  <div className="flex gap-6">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        todo.completed ? 'bg-green-500 border-green-500' : getPriorityColor(todo.priority).includes('red') ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500'
                      }`} />
                      {idx !== sortedTodos.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 my-2" />
                      )}
                    </div>

                    {/* Task content */}
                    <div className="pb-2 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold text-lg ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {todo.category}
                            </span>
                            {todo.dueDate && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(todo.dueDate, 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleTodo(todo._id || todo.id || '')}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition ${
                            todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {todo.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Stats View */}
      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">Completion Progress</h3>
              <BarChart3 className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall</span>
                  <span className="text-sm font-bold text-primary-500">{Math.round((sortedTodos.filter(t => t.completed).length / sortedTodos.length) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(sortedTodos.filter(t => t.completed).length / sortedTodos.length) * 100 || 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{sortedTodos.filter(t => t.completed).length}</p>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{sortedTodos.filter(t => !t.completed && !isOverdue(t)).length}</p>
                  <p className="text-xs text-gray-600 mt-1">On Track</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{sortedTodos.filter(t => isOverdue(t)).length}</p>
                  <p className="text-xs text-gray-600 mt-1">Overdue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900">Priority Distribution</h3>
              <Zap className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-3">
              {['high', 'medium', 'low'].map(priority => {
                const count = sortedTodos.filter(t => t.priority === priority).length;
                const percent = (count / sortedTodos.length) * 100 || 0;
                const colors = {
                  high: 'from-red-500 to-red-600',
                  medium: 'from-yellow-500 to-yellow-600',
                  low: 'from-green-500 to-green-600'
                };
                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                      <span className="text-sm font-bold text-gray-900">{count} tasks</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors[priority as 'high' | 'medium' | 'low']} h-2 rounded-full transition-all`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Tasks by Category</h3>
            <div className="space-y-2">
              {Array.from(new Set(sortedTodos.map(t => t.category))).map(category => {
                const count = sortedTodos.filter(t => t.category === category).length;
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Upcoming Deadlines</h3>
            <div className="space-y-2">
              {sortedTodos.filter(t => t.dueDate && !t.completed).slice(0, 5).map(todo => (
                <div key={todo._id || todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{todo.title}</p>
                    <p className="text-xs text-gray-600">{format(todo.dueDate!, 'MMM dd, yyyy')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Apply Task Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(TASK_TEMPLATES).map(([key, tasks]) => {
                const templateNames: {[key: string]: {name: string; description: string}} = {
                  '12-months-before': { name: '12 Months Before', description: 'Major planning phase' },
                  '6-months-before': { name: '6 Months Before', description: 'Booking phase' },
                  '3-months-before': { name: '3 Months Before', description: 'Finalization phase' },
                  '1-month-before': { name: '1 Month Before', description: 'Details phase' },
                  '1-week-before': { name: '1 Week Before', description: 'Final preparations' },
                };
                const info = templateNames[key as keyof typeof templateNames] || { name: key, description: '' };
                return (
                  <button
                    key={key}
                    onClick={() => {
                      applyTemplate(key);
                      setShowTemplateModal(false);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <h4 className="font-bold text-gray-900">{info.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{info.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{tasks.length} tasks</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Task</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTodo.dueDate ? (new Date(newTodo.dueDate)).toISOString().slice(0,10) : ''}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
                <button onClick={addTodo} className="flex-1 px-4 py-2 bg-primary-500 text-white rounded">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
