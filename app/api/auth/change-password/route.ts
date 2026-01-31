import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 500 }
      );
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: session.userId }, { $set: { password_hash: hash } });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
