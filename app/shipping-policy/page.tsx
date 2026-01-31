import SupportPageLayout from '@/components/SupportPageLayout';

export default function ShippingPolicyPage() {
  return (
    <SupportPageLayout title="Shipping Policy">
      <div className="space-y-6 text-white/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Physical Services</h2>
            <p>
              Activerse provides in-person entertainment and gaming services at our physical location. 
              We do not ship physical products. All bookings are for on-site experiences at our facility 
              located at Lower Ground floor, F11, 16&17, Golf Course Rd, DLF Phase 1, Sector 27, Gurugram, Haryana 122002.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Service Delivery</h2>
            <p>
              Services are delivered at the time of your scheduled booking. Please arrive at least 
              15 minutes before your scheduled time to complete check-in procedures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Booking Confirmation</h2>
            <p>
              Upon successful payment, you will receive a booking confirmation email with all details 
              including your Booking ID, date, time, and number of guests. Please keep this confirmation 
              for your records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact</h2>
            <p>
              For any questions regarding your booking or service delivery, please contact us at:
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
