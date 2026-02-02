import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IBooking {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  slot_duration: 30 | 60; // Duration in minutes: 30 or 60
  number_of_guests: number;
  special_requests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'not_required';
  payment_intent_id?: string;
  amount_paid?: number;
  currency?: string;
  created_at?: Date;
  updated_at?: Date;
}

const bookingSchema = new Schema<IBooking>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  booking_date: {
    type: String,
    required: true,
  },
  booking_time: {
    type: String,
    required: true,
  },
  slot_duration: {
    type: Number,
    required: true,
    enum: [30, 60], // 30 minutes or 60 minutes (1 hour)
    default: 60, // Default to 1 hour for backward compatibility
  },
  number_of_guests: {
    type: Number,
    required: true,
  },
  special_requests: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'cancelled'],
  },
  payment_status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'not_required'],
  },
  payment_intent_id: {
    type: String,
  },
  amount_paid: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'inr',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
