import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();
    await connectDB();

    const total_bookings = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });

    return NextResponse.json({
      total_bookings,
      pending,
      confirmed,
      cancelled,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
