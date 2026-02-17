import mongoose, { Schema, Model } from 'mongoose';

/**
 * Per-day: only which time slots are CLOSED.
 * No record for a date = all slots open (default for each new day).
 */

export interface IBookingDaySettings {
  date: string; // YYYY-MM-DD
  closedTimeSlots: string[]; // e.g. ["12:00", "13:00"] = those times are closed for this day
  updated_at?: Date;
}

const bookingDaySettingsSchema = new Schema<IBookingDaySettings>(
  {
    date: { type: String, required: true, unique: true },
    closedTimeSlots: { type: [String], default: [] },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

bookingDaySettingsSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const BookingDaySettings: Model<IBookingDaySettings> =
  mongoose.models.BookingDaySettings ||
  mongoose.model<IBookingDaySettings>('BookingDaySettings', bookingDaySettingsSchema);

export default BookingDaySettings;
