import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const contactEmail = process.env.CONTACT_EMAIL || emailUser;

    if (!emailUser || !emailPassword) {
      console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local file');
      return NextResponse.json(
        { error: 'Contact form is not configured. Please contact the administrator directly.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: contactEmail,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later or contact us directly.' },
      { status: 500 }
    );
  }
}
