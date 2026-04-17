import mongoose, { Schema, Document } from 'mongoose';
import { LOADERS } from '@/lib/constants';

export interface IOtherExpense {
  label: string;
  amount: number;
}

export interface ILoaderEntry extends Document {
  loaderNumber: string;
  date: Date;
  // Income
  trucksLoaded: number;
  ratePerLoading: number;
  externalIncome: number;
  totalIncome: number;
  // Expenses
  dieselCost: number;
  maintenance: number;
  operatorSalary: number;
  otherExpenses: IOtherExpense[];
  totalExpense: number;
  // Calculated
  profitLoss: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtherExpenseSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
}, { _id: false });

const LoaderEntrySchema = new Schema<ILoaderEntry>({
  loaderNumber: { type: String, required: true, enum: [...LOADERS] },
  date: { type: Date, required: true },
  // Income
  trucksLoaded: { type: Number, default: 0 },
  ratePerLoading: { type: Number, default: 0 },
  externalIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  // Expenses
  dieselCost: { type: Number, default: 0 },
  maintenance: { type: Number, default: 0 },
  operatorSalary: { type: Number, default: 0 },
  otherExpenses: { type: [OtherExpenseSchema], default: [] },
  totalExpense: { type: Number, default: 0 },
  // Calculated
  profitLoss: { type: Number, default: 0 },
}, { timestamps: true });

LoaderEntrySchema.pre('save', function () {
  this.totalIncome = (this.trucksLoaded * this.ratePerLoading) + this.externalIncome;
  const otherTotal = this.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  this.totalExpense = this.dieselCost + this.maintenance + this.operatorSalary + otherTotal;
  this.profitLoss = this.totalIncome - this.totalExpense;
});

export default mongoose.models.LoaderEntry ||
  mongoose.model<ILoaderEntry>('LoaderEntry', LoaderEntrySchema);
