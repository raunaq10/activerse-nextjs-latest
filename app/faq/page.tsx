import SupportPageLayout from '@/components/SupportPageLayout';

export default function FAQPage() {
  return (
    <SupportPageLayout title="Frequently Asked Questions">
      <div className="space-y-6 text-white/90 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">General Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What is Activerse?</h3>
              <p>
                Activerse is an immersive gaming and entertainment destination offering a variety of 
                interactive experiences and game rooms for all ages.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">Where is Activerse located?</h3>
              <p>
                Lower Ground floor, F11, 16&17, Golf Course Rd, DLF Phase 1, Sector 27, Gurugram, Haryana 122002
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What are your operating hours?</h3>
              <p>
                Please contact us for current operating hours and availability. You can reach us at 
                Activersepvtltd@gmail.com or +91 9729729347.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Booking Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">How do I make a booking?</h3>
              <p>
                You can book directly through our website by clicking the "Book Now" button. Select your 
                preferred date, time, and number of guests, then complete the payment to confirm your booking.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What is the price per person?</h3>
              <p>
                The price is ₹1500 per person for access to all game rooms and experiences.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">How many people can book at once?</h3>
              <p>
                Each time slot can accommodate up to 24 persons. You can book for any number of guests 
                up to this limit, subject to availability.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">Can I reschedule my booking?</h3>
              <p>
                Yes, you may reschedule your booking to a different date/time (subject to availability) 
                at no additional charge if requested at least 24 hours in advance. Please contact us 
                with your Booking ID to reschedule.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Payment Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What payment methods do you accept?</h3>
              <p>
                We accept online payments through Razorpay, which supports credit cards, debit cards, 
                UPI, net banking, and other popular payment methods.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">When will I receive my booking confirmation?</h3>
              <p>
                You will receive a booking confirmation email immediately after successful payment. 
                Please check your spam folder if you don't see it in your inbox.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Cancellation & Refund Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What is your cancellation policy?</h3>
              <p>
                Cancellations made less than 24 hours before your booking time, or no-shows, are not 
                eligible for refund. For detailed information, please see our{' '}
                <a href="/cancellation-refund" className="text-blue-400 hover:underline">
                  Cancellation & Refund Policy
                </a>.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">How do I cancel my booking?</h3>
              <p>
                To cancel your booking, please contact us via email at Activersepvtltd@gmail.com or 
                call us at +91 9729729347. Please include your Booking ID in your cancellation request.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Experience Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">What games and experiences are available?</h3>
              <p>
                We offer a variety of immersive gaming experiences including Air Shoot, Basket Ball, 
                Battle Arena, Laser Escape, Mega Grid, and Power Climb. All games are included in 
                your booking.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">Is there an age restriction?</h3>
              <p>
                Please contact us for specific age requirements for different experiences. Some games 
                may have age or height restrictions for safety reasons.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-2 text-white">Do I need to bring anything?</h3>
              <p>
                Just bring yourself and a sense of adventure! We provide all necessary equipment. 
                Wear comfortable clothing and closed-toe shoes for the best experience.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Contact & Support</h2>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <p className="mb-2">
              If you have any other questions or need assistance, please don't hesitate to contact us:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email: Activersepvtltd@gmail.com</li>
              <li>Phone: +91 9729729347</li>
            </ul>
          </div>
        </section>
      </div>
    </SupportPageLayout>
  );
}
