import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetCategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  estimatedAmount: number;
  actualAmount: number;
  paid: number;
  notes?: string;
}

const BudgetCategorySchema = new Schema<IBudgetCategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    estimatedAmount: { type: Number, required: true, default: 0 },
    actualAmount: { type: Number, required: true, default: 0 },
    paid: { type: Number, required: true, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBudgetCategory>('BudgetCategory', BudgetCategorySchema);
