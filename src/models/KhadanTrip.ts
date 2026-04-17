import mongoose, { Schema, Document } from 'mongoose';
import { KHADAN_TRUCKS } from '@/lib/constants';

export interface IOtherExpense {
  label: string;
  amount: number;
}

export interface IKhadanTrip extends Document {
  truckNumber: string;
  date: Date;
  driverName: string;
  // Expenses
  royalty: number;
  dieselCost: number;
  sandPurchaseCost: number;
  driverSalary: number;
  maintenance: number;
  tollTax: number;
  policeExpense: number;
  panchayatExpense: number;
  loaderExpense: number;
  otherExpenses: IOtherExpense[];
  totalExpense: number;
  // Selling
  sellingMode: 'direct' | 'stock';
  sellingPrice: number;
  customerName: string;
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

const KhadanTripSchema = new Schema<IKhadanTrip>({
  truckNumber: { type: String, required: true, enum: [...KHADAN_TRUCKS] },
  date: { type: Date, required: true },
  driverName: { type: String, default: '' },
  // Expenses
  royalty: { type: Number, default: 0 },
  dieselCost: { type: Number, default: 0 },
  sandPurchaseCost: { type: Number, default: 0 },
  driverSalary: { type: Number, default: 0 },
  maintenance: { type: Number, default: 0 },
  tollTax: { type: Number, default: 0 },
  policeExpense: { type: Number, default: 0 },
  panchayatExpense: { type: Number, default: 0 },
  loaderExpense: { type: Number, default: 0 },
  otherExpenses: { type: [OtherExpenseSchema], default: [] },
  totalExpense: { type: Number, default: 0 },
  // Selling
  sellingMode: { type: String, enum: ['direct', 'stock'], required: true },
  sellingPrice: { type: Number, default: 0 },
  customerName: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  // Calculated
  profitLoss: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate totalExpense and profitLoss before save
KhadanTripSchema.pre('save', function () {
  const otherTotal = this.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  this.totalExpense = this.royalty + this.dieselCost + this.sandPurchaseCost +
    this.driverSalary + this.maintenance + this.tollTax +
    this.policeExpense + this.panchayatExpense + this.loaderExpense + otherTotal;

  if (this.sellingMode === 'direct') {
    this.profitLoss = this.sellingPrice - this.totalExpense;
  } else {
    // When added to stock, no direct profit - stock absorbs the cost
    this.profitLoss = 0;
  }
});

export default mongoose.models.KhadanTrip ||
  mongoose.model<IKhadanTrip>('KhadanTrip', KhadanTripSchema);
