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
      console.error('Razorpay configuration missing:', {
        keyId: keyId ? 'SET' : 'MISSING',
        keySecret: keySecret ? 'SET' : 'MISSING',
      });
      return NextResponse.json(
        { 
          error: 'Payment gateway is not configured. Please contact administrator.',
          details: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.'
        },
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
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (multiply by 100)
      currency: currency,
      receipt: `booking_${booking_id}_${Date.now()}`, // Unique receipt ID
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
      
      console.log('✅ Razorpay order created successfully:', {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      });

      // Update booking with order ID (store for verification)
      await Booking.updateOne(
        { _id: booking_id },
        { $set: { payment_intent_id: order.id } }
      );

      // Return order details for client-side checkout
      // Note: key_id should be available via NEXT_PUBLIC_RAZORPAY_KEY_ID on client-side
      // But we also return it as fallback if NEXT_PUBLIC_ is not set
      return NextResponse.json({
        order_id: order.id, // Pass this to checkout
        amount: order.amount, // Amount in paise
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID, // Fallback if NEXT_PUBLIC_ not available
      });
    } catch (razorpayError: any) {
      console.error('Razorpay API error:', razorpayError);
      throw razorpayError;
    }
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to create payment order';
    if (error.message?.includes('key_id') || error.message?.includes('key')) {
      errorMessage = 'Payment gateway configuration error. Please check Razorpay API keys.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
