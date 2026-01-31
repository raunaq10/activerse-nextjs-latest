import nodemailer from 'nodemailer';
import { IBooking } from '@/models/Booking';

export async function sendBookingConfirmationEmail(booking: IBooking): Promise<boolean> {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error('❌ Email configuration missing. Cannot send booking confirmation email.');
      console.error('EMAIL_USER:', emailUser ? `${emailUser.substring(0, 3)}***` : 'NOT SET');
      console.error('EMAIL_PASSWORD:', emailPassword ? 'SET' : 'NOT SET');
      console.error('Please set EMAIL_USER and EMAIL_PASSWORD in .env.local file');
      return false;
    }

    console.log('📧 Attempting to send booking confirmation email...');
    console.log('Recipient:', booking.email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    // Verify connection before sending
    console.log('Verifying email connection...');
    await transporter.verify();
    console.log('✓ Email connection verified successfully');

    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const bookingTime = booking.booking_time;
    const PRICE_PER_PERSON = 1500;
    const totalAmount = PRICE_PER_PERSON * booking.number_of_guests;
    const bookingId = booking._id?.toString() || 'N/A';

    const mailOptions = {
      from: emailUser,
      to: booking.email,
      subject: `Booking Confirmation - Activerse (Booking ID: ${bookingId})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-id { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .details { background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Booking Confirmed!</h1>
              <p>Thank you for booking with Activerse</p>
            </div>
            <div class="content">
              <div class="booking-id">
                <strong>Booking ID:</strong> <span style="font-size: 18px; color: #667eea;">${bookingId}</span>
              </div>
              
              <div class="details">
                <h2 style="color: #667eea; margin-top: 0;">Booking Details</h2>
                <div class="detail-row">
                  <span class="label">Name:</span> ${booking.name}
                </div>
                <div class="detail-row">
                  <span class="label">Email:</span> ${booking.email}
                </div>
                <div class="detail-row">
                  <span class="label">Phone:</span> ${booking.phone}
                </div>
                <div class="detail-row">
                  <span class="label">Booking Date:</span> ${bookingDate}
                </div>
                <div class="detail-row">
                  <span class="label">Booking Time:</span> ${bookingTime}
                </div>
                <div class="detail-row">
                  <span class="label">Number of Guests:</span> ${booking.number_of_guests}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> ₹${totalAmount.toLocaleString('en-IN')}
                </div>
                ${booking.payment_status === 'paid' ? `
                <div class="detail-row">
                  <span class="label">Amount Paid:</span> <span style="color: #4caf50; font-weight: bold;">₹${booking.amount_paid?.toLocaleString('en-IN') || totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> <span style="color: #4caf50; font-weight: bold;">PAID</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment ID:</span> ${booking.payment_intent_id || 'N/A'}
                </div>
                ` : ''}
                ${booking.special_requests ? `
                <div class="detail-row">
                  <span class="label">Special Requests:</span> ${booking.special_requests}
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="label">Status:</span> <span style="color: #ff9800; font-weight: bold;">${booking.status?.toUpperCase() || 'PENDING'}</span>
                </div>
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4caf50;">
                <h3 style="color: #4caf50; margin-top: 0;">${booking.payment_status === 'paid' ? '✅ Booking Confirmed!' : '📝 Important Information'}</h3>
                ${booking.payment_status === 'paid' ? `
                <p><strong>Your booking has been confirmed and payment has been received!</strong></p>
                <p>We look forward to seeing you at Activerse on ${bookingDate} at ${bookingTime}.</p>
                ` : `
                <p>Your booking request has been submitted successfully! Our team will contact you soon to confirm your booking.</p>
                `}
                <p><strong>Please save your Booking ID for future reference:</strong> ${bookingId}</p>
              </div>
              
              <div class="footer">
                <p>If you have any questions, please contact us at ${emailUser}</p>
                <p>© ${new Date().getFullYear()} Activerse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Booking confirmation email sent successfully to ${booking.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return false;
  }
}
