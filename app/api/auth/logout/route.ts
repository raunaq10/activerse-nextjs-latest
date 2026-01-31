import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
