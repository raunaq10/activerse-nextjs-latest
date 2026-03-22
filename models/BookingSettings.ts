import mongoose, { Schema, Model } from 'mongoose';
import { getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export interface ITimeSlotOption {
  value: string;
  label: string;
  enabled: boolean;
}

export interface IBookingSettings {
  timeSlots60Min: ITimeSlotOption[];
  maxBookingsPerSlot: number;
  slotDurationsEnabled?: {
    sixtyMinutes: boolean;
  };
  updated_at?: Date;
}

const timeSlotOptionSchema = new Schema<ITimeSlotOption>({
  value: { type: String, required: true },
  label: { type: String, required: true },
  enabled: { type: Boolean, default: true },
}, { _id: false });

const bookingSettingsSchema = new Schema<IBookingSettings>({
  timeSlots60Min: {
    type: [timeSlotOptionSchema],
    default: () => getDefaultTimeSlots60Min(),
  },
  maxBookingsPerSlot: {
    type: Number,
    default: 24,
    min: 1,
    max: 500,
  },
  slotDurationsEnabled: {
    sixtyMinutes: { type: Boolean, default: true },
  },
  updated_at: { type: Date, default: Date.now },
});

bookingSettingsSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const BookingSettings: Model<IBookingSettings> =
  mongoose.models.BookingSettings ||
  mongoose.model<IBookingSettings>('BookingSettings', bookingSettingsSchema);

export default BookingSettings;
