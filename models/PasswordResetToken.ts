import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IPasswordResetToken {
  user_id: Types.ObjectId;
  token: string;
  expires_at: Date;
  used?: boolean;
  created_at?: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PasswordResetToken: Model<IPasswordResetToken> = mongoose.models.PasswordResetToken || mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;
