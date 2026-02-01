import mongoose, { Schema, Document } from 'mongoose';

export interface IBachelorExpense extends Document {
  description: string;
  amount: number;
  category: 'accommodation' | 'flights' | 'activities' | 'food' | 'transport' | 'other';
  paidBy: string; // user ID
  splitBetween: Array<{
    userId: string;
    amount: number;
    paid: boolean;
  }>;
  date: Date;
  createdAt: Date;
}

export interface IBachelorFlight extends Document {
  tripId: string;
  airline?: string;
  departure: {
    city: string;
    time: Date;
  };
  arrival: {
    city: string;
    time: Date;
  };
  price: number;
  bookingUrl?: string;
  savedByUsers: string[]; // user IDs
  createdAt: Date;
}

export interface IBachelorStay extends Document {
  tripId: string;
  name: string;
  location: {
    city: string;
    state?: string;
    address?: string;
  };
  checkIn: Date;
  checkOut: Date;
  pricePerNight: number;
  totalNights?: number;
  bookingUrl?: string;
  savedByUsers: string[]; // user IDs
  createdAt: Date;
}

export interface IBachelorTrip extends Document {
  userId: string; // trip organizer
  eventName: string;
  eventType: 'bachelor' | 'bachelorette';
  tripDate: Date;
  location: {
    city: string;
    state?: string;
    country?: string;
  };
  estimatedBudget: number;
  attendees: Array<{
    userId?: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
  expenses: string[]; // expense IDs
  flights: string[]; // flight IDs
  stays: string[]; // stay IDs
  totalExpenses: number;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BachelorExpenseSchema = new Schema<IBachelorExpense>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['accommodation', 'flights', 'activities', 'food', 'transport', 'other'],
      default: 'other',
    },
    paidBy: { type: String, required: true },
    splitBetween: [
      {
        userId: String,
        amount: Number,
        paid: { type: Boolean, default: false },
      },
    ],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BachelorFlightSchema = new Schema<IBachelorFlight>(
  {
    tripId: { type: String, required: true },
    airline: String,
    departure: {
      city: { type: String, required: true },
      time: { type: Date, required: true },
    },
    arrival: {
      city: { type: String, required: true },
      time: { type: Date, required: true },
    },
    price: { type: Number, required: true },
    bookingUrl: String,
    savedByUsers: [String],
  },
  { timestamps: true }
);

const BachelorStaySchema = new Schema<IBachelorStay>(
  {
    tripId: { type: String, required: true },
    name: { type: String, required: true },
    location: {
      city: { type: String, required: true },
      state: String,
      address: String,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    pricePerNight: { type: Number, required: true },
    totalNights: Number,
    bookingUrl: String,
    savedByUsers: [String],
  },
  { timestamps: true }
);

const BachelorTripSchema = new Schema<IBachelorTrip>(
  {
    userId: { type: String, required: true },
    eventName: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['bachelor', 'bachelorette'],
      required: true,
    },
    tripDate: { type: Date, required: true },
    location: {
      city: { type: String, required: true },
      state: String,
      country: String,
    },
    estimatedBudget: { type: Number, required: true },
    attendees: [
      {
        userId: String,
        name: { type: String, required: true },
        email: String,
        phone: String,
      },
    ],
    expenses: [String],
    flights: [String],
    stays: [String],
    totalExpenses: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning',
    },
  },
  { timestamps: true }
);

export const BachelorExpense = mongoose.model<IBachelorExpense>('BachelorExpense', BachelorExpenseSchema);
export const BachelorFlight = mongoose.model<IBachelorFlight>('BachelorFlight', BachelorFlightSchema);
export const BachelorStay = mongoose.model<IBachelorStay>('BachelorStay', BachelorStaySchema);
export const BachelorTrip = mongoose.model<IBachelorTrip>('BachelorTrip', BachelorTripSchema);
