import { NextResponse } from 'next/server';
import Booking from '@/models/Booking';
import { getSettingsForDate } from '@/lib/getBookingSettings';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const duration = searchParams.get('duration');
    const slotDuration = duration === '30' ? 30 : duration === '60' ? 60 : 60;

    const settings = await getSettingsForDate(date);
    const enabledSlots = slotDuration === 30
      ? (Array.isArray(settings.timeSlots30Min) && settings.timeSlots30Min.length > 0 ? settings.timeSlots30Min : getDefaultTimeSlots30Min()).filter((x) => x.enabled)
      : (Array.isArray(settings.timeSlots60Min) && settings.timeSlots60Min.length > 0 ? settings.timeSlots60Min : getDefaultTimeSlots60Min()).filter((x) => x.enabled);
    const maxPerSlot = settings.maxBookingsPerSlot;

    // For each date we only count bookings for that date — so a new day always has 0 booked (default full availability)
    const bookings = await Booking.find({
      booking_date: date,
      slot_duration: slotDuration,
      status: { $in: ['confirmed', 'pending'] },
    });

    const bookedByTime: Record<string, number> = {};
    for (const b of bookings) {
      bookedByTime[b.booking_time] = (bookedByTime[b.booking_time] || 0) + b.number_of_guests;
    }

    const availability: Record<string, { booked: number; max: number; isFull: boolean }> = {};
    for (const slot of enabledSlots) {
      const booked = bookedByTime[slot.value] || 0;
      availability[slot.value] = {
        booked,
        max: maxPerSlot,
        isFull: booked >= maxPerSlot,
      };
    }

    return NextResponse.json({
      timeSlots: enabledSlots,
      availability,
      maxBookingsPerSlot: maxPerSlot,
      slotDuration,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch availability';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
