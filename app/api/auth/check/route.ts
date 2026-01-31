import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.userId) {
      return NextResponse.json({ authenticated: false });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('username email');
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
