export interface User {
  id: string;
  email: string;
  name: string;
  role: 'bride' | 'groom' | 'parent' | 'friend' | 'planner' | 'other';
  createdAt: Date;
}

export interface OnboardingData {
  role: 'self' | 'parent' | 'friend' | 'planner' | 'other';
  weddingStyle: string;
  topPriority: string[];
  estimatedBudget?: number;
  guestCount?: number;
  goals: string;
  preferredColorTheme?: string;
  weddingCity?: string;
  weddingState?: string;
  weddingCountry?: string;
  isReligious?: boolean;
  religions?: string[];
  ceremonyType?: 'secular' | 'religious' | 'interfaith' | 'cultural' | 'spiritual';
  interfaithPreferences?: {
    religion: string;
    ritualsToInclude: string[];
  }[];
  ceremonyDetails?: {
    officiantType?: string;
    specificRituals?: string[];
    culturalTraditions?: string[];
  };
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  mealPreference?: string;
  plusOne: boolean;
  group?: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  estimatedAmount: number;
  actualAmount: number;
  paid: number;
  notes?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  assignedTo?: string;
  location?: {
    city: string;
    state?: string;
    country?: string;
  };
  rating?: number;
  specialties?: string[];
  religiousAccommodations?: string[];
}

export interface VendorSearchFilters {
  category?: string;
  city?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  religiousAccommodations?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  estimatedCost?: number;
  actualCost?: number;
  depositPaid?: number;
  status: 'researching' | 'contacted' | 'booked' | 'paid';
  notes?: string;
}

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  guests: string[]; // Guest IDs
  shape: 'round' | 'rectangle' | 'square';
}

export interface Wedding {
  id: string;
  userId: string;
  date?: Date;
  venue?: string;
  totalBudget: number;
  onboardingData: OnboardingData;
  guests: Guest[];
  budget: BudgetCategory[];
  todos: Todo[];
  vendors: Vendor[];
  seating: SeatingTable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
