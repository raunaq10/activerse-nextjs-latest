import nodemailer from 'nodemailer';
import { IBooking } from '@/models/Booking';

/**
 * Send booking notification email to admin when a new booking is created with payment
 */
export async function sendAdminBookingNotification(booking: IBooking): Promise<boolean> {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;

    if (!emailUser || !emailPassword) {
      console.error('❌ Email configuration missing. Cannot send admin notification.');
      return false;
    }

    console.log('📧 Sending admin booking notification...');
    console.log('Admin Email:', adminEmail);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    await transporter.verify();

    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const PRICE_PER_PERSON = 1500;
    const totalAmount = PRICE_PER_PERSON * booking.number_of_guests;
    const bookingId = booking._id?.toString() || 'N/A';

    const mailOptions = {
      from: emailUser,
      to: adminEmail,
      subject: `🎉 New Booking Confirmed - Activerse (Booking ID: ${bookingId})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-id { background: #fff; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0; border-radius: 5px; }
            .details { background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #ec4899; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .payment-badge { background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>New Booking Confirmed!</h1>
              <p>Payment received successfully</p>
            </div>
            <div class="content">
              <div class="booking-id">
                <strong>Booking ID:</strong> <span style="font-size: 18px; color: #ec4899;">${bookingId}</span>
                <span class="payment-badge" style="margin-left: 10px;">PAID</span>
              </div>
              
              <div class="details">
                <h2 style="color: #ec4899; margin-top: 0;">Customer Details</h2>
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
                  <span class="label">Booking Time:</span> ${booking.booking_time}
                </div>
                <div class="detail-row">
                  <span class="label">Number of Guests:</span> ${booking.number_of_guests}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> ₹${totalAmount.toLocaleString('en-IN')}
                </div>
                <div class="detail-row">
                  <span class="label">Amount Paid:</span> <span style="color: #4caf50; font-weight: bold;">₹${booking.amount_paid?.toLocaleString('en-IN') || totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> <span class="payment-badge">${booking.payment_status?.toUpperCase() || 'PAID'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment ID:</span> ${booking.payment_intent_id || 'N/A'}
                </div>
                <div class="detail-row">
                  <span class="label">Booking Status:</span> <span style="color: #4caf50; font-weight: bold;">${booking.status?.toUpperCase() || 'CONFIRMED'}</span>
                </div>
                ${booking.special_requests ? `
                <div class="detail-row">
                  <span class="label">Special Requests:</span> ${booking.special_requests}
                </div>
                ` : ''}
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ec4899;">
                <h3 style="color: #ec4899; margin-top: 0;">📋 Action Required</h3>
                <p>This booking has been confirmed and payment has been received. Please prepare for the customer's visit on <strong>${bookingDate}</strong> at <strong>${booking.booking_time}</strong>.</p>
                <p><strong>View booking details in admin panel:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/bookings">Admin Dashboard</a></p>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Activerse Booking System</p>
                <p>© ${new Date().getFullYear()} Activerse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Admin booking notification sent successfully to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin booking notification:', error);
    return false;
  }
}
