import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined';
  mealPreference?: string;
  plusOne: boolean;
  group?: string;
  notes?: string;
}

const GuestSchema = new Schema<IGuest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    mealPreference: { type: String },
    plusOne: { type: Boolean, default: false },
    group: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IGuest>('Guest', GuestSchema);
