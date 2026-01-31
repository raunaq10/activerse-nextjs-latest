import SupportPageLayout from '@/components/SupportPageLayout';

export default function CancellationRefundPage() {
  return (
    <SupportPageLayout title="Cancellation and Refund Policy">
      <div className="space-y-6 text-white/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Cancellation Policy</h2>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Non-Refundable</h3>
                <p>
                  Cancellations made <strong>less than 24 hours</strong> before your booking time, 
                  or no-shows, are not eligible for refund.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Refund Process</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us via email or phone to request cancellation</li>
              <li>Provide your Booking ID and reason for cancellation</li>
              <li>If eligible, refund will be processed within 7-10 business days</li>
              <li>Refund will be credited to the original payment method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Rescheduling</h2>
            <p>
              Instead of cancellation, you may reschedule your booking to a different date/time 
              (subject to availability) at no additional charge if requested at least 24 hours in advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Special Circumstances</h2>
            <p>
              In case of emergencies or unforeseen circumstances, please contact us immediately. 
              We will review each case individually and may offer partial or full refunds at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact for Cancellations</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Email: Activersepvtltd@gmail.com</li>
              <li>Phone: +91 9729729347</li>
              <li>Please include your Booking ID in all cancellation requests</li>
            </ul>
          </section>
        </div>
    </SupportPageLayout>
  );
}
