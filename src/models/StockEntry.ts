import mongoose, { Schema, Document } from 'mongoose';

export interface IStockEntry extends Document {
  date: Date;
  type: 'in' | 'out';
  source: 'khadan_truck' | 'external_truck' | 'local_truck_purchase';
  truckNumber: string;
  quantity: number;
  costValue: number;
  description: string;
  referenceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockEntrySchema = new Schema<IStockEntry>({
  date: { type: Date, required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  source: {
    type: String,
    enum: ['khadan_truck', 'external_truck', 'local_truck_purchase'],
    required: true,
  },
  truckNumber: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  costValue: { type: Number, required: true },
  description: { type: String, default: '' },
  referenceId: { type: Schema.Types.ObjectId, default: null },
}, { timestamps: true });

export default mongoose.models.StockEntry ||
  mongoose.model<IStockEntry>('StockEntry', StockEntrySchema);
