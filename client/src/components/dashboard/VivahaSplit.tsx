import { useState, useEffect } from 'react';
import { Plus, DollarSign, Users, CheckCircle, XCircle, ArrowRight, ArrowLeft, Trash2, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Person {
  id: string;
  name: string;
  email?: string;
}

interface Split {
  personId: string;
  amount: number;
  paid: boolean;
}

interface Expense {
  _id?: string;
  id?: string;
  categoryName: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  splits: Split[];
  date: string;
  settled: boolean;
}

interface Balance {
  from: string;
  to: string;
  amount: number;
}

export default function VivahaSplit() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);

  const [newExpense, setNewExpense] = useState({
    categoryName: '',
    description: '',
    totalAmount: 0,
    paidBy: '',
    splitType: 'equal' as 'equal' | 'custom',
    customSplits: {} as { [personId: string]: number },
  });

  const [newPerson, setNewPerson] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchData();
  }, []);
  
  // Auto-sync budget to expenses when budget categories or people change
  useEffect(() => {
    if (budgetCategories.length > 0 && people.length > 0) {
      syncBudgetNow();
    }
  }, [budgetCategories.length, people.length]);
  
  const syncBudgetNow = () => {
    if (budgetCategories.length === 0) {
      alert('No budget categories found. Add items to your Budget first!');
      return;
    }
    
    const synced = syncBudgetToExpenses(budgetCategories, expenses);
    setExpenses(synced);
    localStorage.setItem('vivahaSplitExpenses', JSON.stringify(synced));
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load budget from localStorage first (instant display)
      const cachedBudget = localStorage.getItem('budget');
      let budgetData: any[] = [];
      if (cachedBudget) {
        try {
          budgetData = JSON.parse(cachedBudget);
          setBudgetCategories(budgetData);
        } catch (e) {
          console.error('Failed to parse cached budget:', e);
        }
      }
      
      // Fetch budget categories from API
      try {
        const budgetRes = await axios.get(`${API_URL}/api/budget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (budgetRes.data.success && budgetRes.data.data) {
          budgetData = budgetRes.data.data;
          setBudgetCategories(budgetData);
        }
      } catch (error) {
        console.log('Using cached budget data');
      }

      // Load people and expenses from localStorage
      const savedPeople = localStorage.getItem('vivahaSplitPeople');
      const savedExpenses = localStorage.getItem('vivahaSplitExpenses');
      
      if (savedPeople) setPeople(JSON.parse(savedPeople));
      
      let existingExpenses: Expense[] = [];
      if (savedExpenses) {
        existingExpenses = JSON.parse(savedExpenses);
      }
      
      // Auto-sync budget expenses to VivahaSplit
      const budgetExpenses = syncBudgetToExpenses(budgetData, existingExpenses);
      if (budgetExpenses.length > existingExpenses.length) {
        setExpenses(budgetExpenses);
        localStorage.setItem('vivahaSplitExpenses', JSON.stringify(budgetExpenses));
      } else {
        setExpenses(existingExpenses);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  // Sync budget categories to expenses automatically
  const syncBudgetToExpenses = (budgetCategories: any[], existingExpenses: Expense[]): Expense[] => {
    const synced: Expense[] = [...existingExpenses];
    const existingIds = new Set(synced.map(e => e.id || e._id));
    
    budgetCategories.forEach((category) => {
      const budgetId = `budget-${category._id || category.id}`;
      
      // Check if this budget category is already in expenses
      if (!existingIds.has(budgetId) && (category.actualAmount > 0 || category.estimatedAmount > 0)) {
        const amount = category.actualAmount || category.estimatedAmount;
        
        // Create expense from budget category
        const expense: Expense = {
          id: budgetId,
          categoryName: category.name,
          description: `${category.name} (from Budget)`,
          totalAmount: amount,
          paidBy: people.length > 0 ? people[0].id : '',
          splits: people.length > 0 ? people.map(p => ({
            personId: p.id,
            amount: parseFloat((amount / people.length).toFixed(2)),
            paid: false,
          })) : [],
          date: new Date().toISOString(),
          settled: false,
        };
        
        synced.push(expense);
      }
    });
    
    return synced;
  };

  const savePeople = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
    localStorage.setItem('vivahaSplitPeople', JSON.stringify(updatedPeople));
  };

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('vivahaSplitExpenses', JSON.stringify(updatedExpenses));
  };

  const addPerson = () => {
    if (!newPerson.name.trim()) {
      alert('Please enter a name');
      return;
    }

    const person: Person = {
      id: Date.now().toString(),
      name: newPerson.name.trim(),
      email: newPerson.email.trim(),
    };

    savePeople([...people, person]);
    setNewPerson({ name: '', email: '' });
    setShowAddPerson(false);
  };

  const removePerson = (id: string) => {
    if (!confirm('Remove this person? Their splits will be removed from all expenses.')) return;
    
    savePeople(people.filter(p => p.id !== id));
    
    // Remove from all expenses
    const updatedExpenses = expenses.map(exp => ({
      ...exp,
      splits: exp.splits.filter(s => s.personId !== id),
      paidBy: exp.paidBy === id ? '' : exp.paidBy,
    }));
    saveExpenses(updatedExpenses);
  };

  const addExpense = () => {
    if (!newExpense.categoryName || !newExpense.description || newExpense.totalAmount <= 0 || !newExpense.paidBy) {
      alert('Please fill in all required fields');
      return;
    }

    let splits: Split[] = [];
    
    if (newExpense.splitType === 'equal') {
      const perPerson = newExpense.totalAmount / people.length;
      splits = people.map(p => ({
        personId: p.id,
        amount: parseFloat(perPerson.toFixed(2)),
        paid: p.id === newExpense.paidBy,
      }));
    } else {
      const customTotal = Object.values(newExpense.customSplits).reduce((sum, amt) => sum + amt, 0);
      if (Math.abs(customTotal - newExpense.totalAmount) > 0.01) {
        alert(`Custom splits must add up to $${newExpense.totalAmount.toFixed(2)}. Current total: $${customTotal.toFixed(2)}`);
        return;
      }
      
      splits = people.map(p => ({
        personId: p.id,
        amount: newExpense.customSplits[p.id] || 0,
        paid: p.id === newExpense.paidBy,
      })).filter(s => s.amount > 0);
    }

    const expense: Expense = {
      id: Date.now().toString(),
      categoryName: newExpense.categoryName,
      description: newExpense.description,
      totalAmount: newExpense.totalAmount,
      paidBy: newExpense.paidBy,
      splits,
      date: new Date().toISOString(),
      settled: false,
    };

    saveExpenses([...expenses, expense]);
    setNewExpense({
      categoryName: '',
      description: '',
      totalAmount: 0,
      paidBy: '',
      splitType: 'equal',
      customSplits: {},
    });
    setShowAddExpense(false);
  };

  const deleteExpense = (id: string) => {
    if (!confirm('Delete this expense?')) return;
    saveExpenses(expenses.filter(e => e.id !== id && e._id !== id));
  };

  const toggleSettled = (id: string) => {
    const updated = expenses.map(e => 
      (e.id === id || e._id === id) ? { ...e, settled: !e.settled } : e
    );
    saveExpenses(updated);
  };

  const calculateBalances = (): Balance[] => {
    const balances: { [personId: string]: number } = {};
    
    // Initialize all people to 0
    people.forEach(p => balances[p.id] = 0);

    // Calculate net balance for each person
    expenses.filter(e => !e.settled).forEach(expense => {
      const payer = expense.paidBy;
      
      // Payer gets credited
      balances[payer] = (balances[payer] || 0) + expense.totalAmount;
      
      // Each person in split gets debited their share
      expense.splits.forEach(split => {
        balances[split.personId] = (balances[split.personId] || 0) - split.amount;
      });
    });

    // Convert to list of transactions (simplified debt)
    const transactions: Balance[] = [];
    const creditors = Object.entries(balances).filter(([, amt]) => amt > 0.01);
    const debtors = Object.entries(balances).filter(([, amt]) => amt < -0.01);

    debtors.forEach(([debtorId, debtAmt]) => {
      let remaining = Math.abs(debtAmt);
      
      for (const [creditorId, creditAmt] of creditors) {
        if (remaining < 0.01) break;
        if (creditAmt < 0.01) continue;
        
        const amount = Math.min(remaining, creditAmt);
        transactions.push({
          from: debtorId,
          to: creditorId,
          amount: parseFloat(amount.toFixed(2)),
        });
        
        remaining -= amount;
        creditors[creditors.findIndex(([id]) => id === creditorId)][1] -= amount;
      }
    });

    return transactions;
  };

  const balances = calculateBalances();
  const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const settledAmount = expenses.filter(e => e.settled).reduce((sum, e) => sum + e.totalAmount, 0);

  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            Vivaha Split
          </h1>
          <p className="text-gray-600 mt-2">Split wedding expenses fairly with family and friends</p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={syncBudgetNow}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition"
            title="Sync expenses from Budget"
          >
            <ArrowRight className="w-4 h-4" />
            Sync Budget
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddPerson(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Users className="w-4 h-4" />
            Add Person
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Spent</p>
              <p className="text-3xl font-bold text-green-900 mt-1">${totalSpent.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">People Involved</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{people.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Settled</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">${settledAmount.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* People List */}
      {people.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            People
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {people.map((person) => (
              <motion.div
                key={person.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{person.name}</p>
                  {person.email && <p className="text-xs text-gray-600">{person.email}</p>}
                </div>
                <button
                  onClick={() => removePerson(person.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Balances */}
      {balances.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Who Owes Whom</h2>
          <div className="space-y-3">
            {balances.map((balance, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-4 flex items-center justify-between border border-orange-300"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg font-semibold">
                    {getPersonName(balance.from)}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-semibold">
                    {getPersonName(balance.to)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  ${balance.amount.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Expenses</h2>
        
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses yet. Add your first expense to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {expenses.map((expense) => (
                <motion.div
                  key={expense.id || expense._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg p-4 border-2 transition ${
                    expense.settled
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          {expense.categoryName}
                        </span>
                        {expense.settled && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Settled
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{expense.description}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Paid by <span className="font-semibold text-gray-900">{getPersonName(expense.paidBy)}</span> • 
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {expense.splits.map((split) => (
                          <div
                            key={split.personId}
                            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            {getPersonName(split.personId)}: ${split.amount.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-2xl font-bold text-green-600">
                        ${expense.totalAmount.toFixed(2)}
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSettled(expense.id || expense._id || '')}
                          className={`p-2 rounded-lg transition ${
                            expense.settled
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {expense.settled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteExpense(expense.id || expense._id || '')}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Add Person Modal */}
      <AnimatePresence>
        {showAddPerson && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddPerson(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Add Person</h2>
                  <button
                    onClick={() => setShowAddPerson(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addPerson}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                  >
                    Add Person
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddExpense(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {people.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You need to add people first before creating expenses</p>
                    <button
                      onClick={() => {
                        setShowAddExpense(false);
                        setShowAddPerson(true);
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    >
                      Add Person
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <select
                        value={newExpense.categoryName}
                        onChange={(e) => setNewExpense({ ...newExpense, categoryName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {budgetCategories.map((cat) => (
                          <option key={cat._id || cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        placeholder="Venue deposit, catering, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount *</label>
                      <input
                        type="number"
                        value={newExpense.totalAmount || ''}
                        onChange={(e) => setNewExpense({ ...newExpense, totalAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By *</label>
                      <select
                        value={newExpense.paidBy}
                        onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select person</option>
                        {people.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Split Type</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setNewExpense({ ...newExpense, splitType: 'equal', customSplits: {} })}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                            newExpense.splitType === 'equal'
                              ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          Split Equally
                        </button>
                        <button
                          onClick={() => setNewExpense({ ...newExpense, splitType: 'custom' })}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                            newExpense.splitType === 'custom'
                              ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          Custom Split
                        </button>
                      </div>
                    </div>
                    
                    {newExpense.splitType === 'custom' && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Enter amount for each person (must total ${newExpense.totalAmount.toFixed(2)})
                        </p>
                        {people.map((person) => (
                          <div key={person.id} className="flex items-center gap-3">
                            <label className="flex-1 text-sm font-medium text-gray-700">
                              {person.name}
                            </label>
                            <input
                              type="number"
                              value={newExpense.customSplits[person.id] || ''}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  customSplits: {
                                    ...newExpense.customSplits,
                                    [person.id]: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-300">
                          <p className="text-sm font-semibold text-gray-700">
                            Total: ${Object.values(newExpense.customSplits).reduce((sum, amt) => sum + amt, 0).toFixed(2)} / ${newExpense.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addExpense}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Expense'}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
