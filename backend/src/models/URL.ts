import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IURL extends Document {
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
}

const URLSchema: Schema<IURL> = new Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for fast lookup
URLSchema.index({ shortCode: 1 });
URLSchema.index({ originalUrl: 1 });

const URL: Model<IURL> = mongoose.model<IURL>('URL', URLSchema);

export default URL;