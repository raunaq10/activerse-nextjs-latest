import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const mongodbUri = process.env.MONGODB_URI;

  return NextResponse.json({
    status: 'Payment API Configuration Check',
    razorpay: {
      keyId: keyId ? `${keyId.substring(0, 10)}...` : '❌ NOT SET',
      keySecret: keySecret ? '✅ SET' : '❌ NOT SET',
      configured: !!(keyId && keySecret),
    },
    email: {
      user: emailUser ? `${emailUser.substring(0, 5)}...` : '❌ NOT SET',
      password: emailPassword ? '✅ SET' : '❌ NOT SET',
      configured: !!(emailUser && emailPassword),
    },
    database: {
      uri: mongodbUri ? '✅ SET' : '❌ NOT SET',
      configured: !!mongodbUri,
    },
    message: !(keyId && keySecret) 
      ? '⚠️ Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local'
      : '✅ Payment API is configured correctly',
  });
}
