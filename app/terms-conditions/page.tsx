import Link from 'next/link';
import SupportPageLayout from '@/components/SupportPageLayout';

export default function TermsConditionsPage() {
  return (
    <SupportPageLayout title="Terms and Conditions">
      <div className="space-y-6 text-white/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Activerse services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Booking and Payment</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All bookings must be made through our official booking system</li>
              <li>Payment must be completed at the time of booking</li>
              <li>Price is ₹1500 per person for access to all game rooms</li>
              <li>Bookings are confirmed only after successful payment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Cancellation and Refund Policy</h2>
            <p className="mb-4">
              For detailed cancellation and refund information, please see our{' '}
              <Link href="/cancellation-refund" className="text-white underline hover:text-white/80">
                Cancellation and Refund Policy
              </Link>.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Cancellations made 24 hours before the booking time are eligible for full refund</li>
              <li>Cancellations made less than 24 hours before booking are not eligible for refund</li>
              <li>No-shows will not be eligible for refund</li>
              <li>Refunds will be processed within 7-10 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Safety and Conduct</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All participants must follow safety instructions provided by staff</li>
              <li>Activerse reserves the right to refuse service to anyone</li>
              <li>Damages to equipment will be charged to the responsible party</li>
              <li>Intoxicated or disruptive behavior will result in immediate removal without refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Liability</h2>
            <p>
              Activerse is not liable for any injuries, damages, or losses that may occur during your visit. 
              Participants engage in activities at their own risk. We recommend appropriate insurance coverage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Contact Information</h2>
            <p>
              For questions about these terms, contact us at:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email: Activersepvtltd@gmail.com</li>
              <li>Phone: +91 9729729347</li>
            </ul>
          </section>
        </div>
    </SupportPageLayout>
  );
}
