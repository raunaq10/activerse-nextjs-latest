import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const nextPublicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const mongodbUri = process.env.MONGODB_URI;

  // Check if test mode keys are being used
  const isTestMode = keyId?.startsWith('rzp_test_');
  const isPublicTestMode = nextPublicKeyId?.startsWith('rzp_test_');

  let razorpayConnectionStatus = 'NOT_ATTEMPTED';
  if (keyId && keySecret) {
    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      // Try to list orders to verify connection
      await razorpay.orders.all({ count: 1 });
      razorpayConnectionStatus = 'CONNECTED';
    } catch (error: any) {
      razorpayConnectionStatus = `ERROR: ${error.message}`;
    }
  }

  return NextResponse.json({
    status: 'Payment API Configuration Check',
    razorpay: {
      keyId: keyId ? `${keyId.substring(0, 15)}...` : '❌ NOT SET',
      keySecret: keySecret ? '✅ SET' : '❌ NOT SET',
      nextPublicKeyId: nextPublicKeyId ? `${nextPublicKeyId.substring(0, 15)}...` : '❌ NOT SET',
      mode: isTestMode ? '🧪 TEST MODE' : isTestMode === false ? '🚀 LIVE MODE' : '❓ UNKNOWN',
      publicMode: isPublicTestMode ? '🧪 TEST MODE' : isPublicTestMode === false ? '🚀 LIVE MODE' : '❓ UNKNOWN',
      connectionStatus: razorpayConnectionStatus,
      configured: !!(keyId && keySecret),
      keysMatch: keyId === nextPublicKeyId,
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
    testMode: {
      enabled: isTestMode,
      testCards: isTestMode ? {
        success: '4111 1111 1111 1111',
        failure: '4000 0000 0000 0002',
        note: 'Use any future expiry date, any CVV, and any name'
      } : null,
    },
    message: !(keyId && keySecret) 
      ? '⚠️ Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local'
      : !isTestMode
      ? '⚠️ Using LIVE mode keys. Make sure this is intentional for production.'
      : keyId !== nextPublicKeyId
      ? '⚠️ Server and client keys do not match. Make sure NEXT_PUBLIC_RAZORPAY_KEY_ID matches RAZORPAY_KEY_ID.'
      : '✅ Payment API is configured correctly for TEST MODE',
  });
}
