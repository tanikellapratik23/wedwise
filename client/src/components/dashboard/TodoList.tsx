import { useState, useEffect } from 'react';
import { isAutoSaveEnabled, setWithTTL } from '../../utils/autosave';
import { Plus, CheckCircle, Circle, Calendar, AlertCircle, Trash2, Save, Download } from 'lucide-react';
import { format } from 'date-fns';
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
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: '',
    description: '',
    dueDate: undefined,
    priority: 'medium',
    category: 'General',
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
        localStorage.setItem('todos', JSON.stringify(serial));
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
        const cached = localStorage.getItem('todos');
        if (cached) {
          const parsed = JSON.parse(cached) as any[];
          const items = parsed.map((t) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        }
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/todos`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        // convert dates
        const items = res.data.data.map((t: any) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
        setTodos(items);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      // fallback to cache
      const cached = localStorage.getItem('todos');
      if (cached) {
        try {
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
    // Load from localStorage immediately for instant display
    try {
      const cached = localStorage.getItem('todos');
      if (cached) {
        const parsed = JSON.parse(cached) as any[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const items = parsed.map((t) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
          setTodos(items);
        }
      }
    } catch (e) {
      console.error('Failed to load cached todos:', e);
    }
    
    fetchTodos();
  }, []);

  // Save to localStorage immediately whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      try {
        const serial = todos.map((t) => ({ ...t, dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null }));
        localStorage.setItem('todos', JSON.stringify(serial));
        if (isAutoSaveEnabled()) {
          setWithTTL('todos', serial, 24 * 60 * 60 * 1000);
        }
      } catch (e) {
        console.error('Failed to save todos:', e);
      }
    }
  }, [todos]);

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
        localStorage.setItem('todos', JSON.stringify(serial));
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
        localStorage.setItem('todos', JSON.stringify(serial));
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
        localStorage.setItem('todos', JSON.stringify(serial));
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
          <p className="text-gray-500 mt-1">Track your wedding planning tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {todos.length > 0 && (
            <button onClick={() => exportTodosToCSV(todos)} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition shadow-lg">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
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

      {/* Todo List */}
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
                      <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
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
