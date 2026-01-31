'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';
import NewsletterForm from './NewsletterForm';
import BookingModal from './BookingModal';

interface SupportPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SupportPageLayout({ children, title }: SupportPageLayoutProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <Navigation onBookingClick={() => setIsBookingModalOpen(true)} />
      
      <main className="min-h-screen bg-black text-white pt-24 pb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto px-5">
            <Link href="/" className="text-white/70 hover:text-white mb-8 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 uppercase tracking-wide">{title}</h1>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ACTIVERSE</h3>
              <p>The ultimate destination for immersive gaming and entertainment.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/#home" scroll={false}>Home</Link></li>
                <li><Link href="/#about" scroll={false}>About</Link></li>
                <li><Link href="/#games" scroll={false}>Games</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions">Terms of Service</Link></li>
                <li><Link href="/cancellation-refund">Cancellation & Refund</Link></li>
                <li><Link href="/shipping-policy">Shipping Policy</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Newsletter</h4>
              <p>Subscribe for updates and special offers</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="footer-bottom">
            <p>2026 Activerse</p>
          </div>
        </div>
      </footer>

      {/* Admin Login Button */}
      <Link
        href="/login"
        className="admin-link fixed bottom-5 right-5 bg-[#ec4899] text-white p-4 rounded-full no-underline z-[999] shadow-[0_5px_20px_rgba(236,72,153,0.4)] hover:scale-110 transition-transform"
        title="Admin Login"
      >
        🔐
      </Link>

      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </>
  );
}
