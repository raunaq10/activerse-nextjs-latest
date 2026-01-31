import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

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
    const { name, email, phone, booking_date, booking_time, number_of_guests, special_requests } = body;

    if (!name || !email || !phone || !booking_date || !booking_time || !number_of_guests || number_of_guests < 1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const TimeSlot = (await import('@/models/TimeSlot')).default;
    const existingBookings = await Booking.find({
      booking_date,
      booking_time,
      status: { $in: ['confirmed', 'pending'] },
    });
    
    const totalGuestsBooked = existingBookings.reduce((sum, booking) => sum + booking.number_of_guests, 0);

    if (totalGuestsBooked + number_of_guests > 24) {
      const remainingSpots = 24 - totalGuestsBooked;
      if (remainingSpots <= 0) {
        return NextResponse.json(
          { error: 'This time slot is fully booked. Maximum 24 persons per slot.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: `Only ${remainingSpots} spot(s) remaining in this time slot. Please reduce the number of guests.` },
          { status: 400 }
        );
      }
    }

    let slot = await TimeSlot.findOne({ date: booking_date, time: booking_time });
    if (!slot) {
      try {
        slot = await TimeSlot.create({
          date: booking_date,
          time: booking_time,
          available_spots: 24,
          booked_spots: 0,
        });
      } catch (slotError: any) {
        if (slotError.code === 11000) {
          slot = await TimeSlot.findOne({ date: booking_date, time: booking_time });
        } else {
          throw slotError;
        }
      }
    }

    const PRICE_PER_PERSON = 1500;
    const totalAmount = PRICE_PER_PERSON * number_of_guests;

    const booking = await Booking.create({
      name,
      email,
      phone,
      booking_date,
      booking_time,
      number_of_guests,
      special_requests: special_requests || '',
      status: 'pending',
      payment_status: 'not_required',
      amount_paid: 0,
      currency: 'inr',
    });

    if (slot && slot._id) {
      await TimeSlot.updateOne(
        { _id: slot._id },
        { $inc: { booked_spots: number_of_guests } }
      );
    }

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
