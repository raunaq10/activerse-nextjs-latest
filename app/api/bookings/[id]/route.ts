import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TimeSlot from '@/models/TimeSlot';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params;

    const { status, booking_date, booking_time, number_of_guests } = await request.json();
    const updateFields: any = { updated_at: new Date() };

    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const newBookingDate = booking_date || existingBooking.booking_date;
    const newBookingTime = booking_time || existingBooking.booking_time;
    const newNumberOfGuests = number_of_guests || existingBooking.number_of_guests;

    if (status && status !== existingBooking.status) {
      if (status === 'cancelled' && existingBooking.status === 'confirmed') {
        await TimeSlot.updateOne(
          { date: existingBooking.booking_date, time: existingBooking.booking_time },
          { $inc: { booked_spots: -existingBooking.number_of_guests } }
        );
      } else if (status === 'confirmed' && existingBooking.status !== 'confirmed') {
        const existingBookings = await Booking.find({
          booking_date: existingBooking.booking_date,
          booking_time: existingBooking.booking_time,
          status: 'confirmed',
          _id: { $ne: id },
        });
        const totalGuestsBooked = existingBookings.reduce((sum, booking) => sum + booking.number_of_guests, 0);

        if (totalGuestsBooked + existingBooking.number_of_guests > 24) {
          return NextResponse.json(
            { error: 'Cannot confirm booking. This time slot is fully booked. Maximum 24 persons per slot.' },
            { status: 400 }
          );
        }

        await TimeSlot.updateOne(
          { date: existingBooking.booking_date, time: existingBooking.booking_time },
          { $inc: { booked_spots: existingBooking.number_of_guests } }
        );
      }
    }

    if ((booking_date || booking_time || number_of_guests) && existingBooking.status === 'confirmed') {
      const existingBookings = await Booking.find({
        booking_date: newBookingDate,
        booking_time: newBookingTime,
        status: 'confirmed',
        _id: { $ne: id },
      });
      const totalGuestsBooked = existingBookings.reduce((sum, booking) => sum + booking.number_of_guests, 0);

      if (totalGuestsBooked + newNumberOfGuests > 24) {
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

      if (booking_date || booking_time) {
        await TimeSlot.updateOne(
          { date: existingBooking.booking_date, time: existingBooking.booking_time },
          { $inc: { booked_spots: -existingBooking.number_of_guests } }
        );
        await TimeSlot.updateOne(
          { date: newBookingDate, time: newBookingTime },
          { $inc: { booked_spots: newNumberOfGuests } }
        );
      } else if (number_of_guests && number_of_guests !== existingBooking.number_of_guests) {
        const guestDifference = number_of_guests - existingBooking.number_of_guests;
        await TimeSlot.updateOne(
          { date: newBookingDate, time: newBookingTime },
          { $inc: { booked_spots: guestDifference } }
        );
      }
    }

    if (status) updateFields.status = status;
    if (booking_date) updateFields.booking_date = booking_date;
    if (booking_time) updateFields.booking_time = booking_time;
    if (number_of_guests) updateFields.number_of_guests = number_of_guests;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({ message: 'Booking updated successfully', booking });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await connectDB();
    const { id } = await params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    await Booking.deleteOne({ _id: id });
    await TimeSlot.updateOne(
      { date: booking.booking_date, time: booking.booking_time },
      { $inc: { booked_spots: -booking.number_of_guests } }
    );

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
