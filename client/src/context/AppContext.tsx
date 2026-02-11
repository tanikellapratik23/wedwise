import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

interface OnboardingData {
  role: string;
  weddingStyle: string;
  topPriority?: string[];
  estimatedBudget?: number;
  guestCount?: number;
  weddingDate?: string;
  weddingTime?: string;
  weddingCity?: string;
  weddingState?: string;
  weddingCountry?: string;
  isReligious?: boolean;
  ceremonyType?: string;
  goals?: string;
  wantsBachelorParty?: boolean;
  plannerData?: Record<string, any>;
  [key: string]: any;
}

interface Budget {
  _id: string;
  userId: string;
  title: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  expenses: any[];
  [key: string]: any;
}

interface Registry {
  _id: string;
  userId: string;
  name: string;
  items: any[];
  [key: string]: any;
}

interface User {
  _id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  onboardingCompleted?: boolean;
  [key: string]: any;
}

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;

  // Onboarding
  onboardingData: OnboardingData | null;
  setOnboardingData: (data: OnboardingData) => void;
  saveOnboarding: (data: OnboardingData) => Promise<void>;
  hasCompletedOnboarding: boolean;

  // Budgets
  budgets: Budget[];
  fetchBudgets: () => Promise<void>;
  updateBudget: (id: string, data: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Registries
  registries: Registry[];
  fetchRegistries: () => Promise<void>;
  updateRegistry: (id: string, data: any) => Promise<void>;

  // Expenses/Split
  expenses: any[];
  fetchExpenses: (budgetId: string) => Promise<void>;
  addExpense: (budgetId: string, expense: any) => Promise<void>;
  settleExpense: (expenseId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          setIsAuthenticated(true);
          const response = await api.get('/user/profile');
          setUser(response.data);
          
          // Fetch onboarding data
          try {
            const onboardingResponse = await api.get('/onboarding');
            setOnboardingData(onboardingResponse.data);
            setHasCompletedOnboarding(true);
          } catch (e) {
            console.log('Onboarding data not found');
          }
        } catch (e) {
          console.error('Failed to initialize auth:', e);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Slightly longer timeout (4s) to give server more time, but still fast enough for UX
      const response = await api.post('/auth/login', { email, password }, { timeout: 4000 });
      const { token, user: userData, onboarding } = response.data;
      
      localStorage.setItem('authToken', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Use onboarding data from login response if available
      if (onboarding) {
        setOnboardingData(onboarding);
        setHasCompletedOnboarding(true);
      } else if (userData?.onboardingCompleted) {
        setHasCompletedOnboarding(true);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthenticated(false);
    setOnboardingData(null);
    setHasCompletedOnboarding(false);
    setBudgets([]);
    setRegistries([]);
    setExpenses([]);
  }, []);

  const saveOnboarding = useCallback(async (data: OnboardingData) => {
    try {
      const response = await api.post('/onboarding', data);
      setOnboardingData(response.data);
      setHasCompletedOnboarding(true);
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('userRole', data.role);
      return response.data;
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      throw error;
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, data: any) => {
    try {
      await api.put(`/budgets/${id}`, data);
      await fetchBudgets();
    } catch (error) {
      console.error('Failed to update budget:', error);
      throw error;
    }
  }, [fetchBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await api.delete(`/budgets/${id}`);
      await fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      throw error;
    }
  }, [fetchBudgets]);

  const fetchRegistries = useCallback(async () => {
    try {
      const response = await api.get('/registries');
      setRegistries(response.data);
    } catch (error) {
      console.error('Failed to fetch registries:', error);
    }
  }, []);

  const updateRegistry = useCallback(async (id: string, data: any) => {
    try {
      await api.put(`/registries/${id}`, data);
      await fetchRegistries();
    } catch (error) {
      console.error('Failed to update registry:', error);
      throw error;
    }
  }, [fetchRegistries]);

  const fetchExpenses = useCallback(async (budgetId: string) => {
    try {
      const response = await api.get(`/budgets/${budgetId}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  const addExpense = useCallback(async (budgetId: string, expense: any) => {
    try {
      await api.post(`/budgets/${budgetId}/expenses`, expense);
      await fetchExpenses(budgetId);
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  }, [fetchExpenses]);

  const settleExpense = useCallback(async (expenseId: string) => {
    try {
      await api.put(`/expenses/${expenseId}/settle`);
      // Refresh all budgets to get updated state
      await fetchBudgets();
    } catch (error) {
      console.error('Failed to settle expense:', error);
      throw error;
    }
  }, [fetchBudgets]);

  const value: AppContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    onboardingData,
    setOnboardingData,
    saveOnboarding,
    hasCompletedOnboarding,
    budgets,
    fetchBudgets,
    updateBudget,
    deleteBudget,
    registries,
    fetchRegistries,
    updateRegistry,
    expenses,
    fetchExpenses,
    addExpense,
    settleExpense,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
