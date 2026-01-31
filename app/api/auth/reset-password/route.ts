import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();
    const tokenRow = await PasswordResetToken.findOne({
      token,
      expires_at: { $gt: new Date() },
      used: false,
    });

    if (!tokenRow) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: tokenRow.user_id }, { $set: { password_hash: hash } });
    await PasswordResetToken.updateOne({ _id: tokenRow._id }, { $set: { used: true } });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
