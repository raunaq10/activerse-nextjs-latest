import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import nodemailer from 'nodemailer';

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

        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        if (emailUser && emailPassword) {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: emailUser,
                pass: emailPassword,
              },
            });

            await transporter.sendMail({
              from: emailUser,
              to: emailLower,
              subject: 'Welcome back to Activerse Newsletter!',
              html: `
                <h2>Welcome back to Activerse!</h2>
                <p>Thank you for resubscribing to our newsletter. You'll receive updates about:</p>
                <ul>
                  <li>New games and experiences</li>
                  <li>Special offers and promotions</li>
                  <li>Events and tournaments</li>
                  <li>Latest news and updates</li>
                </ul>
                <p>We're excited to have you back!</p>
                <p>Best regards,<br>The Activerse Team</p>
              `,
            });
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }
        }

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

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (emailUser && emailPassword) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });

        await transporter.sendMail({
          from: emailUser,
          to: emailLower,
          subject: 'Welcome to Activerse Newsletter!',
          html: `
            <h2>Welcome to Activerse!</h2>
            <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
            <ul>
              <li>New games and experiences</li>
              <li>Special offers and promotions</li>
              <li>Events and tournaments</li>
              <li>Latest news and updates</li>
            </ul>
            <p>We're excited to have you with us!</p>
            <p>Best regards,<br>The Activerse Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

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
