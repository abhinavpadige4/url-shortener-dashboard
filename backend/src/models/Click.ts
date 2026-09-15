import mongoose, { Schema, Document, Model } from 'mongoose';
import { IURL } from './URL';

export interface IClick extends Document {
  urlId: mongoose.Types.ObjectId | IURL;
  timestamp: Date;
  referrer: string;
  userAgent: string;
  ipAddress: string;
  country?: string;
  device?: string;
}

const ClickSchema: Schema<IClick> = new Schema({
  urlId: {
    type: Schema.Types.ObjectId,
    ref: 'URL',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  country: {
    type: String,
    trim: true
  },
  device: {
    type: String,
    trim: true
  }
});

// Indexes for analytics queries
ClickSchema.index({ urlId: 1, timestamp: -1 });
ClickSchema.index({ timestamp: -1 });
ClickSchema.index({ ipAddress: 1 });

const Click: Model<IClick> = mongoose.model<IClick>('Click', ClickSchema);

export default Click;