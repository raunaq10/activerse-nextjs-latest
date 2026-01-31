import mongoose, { Schema, Model } from 'mongoose';

export interface ISubscriber {
  email: string;
  subscribed_at?: Date;
  active?: boolean;
}

const subscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribed_at: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);

export default Subscriber;
