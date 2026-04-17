import mongoose, { Schema, Document } from 'mongoose';
import { LOCAL_TRUCKS } from '@/lib/constants';

export interface IOtherExpense {
  label: string;
  amount: number;
}

export interface ILocalTrip extends Document {
  truckNumber: string;
  date: Date;
  driverName: string;
  // Expenses
  dieselCost: number;
  sandPurchaseCost: number; // from stock
  driverSalary: number;
  maintenance: number;
  tollTax: number;
  otherExpenses: IOtherExpense[];
  totalExpense: number;
  // Revenue
  sellingPrice: number;
  customerName: string;
  numberOfTrips: number;
  quantity: number;
  // Calculated
  profitLoss: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtherExpenseSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
}, { _id: false });

const LocalTripSchema = new Schema<ILocalTrip>({
  truckNumber: { type: String, required: true, enum: [...LOCAL_TRUCKS] },
  date: { type: Date, required: true },
  driverName: { type: String, default: '' },
  // Expenses
  dieselCost: { type: Number, default: 0 },
  sandPurchaseCost: { type: Number, default: 0 },
  driverSalary: { type: Number, default: 0 },
  maintenance: { type: Number, default: 0 },
  tollTax: { type: Number, default: 0 },
  otherExpenses: { type: [OtherExpenseSchema], default: [] },
  totalExpense: { type: Number, default: 0 },
  // Revenue
  sellingPrice: { type: Number, default: 0 },
  customerName: { type: String, default: '' },
  numberOfTrips: { type: Number, default: 1 },
  quantity: { type: Number, default: 0 },
  // Calculated
  profitLoss: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate totalExpense and profitLoss before save
LocalTripSchema.pre('save', function () {
  const otherTotal = this.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  this.totalExpense = this.dieselCost + this.sandPurchaseCost +
    this.driverSalary + this.maintenance + this.tollTax + otherTotal;
  this.profitLoss = this.sellingPrice - this.totalExpense;
});

export default mongoose.models.LocalTrip ||
  mongoose.model<ILocalTrip>('LocalTrip', LocalTripSchema);
