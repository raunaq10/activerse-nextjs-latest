import SupportPageLayout from '@/components/SupportPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <SupportPageLayout title="Privacy Policy">
      <div className="space-y-6 text-white/90 leading-relaxed">
          <section>
            <p className="text-white/70 italic">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
            <p>We collect the following information when you make a booking:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Booking date and time</li>
              <li>Number of guests</li>
              <li>Payment information (processed securely through Razorpay)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To process and confirm your bookings</li>
              <li>To send booking confirmations and updates</li>
              <li>To communicate with you about your visit</li>
              <li>To improve our services</li>
              <li>To send promotional emails (only if you subscribe to our newsletter)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              Payment information is processed securely through Razorpay and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              information only with:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Payment processors (Razorpay) for transaction processing</li>
              <li>Email service providers for sending confirmations</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Cookies</h2>
            <p>
              We use session cookies to maintain your login state and improve your experience. 
              These cookies are essential for the website to function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Us</h2>
            <p>
              For privacy-related questions or requests, contact us at:
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
