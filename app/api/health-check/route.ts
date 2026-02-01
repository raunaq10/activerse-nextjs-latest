import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: any = {
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV !== 'production',
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 15)}...` : '❌ NOT SET',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? '✅ SET' : '❌ NOT SET',
      nextPublicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 15)}...` : '❌ NOT SET',
      mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? '🧪 TEST MODE' : process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? '🚀 LIVE MODE' : '❓ UNKNOWN',
      keysMatch: process.env.RAZORPAY_KEY_ID === process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      connectionStatus: 'NOT_TESTED',
    },
    email: {
      user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : '❌ NOT SET',
      password: process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET',
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '❌ NOT SET',
      contactEmail: process.env.CONTACT_EMAIL || '❌ NOT SET',
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      connectionStatus: 'NOT_TESTED',
    },
    database: {
      uri: process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET',
      configured: !!process.env.MONGODB_URI,
    },
  };

  // Test Razorpay Connection
  if (checks.razorpay.configured) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
      await razorpay.orders.all({ count: 1 });
      checks.razorpay.connectionStatus = '✅ CONNECTED';
    } catch (error: any) {
      checks.razorpay.connectionStatus = `❌ ERROR: ${error.message}`;
    }
  } else {
    checks.razorpay.connectionStatus = '⚠️ NOT CONFIGURED';
  }

  // Test Email Connection
  if (checks.email.configured) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASSWORD!,
        },
      });
      await transporter.verify();
      checks.email.connectionStatus = '✅ CONNECTED';
    } catch (error: any) {
      checks.email.connectionStatus = `❌ ERROR: ${error.message}`;
    }
  } else {
    checks.email.connectionStatus = '⚠️ NOT CONFIGURED';
  }

  // Overall Status
  const allConfigured = checks.razorpay.configured && checks.email.configured && checks.database.configured;
  const allConnected = 
    checks.razorpay.connectionStatus === '✅ CONNECTED' && 
    checks.email.connectionStatus === '✅ CONNECTED';

  return NextResponse.json({
    status: allConfigured && allConnected ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ CONFIGURATION ISSUES',
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      allConfigured,
      allConnected,
      readyForProduction: allConfigured && allConnected && checks.environment.isProduction && checks.razorpay.mode === '🚀 LIVE MODE',
      readyForTesting: allConfigured && allConnected && checks.razorpay.mode === '🧪 TEST MODE',
    },
    recommendations: [
      !checks.razorpay.configured && '⚠️ Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
      !checks.razorpay.keysMatch && '⚠️ RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID must match',
      !checks.email.configured && '⚠️ Set EMAIL_USER and EMAIL_PASSWORD',
      !checks.database.configured && '⚠️ Set MONGODB_URI',
      checks.environment.isProduction && checks.razorpay.mode === '🧪 TEST MODE' && '⚠️ Using TEST MODE keys in PRODUCTION - switch to LIVE keys',
      checks.environment.isDevelopment && checks.razorpay.mode === '🚀 LIVE MODE' && '⚠️ Using LIVE MODE keys in DEVELOPMENT - consider using TEST keys',
    ].filter(Boolean),
  });
}
