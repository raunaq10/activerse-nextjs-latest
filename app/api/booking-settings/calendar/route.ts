import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import BookingDaySettings from '@/models/BookingDaySettings';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function sanitizeClosedList(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((s) => s.trim());
}

/** GET ?date=YYYY-MM-DD - get closed slots for one day. GET (no query) - list all day overrides. */
export async function GET(request: Request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date. Use YYYY-MM-DD.' }, { status: 400 });
      }
      const doc = await BookingDaySettings.findOne({ date }).lean();
      return NextResponse.json(
        doc ? { date: doc.date, closedTimeSlots: doc.closedTimeSlots || [] } : { date, closedTimeSlots: [] }
      );
    }
    const list = await BookingDaySettings.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(list.map((d) => ({ date: d.date, closedTimeSlots: d.closedTimeSlots || [] })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch calendar settings';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PUT - set which time slots are closed for a date. Body: { date, closedTimeSlots: string[] }. */
export async function PUT(request: Request) {
  try {
    await requireAuth();
    await connectDB();
    const body = await request.json();
    const { date, closedTimeSlots } = body;
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) required.' }, { status: 400 });
    }
    const closed = Array.isArray(closedTimeSlots) ? sanitizeClosedList(closedTimeSlots) : [];
    const doc = await BookingDaySettings.findOneAndUpdate(
      { date },
      { $set: { closedTimeSlots: closed, updated_at: new Date() } },
      { new: true, upsert: true }
    ).lean();
    return NextResponse.json({ date: doc.date, closedTimeSlots: doc.closedTimeSlots || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save calendar settings';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE ?date=YYYY-MM-DD - remove override for that day (all slots open again = default for new day). */
export async function DELETE(request: Request) {
  try {
    await requireAuth();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) required.' }, { status: 400 });
    }
    await BookingDaySettings.deleteOne({ date });
    return NextResponse.json({ success: true, message: 'All slots open for this day.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete calendar settings';
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
