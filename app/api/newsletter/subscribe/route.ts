import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { sendNewsletterWelcomeEmail } from '@/lib/emailNotifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();
    const emailLower = email.trim().toLowerCase();

    const existingSubscriber = await Subscriber.findOne({ email: emailLower });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter.' },
          { status: 400 }
        );
      } else {
        existingSubscriber.active = true;
        existingSubscriber.subscribed_at = new Date();
        await existingSubscriber.save();

        // Send welcome email with contact and game details (async - don't block response)
        sendNewsletterWelcomeEmail(emailLower)
          .then((success) => {
            if (success) {
              console.log(`✅ Newsletter welcome email sent to: ${emailLower}`);
            } else {
              console.error(`❌ Failed to send newsletter welcome email to: ${emailLower}`);
            }
          })
          .catch((err) => {
            console.error('❌ Error sending newsletter welcome email:', err);
          });

        return NextResponse.json({
          message: 'Successfully resubscribed to our newsletter!',
          subscribed: true,
        });
      }
    }

    await Subscriber.create({
      email: emailLower,
      active: true,
    });

    // Send welcome email with contact and game details (async - don't block response)
    sendNewsletterWelcomeEmail(emailLower)
      .then((success) => {
        if (success) {
          console.log(`✅ Newsletter welcome email sent to: ${emailLower}`);
        } else {
          console.error(`❌ Failed to send newsletter welcome email to: ${emailLower}`);
        }
      })
      .catch((err) => {
        console.error('❌ Error sending newsletter welcome email:', err);
      });

    return NextResponse.json({
      message: 'Successfully subscribed to our newsletter!',
      subscribed: true,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This email is already subscribed to our newsletter.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to subscribe. Please try again later.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
