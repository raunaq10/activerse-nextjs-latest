import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TimeSlot from '@/models/TimeSlot';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    await connectDB();
    const { date } = await params;
    const slots = await TimeSlot.find({ date });
    return NextResponse.json(slots);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
