import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPriceForSlotDuration } from '@/lib/config';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const query: any = {};
    if (status) query.status = status;
    if (date) query.booking_date = date;

    const bookings = await Booking.find(query).sort({ created_at: -1 });
    return NextResponse.json(bookings);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, booking_date, booking_time, slot_duration, number_of_guests, special_requests } = body;

    // Validate slot_duration (default to 60 if not provided for backward compatibility)
    const validSlotDuration = slot_duration === 30 || slot_duration === 60 ? slot_duration : 60;

    if (!name || !email || !phone || !booking_date || !booking_time || !number_of_guests || number_of_guests < 1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const { getSettingsForDate } = await import('@/lib/getBookingSettings');
    const settings = await getSettingsForDate(booking_date);
    const maxPerSlot = settings.maxBookingsPerSlot;
    if (number_of_guests > maxPerSlot) {
      return NextResponse.json(
        { error: `Number of guests cannot exceed ${maxPerSlot}.` },
        { status: 400 }
      );
    }

    const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    if (bookingDateTime <= oneHourFromNow) {
      return NextResponse.json(
        { error: 'Booking date and time must be at least 1 hour in the future' },
        { status: 400 }
      );
    }

    const raw30 = Array.isArray(settings.timeSlots30Min) && settings.timeSlots30Min.length > 0 ? settings.timeSlots30Min : getDefaultTimeSlots30Min();
    const raw60 = Array.isArray(settings.timeSlots60Min) && settings.timeSlots60Min.length > 0 ? settings.timeSlots60Min : getDefaultTimeSlots60Min();
    const slotsForDuration = validSlotDuration === 30 ? raw30.filter((s) => s.enabled) : raw60.filter((s) => s.enabled);
    const allowedTimes = new Set(slotsForDuration.map((s) => s.value));
    if (!allowedTimes.has(booking_time)) {
      return NextResponse.json(
        { error: 'This time slot is not available for booking.' },
        { status: 400 }
      );
    }
    const durations = settings.slotDurationsEnabled || { thirtyMinutes: true, sixtyMinutes: true };
    if (validSlotDuration === 30 && !durations.thirtyMinutes) {
      return NextResponse.json(
        { error: '30-minute slot duration is not currently available.' },
        { status: 400 }
      );
    }
    if (validSlotDuration === 60 && !durations.sixtyMinutes) {
      return NextResponse.json(
        { error: '60-minute slot duration is not currently available.' },
        { status: 400 }
      );
    }

    const existingBookings = await Booking.find({
      booking_date,
      booking_time,
      slot_duration: validSlotDuration,
      status: { $in: ['confirmed', 'pending'] },
    });
    const totalGuestsBooked = existingBookings.reduce((sum, booking) => sum + booking.number_of_guests, 0);

    if (totalGuestsBooked + number_of_guests > maxPerSlot) {
      const remainingSpots = maxPerSlot - totalGuestsBooked;
      if (remainingSpots <= 0) {
        return NextResponse.json(
          { error: `This time slot is fully booked. Maximum ${maxPerSlot} persons per slot.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Only ${remainingSpots} spot(s) remaining in this time slot. Please reduce the number of guests.` },
        { status: 400 }
      );
    }

    const pricePerPerson = getPriceForSlotDuration(validSlotDuration);
    const totalAmount = pricePerPerson * number_of_guests;

    const booking = await Booking.create({
      name,
      email,
      phone,
      booking_date,
      booking_time,
      slot_duration: validSlotDuration,
      number_of_guests,
      special_requests: special_requests || '',
      status: 'pending',
      payment_status: 'not_required',
      amount_paid: 0,
      currency: 'inr',
    });

    // Email will be sent after payment verification
    // Don't send email here - payment verification will trigger it

    return NextResponse.json(
      {
        id: booking._id,
        message: 'Booking request submitted successfully! We will contact you soon to confirm.',
        booking: {
          id: booking._id.toString(), // Ensure it's a string
          name,
          email,
          phone,
          booking_date,
          booking_time,
          slot_duration: validSlotDuration,
          number_of_guests,
          special_requests,
          status: 'pending',
          estimated_amount: totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
