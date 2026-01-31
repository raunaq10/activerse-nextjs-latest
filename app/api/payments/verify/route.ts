import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingConfirmationEmail } from '@/lib/emailNotifications';
import { sendAdminBookingNotification } from '@/lib/adminEmailNotification';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Step 1.5 - Verify Payment Signature
    // Create the signature string: order_id|payment_id
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Generate HMAC SHA256 signature using your key secret
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    // Compare generated signature with received signature
    if (generated_signature !== razorpay_signature) {
      console.error('Signature verification failed:', {
        generated: generated_signature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { error: 'Payment verification failed - Invalid signature' },
        { status: 400 }
      );
    }

    // Update booking with payment details
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const PRICE_PER_PERSON = 1500;
    const totalAmount = PRICE_PER_PERSON * booking.number_of_guests;

    await Booking.updateOne(
      { _id: booking_id },
      {
        $set: {
          payment_status: 'paid',
          payment_intent_id: razorpay_payment_id,
          amount_paid: totalAmount,
          status: 'confirmed',
        },
      }
    );

    // Send confirmation emails
    const updatedBooking = await Booking.findById(booking_id);
    if (updatedBooking) {
      // Send email to customer
      sendBookingConfirmationEmail(updatedBooking).catch((err) => {
        console.error('Failed to send booking confirmation email to customer:', err);
      });
      
      // Send email to admin
      sendAdminBookingNotification(updatedBooking).catch((err) => {
        console.error('Failed to send admin booking notification:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking_id: booking_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
