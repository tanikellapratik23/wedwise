import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
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

const VendorSchema = new Schema<IVendor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    estimatedCost: { type: Number },
    actualCost: { type: Number },
    depositPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['researching', 'contacted', 'booked', 'paid'],
      default: 'researching',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
