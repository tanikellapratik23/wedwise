import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'bride' | 'groom' | 'parent' | 'friend' | 'planner' | 'other';
  onboardingCompleted: boolean;
  isAdmin?: boolean;
  resetToken?: string;
  resetTokenExpires?: Date;
  onboardingData?: {
    role: string;
    weddingStyle: string;
    topPriority: string[];
    estimatedBudget?: number;
    guestCount?: number;
    goals: string;
    preferredColorTheme?: string;
    wantsBachelorParty?: boolean;
    weddingDate?: Date;
    weddingTime?: string;
    weddingCity?: string;
    weddingState?: string;
    weddingCountry?: string;
    isReligious?: boolean;
    religions?: string[];
    ceremonyDetails?: {
      officiantType?: string;
    };
  };
  sharedLinks?: Array<{
    token: string;
    accessLevel: 'view' | 'edit';
    createdAt: Date;
    expiresAt?: Date;
  }>;
  navigationPreferences?: {
    order: string[];
    hidden: string[];
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['bride', 'groom', 'parent', 'friend', 'planner', 'other'],
      default: 'bride',
    },
    isAdmin: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingData: {
      role: String,
      weddingStyle: String,
      topPriority: [String],
      estimatedBudget: Number,
      guestCount: Number,
      goals: String,
      preferredColorTheme: String,
      wantsBachelorParty: Boolean,
      weddingDate: Date,
      weddingTime: String,
      weddingCity: String,
      weddingState: String,
      weddingCountry: String,
      isReligious: Boolean,
      religions: [String],
      ceremonyDetails: {
        officiantType: String,
      },
    },
    sharedLinks: [
      {
        token: String,
        accessLevel: { type: String, enum: ['view', 'edit'], default: 'view' },
        createdAt: Date,
        expiresAt: Date,
      },
    ],
    navigationPreferences: {
      order: [String],
      hidden: [String],
    },
    resetToken: { type: String, default: undefined },
    resetTokenExpires: { type: Date, default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
