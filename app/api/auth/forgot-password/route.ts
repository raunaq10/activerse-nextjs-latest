import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email });
    let token = null;

    if (user) {
      token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await PasswordResetToken.deleteMany({ user_id: user._id });
      await PasswordResetToken.create({
        user_id: user._id,
        token,
        expires_at: expiresAt,
      });
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetToken: token, // Remove this in production or send via email
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
