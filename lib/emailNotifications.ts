import nodemailer from 'nodemailer';
import { IBooking } from '@/models/Booking';

export async function sendBookingConfirmationEmail(booking: IBooking): Promise<boolean> {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      // Works in both development and production
      secure: true,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
      },
    });

    // Verify connection before sending
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      throw verifyError;
    }

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
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Send welcome email to newsletter subscribers with contact and game details
 */
export async function sendNewsletterWelcomeEmail(email: string): Promise<boolean> {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      // Works in both development and production
      secure: true,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
      },
    });

    // Verify connection before sending
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      throw verifyError;
    }

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: 'Welcome to Activerse - Your Ultimate Gaming Experience Awaits!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: #fff; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .section h2 { color: #4CAF50; margin-top: 0; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
            .game-item { padding: 15px; margin: 10px 0; background: #f5f5f5; border-left: 4px solid #4CAF50; border-radius: 5px; }
            .game-item h3 { margin: 0 0 5px 0; color: #333; }
            .game-item p { margin: 0; color: #666; }
            .contact-info { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info p { margin: 8px 0; }
            .contact-info strong { color: #4CAF50; }
            .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
            .social-links { text-align: center; margin: 20px 0; }
            .social-links a { color: #4CAF50; text-decoration: none; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🎮 Welcome to Activerse! 🎮</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your Ultimate Gaming & Entertainment Destination</p>
            </div>
            <div class="content">
              <div class="section">
                <h2>Thank You for Subscribing!</h2>
                <p>We're thrilled to have you join the Activerse community! You'll now receive exclusive updates about:</p>
                <ul>
                  <li>🎯 New games and immersive experiences</li>
                  <li>💰 Special offers and promotions</li>
                  <li>🏆 Events and tournaments</li>
                  <li>📢 Latest news and updates</li>
                  <li>🎉 Exclusive member-only deals</li>
                </ul>
              </div>

              <div class="section">
                <h2>🎮 Our Amazing Games</h2>
                <p>Experience the ultimate gaming adventure with our state-of-the-art game rooms:</p>
                
                <div class="game-item">
                  <h3>⚡ POWER CLIMB</h3>
                  <p>Challenge your limits and climb to victory in this adrenaline-pumping experience!</p>
                </div>
                
                <div class="game-item">
                  <h3>🎯 AIR SHOOT</h3>
                  <p>Test your aim and precision in this exciting shooting challenge!</p>
                </div>
                
                <div class="game-item">
                  <h3>🏀 BASKET BALL</h3>
                  <p>Show off your basketball skills in our interactive court!</p>
                </div>
                
                <div class="game-item">
                  <h3>⚔️ BATTLE ARENA</h3>
                  <p>Enter the arena and compete in epic battles!</p>
                </div>
                
                <div class="game-item">
                  <h3>🔴 LASER ESCAPE</h3>
                  <p>Navigate through laser obstacles in this thrilling escape room experience!</p>
                </div>
                
                <div class="game-item">
                  <h3>🎲 MEGA GRID</h3>
                  <p>Solve puzzles and conquer the mega grid challenge!</p>
                </div>
              </div>

              <div class="section">
                <h2>📍 Visit Us</h2>
                <div class="contact-info">
                  <p><strong>📍 Address:</strong><br>
                  Lower Ground floor, F11, 16&17, Golf Course Rd,<br>
                  DLF Phase 1, Sector 27,<br>
                  Gurugram, Haryana 122002</p>
                  
                  <p><strong>📧 Email:</strong> Activersepvtltd@gmail.com</p>
                  
                  <p><strong>📞 Phone:</strong> +91 9729729347</p>
                  
                  <p><strong>💰 Price:</strong> ₹1500 per person (Access to all game rooms)</p>
                </div>
              </div>

              <div class="section" style="text-align: center;">
                <h2>Ready to Experience Activerse?</h2>
                <p>Book your slot now and get ready for an unforgettable gaming adventure!</p>
                <a href="https://www.activerse.co.in" class="cta-button">Book Now</a>
              </div>

              <div class="social-links">
                <p>Follow us for updates:</p>
                <a href="https://www.instagram.com/activerse_gurgaon?utm_source=ig_web_button_share_sheet&igsh=ZDNlODBiNWFlZA==" target="_blank">📷 Instagram</a>
              </div>

              <div class="footer">
                <p>You're receiving this email because you subscribed to the Activerse newsletter.</p>
                <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
                <p>© ${new Date().getFullYear()} Activerse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    return false;
  }
}
