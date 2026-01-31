import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password_hash: string;
  created_at?: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
