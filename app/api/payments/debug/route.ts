import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Disable debug endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '❌ NOT SET',
      keyIdLength: process.env.RAZORPAY_KEY_ID?.length || 0,
      keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8) || 'N/A',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? '✅ SET' : '❌ NOT SET',
      keySecretLength: process.env.RAZORPAY_KEY_SECRET?.length || 0,
      nextPublicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '❌ NOT SET',
      keysMatch: process.env.RAZORPAY_KEY_ID === process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'TEST' : process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE' : 'UNKNOWN',
      testConnection: 'NOT_TESTED',
    },
    email: {
      user: process.env.EMAIL_USER || '❌ NOT SET',
      password: process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET',
      passwordLength: process.env.EMAIL_PASSWORD?.length || 0,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '❌ NOT SET',
      testConnection: 'NOT_TESTED',
    },
  };

  // Test Razorpay Connection
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      
      // Try to create a test order (smallest amount)
      const testOrder = await razorpay.orders.create({
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`,
      });
      
      diagnostics.razorpay.testConnection = '✅ CONNECTED';
      diagnostics.razorpay.testOrderId = testOrder.id;
    } catch (error: any) {
      diagnostics.razorpay.testConnection = `❌ FAILED: ${error.error?.description || error.message || 'Unknown error'}`;
      diagnostics.razorpay.testError = {
        statusCode: error.statusCode,
        code: error.error?.code,
        description: error.error?.description,
      };
      
      if (error.statusCode === 401) {
        diagnostics.razorpay.suggestions = [
          'Check if RAZORPAY_KEY_ID is correct (should start with rzp_test_ or rzp_live_)',
          'Check if RAZORPAY_KEY_SECRET is correct (should be 32+ characters)',
          'Verify keys are from the same Razorpay account',
          'Verify keys are from the same mode (both test or both live)',
          'Get fresh keys from: https://dashboard.razorpay.com/app/keys',
        ];
      }
    }
  } else {
    diagnostics.razorpay.testConnection = '⚠️ NOT CONFIGURED';
  }

  // Test Email Connection
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: true,
        tls: {
          rejectUnauthorized: false,
        },
      });
      
      await transporter.verify();
      diagnostics.email.testConnection = '✅ CONNECTED';
    } catch (error: any) {
      diagnostics.email.testConnection = `❌ FAILED: ${error.message || 'Unknown error'}`;
      diagnostics.email.testError = {
        code: error.code,
        command: error.command,
        response: error.response,
      };
      
      if (error.code === 'EAUTH') {
        diagnostics.email.suggestions = [
          'EMAIL_PASSWORD must be an App Password, not your regular Gmail password',
          'Enable 2-Step Verification: Google Account > Security > 2-Step Verification',
          'Create App Password: Google Account > Security > 2-Step Verification > App Passwords',
          'Select "Mail" and device, then copy the 16-character password',
          'Use the App Password (not your regular password) in EMAIL_PASSWORD',
        ];
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        diagnostics.email.suggestions = [
          'Check your internet connection',
          'Gmail SMTP might be blocked by firewall',
          'Try using a different network',
        ];
      }
    }
  } else {
    diagnostics.email.testConnection = '⚠️ NOT CONFIGURED';
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
