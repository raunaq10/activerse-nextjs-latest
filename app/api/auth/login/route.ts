import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.userId = user._id.toString();
    session.username = user.username;
    await session.save();

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
