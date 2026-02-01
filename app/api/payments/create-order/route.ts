import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export const dynamic = 'force-dynamic';

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: Request) {
  try {
    // Check Razorpay configuration first
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { booking_id, amount, currency = 'INR' } = body;

    if (!booking_id || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Step 1.1 - Create Razorpay Order in Server
    // Amount should be in paise (smallest currency unit)
    // For ₹1500, amount should be 150000 (1500 * 100)
    // Receipt must be max 40 characters (Razorpay requirement)
    const bookingIdStr = booking_id.toString();
    const shortBookingId = bookingIdStr.substring(bookingIdStr.length - 12); // Last 12 chars
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const receipt = `bk_${shortBookingId}_${timestamp}`; // Max 23 chars: bk_ + 12 + _ + 8
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (multiply by 100)
      currency: currency,
      receipt: receipt, // Unique receipt ID (max 40 chars)
      notes: {
        booking_id: booking_id.toString(),
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        number_of_guests: booking.number_of_guests.toString(),
      },
    };

    try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.create(options);

      // Update booking with order ID (store for verification)
      await Booking.updateOne(
        { _id: booking_id },
        { $set: { payment_intent_id: order.id } }
      );

      // Return order details for client-side checkout
      // Note: key_id should be available via NEXT_PUBLIC_RAZORPAY_KEY_ID on client-side
      return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (razorpayError: any) {
      // Handle validation errors (400)
      if (razorpayError.statusCode === 400) {
        return NextResponse.json(
          { error: 'Invalid order parameters. Please try again.' },
          { status: 400 }
        );
      }
      
      // Handle authentication errors (401)
      if (razorpayError.statusCode === 401) {
        return NextResponse.json(
          { error: 'Payment gateway authentication failed. Please contact support.' },
          { status: 401 }
        );
      }
      
      throw razorpayError;
    }
  } catch (error: any) {
    // Generic error response for production
    const statusCode = error.statusCode || 500;
    const errorMessage = statusCode === 400 
      ? 'Invalid request. Please check your input and try again.'
      : statusCode === 401
      ? 'Payment gateway authentication failed. Please contact support.'
      : 'Payment order creation failed. Please try again later.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
