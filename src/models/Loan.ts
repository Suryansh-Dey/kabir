import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment {
  date: Date;
  amount: number;
  note: string;
}

export interface ILoan extends Document {
  truckNumber: string;
  totalLoanAmount: number;
  emiAmount: number;
  emiDate: number;
  startDate: Date;
  totalPaid: number;
  remainingAmount: number;
  isActive: boolean;
  payments: IPayment[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
}, { _id: true });

const LoanSchema = new Schema<ILoan>({
  truckNumber: { type: String, required: true },
  totalLoanAmount: { type: Number, required: true },
  emiAmount: { type: Number, required: true },
  emiDate: { type: Number, required: true, min: 1, max: 31 },
  startDate: { type: Date, required: true },
  totalPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  payments: { type: [PaymentSchema], default: [] },
}, { timestamps: true });

LoanSchema.pre('save', function () {
  this.totalPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.remainingAmount = this.totalLoanAmount - this.totalPaid;
  if (this.remainingAmount <= 0) {
    this.remainingAmount = 0;
    this.isActive = false;
  }
});

export default mongoose.models.Loan ||
  mongoose.model<ILoan>('Loan', LoanSchema);
