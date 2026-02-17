import mongoose, { Schema, Model } from 'mongoose';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export interface ITimeSlotOption {
  value: string;
  label: string;
  enabled: boolean;
}

export interface IBookingSettings {
  timeSlots30Min: ITimeSlotOption[];
  timeSlots60Min: ITimeSlotOption[];
  maxBookingsPerSlot: number;
  slotDurationsEnabled?: {
    thirtyMinutes: boolean;
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
  timeSlots30Min: {
    type: [timeSlotOptionSchema],
    default: () => getDefaultTimeSlots30Min(),
  },
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
    thirtyMinutes: { type: Boolean, default: true },
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
