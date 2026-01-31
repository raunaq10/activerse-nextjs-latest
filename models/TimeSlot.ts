import mongoose, { Schema, Model } from 'mongoose';

export interface ITimeSlot {
  date: string;
  time: string;
  available_spots?: number;
  booked_spots?: number;
}

const timeSlotSchema = new Schema<ITimeSlot>({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  available_spots: {
    type: Number,
    default: 24,
  },
  booked_spots: {
    type: Number,
    default: 0,
  },
});

// Compound index to ensure unique date/time combination
timeSlotSchema.index({ date: 1, time: 1 }, { unique: true });

const TimeSlot: Model<ITimeSlot> = mongoose.models.TimeSlot || mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);

export default TimeSlot;
