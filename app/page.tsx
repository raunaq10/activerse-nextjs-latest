'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import BookingModal from '@/components/BookingModal';
import NewsletterForm from '@/components/NewsletterForm';
import GameCard from '@/components/GameCard';

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    // Handle hash navigation when coming from other pages
    const handleHashNavigation = () => {
      if (window.location.hash) {
        const hash = window.location.hash;
        if (hash.length > 1) {
          setTimeout(() => {
            try {
              const element = document.querySelector(hash);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } catch (error) {
              console.warn('Invalid hash selector:', hash);
            }
          }, 100);
        }
      }
    };

    // Smooth scrolling for navigation links on the same page
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        // Only handle anchor links that start with # and have a valid selector (not just "#")
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          try {
            const element = document.querySelector(href);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (error) {
            // Invalid selector, ignore
            console.warn('Invalid selector:', href);
          }
        }
      }
    };

    // Handle initial hash navigation
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <>
      <Navigation onBookingClick={() => setIsBookingModalOpen(true)} />
      
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background">
          <div className="particles"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="glitch">ACTIVERSE</span>
          </h1>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => setIsBookingModalOpen(true)}>
              Book Now
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.open('https://www.instagram.com/reel/DTDqfoRkzZ1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', '_blank', 'noopener,noreferrer')}
            >
              Watch Trailer
            </button>
          </div>
          <p className="hero-subtitle">Enter a world where fitness meets fun and games get real.</p>
          <p className="hero-description">
            Jump, climb, dodge, and think your way through high - energy challenges designed to move your body and test your mind. Compete with friends across immersive, tech - powered game rooms that respond in real time — delivering a thrilling, sweat - filled experience you'll want to repeat.
          </p>
        </div>
        <div className="scroll-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Activerse?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Competitive Gaming</h3>
              <p>Join tournaments and compete with players from around the world. Leaderboards and prizes await.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍕</div>
              <h3>Food & Drinks</h3>
              <p>Refuel with our delicious selection of food, drinks, and snacks to keep you energized.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Party Packages</h3>
              <p>Perfect for birthdays, corporate events, and group celebrations. Custom packages available.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Premium Service</h3>
              <p>Friendly staff, clean facilities, and top-notch customer service throughout your visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="games">
        <div className="container">
          <h2 className="section-title">Featured Games</h2>
          <div className="games-grid">
            <GameCard
              image="/games/power-climb.jpg"
              alt="POWER CLIMB"
              title="POWER CLIMB"
              description="Challenge your limits and climb to victory"
              gradient="bg-gradient-to-br from-purple-600 via-orange-500 via-orange-400 to-yellow-400"
              iconBg="bg-yellow-400 border-yellow-400"
              iconColor="text-orange-600"
              iconShadow="shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              titleColor="text-yellow-400"
              badgeText="New"
              badgeBg="bg-orange-600/90"
              badgeColor="text-yellow-400"
            />
            <GameCard
              image="/games/mega-grid.jpg"
              alt="MEGA GRID"
              title="MEGA GRID"
              description="Navigate the digital grid and dominate"
              gradient="bg-gradient-to-br from-black via-purple-800 via-pink-600 to-pink-400"
              iconBg="bg-pink-500 border-pink-500"
              iconColor="text-white"
              iconShadow="shadow-[0_0_20px_rgba(255,20,147,0.8)]"
              titleColor="text-pink-500"
              badgeText="Popular"
              badgeBg="bg-pink-600/90"
              badgeColor="text-white"
            />
            <GameCard
              image="/games/laser-escape.jpg"
              alt="LASER ESCAPE"
              title="LASER ESCAPE"
              description="Dodge lasers and escape the maze"
              gradient="bg-gradient-to-br from-black via-blue-600 via-cyan-500 to-cyan-300"
              iconBg="bg-cyan-300 border-cyan-300"
              iconColor="text-black"
              iconShadow="shadow-[0_0_20px_rgba(0,255,255,0.8)]"
              titleColor="text-cyan-300"
              badgeText="Hot"
              badgeBg="bg-cyan-500/90"
              badgeColor="text-white"
            />
            <GameCard
              image="/games/battle-arena.jpg"
              alt="BATTLE ARENA"
              title="BATTLE ARENA"
              description="Enter the arena and prove your skills"
              gradient="bg-gradient-to-br from-black via-indigo-800 via-blue-600 to-lime-400"
              iconBg="bg-lime-400 border-lime-400"
              iconColor="text-black"
              iconShadow="shadow-[0_0_20px_rgba(57,255,20,0.8)]"
              titleColor="text-lime-400"
              badgeText="Classic"
              badgeBg="bg-lime-500/90"
              badgeColor="text-black"
            />
            <GameCard
              image="/games/air-shoot.jpg"
              alt="AIR SHOOT"
              title="AIR SHOOT"
              description="Take aim and dominate the skies"
              gradient="bg-gradient-to-br from-black via-indigo-900 via-purple-600 to-lime-400"
              iconBg="bg-lime-400 border-lime-400"
              iconColor="text-black"
              iconShadow="shadow-[0_0_20px_rgba(57,255,20,0.8)]"
              titleColor="text-lime-400"
              badgeText="Exclusive"
              badgeBg="bg-purple-600/90"
              badgeColor="text-lime-400"
            />
            <GameCard
              image="/games/basket-ball.jpg"
              alt="BASKET BALL"
              title="BASKET BALL"
              description="Shoot for the stars and score big"
              gradient="bg-gradient-to-br from-black via-indigo-900 via-purple-800 via-pink-600 to-yellow-400"
              iconBg="bg-yellow-400 border-yellow-400"
              iconColor="text-orange-600"
              iconShadow="shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              titleColor="text-yellow-400"
              badgeText="Fun"
              badgeBg="bg-yellow-400/90"
              badgeColor="text-indigo-900"
              iconPosition="right"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">VISIT US</h2>
              <p>Come experience the future of entertainment at Activerse. We're open 7 days a week!</p>
              <div className="info-item">
                <strong>📍 Address:</strong>
                <p>Lower Ground floor, F11, 16&17, Golf Course Rd, DLF Phase 1, Sector 27, Gurugram, Haryana 122002</p>
              </div>
              <div className="info-item">
                <strong>🕐 Hours:</strong>
                <p>Mon-Sun : 11:00am - 10:00pm</p>
              </div>
              <div className="info-item">
                <strong>📞 Phone:</strong>
                <p>+91 9729729347</p>
              </div>
              <div className="info-item">
                <strong>✉️ Email:</strong>
                <p>Activersepvtltd@gmail.com</p>
              </div>
              <div className="social-links">
                <a
                  href="https://www.instagram.com/activerse_gurgaon?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#games">Games</a></li>
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

      {/* Admin Login Button (matches live site) */}
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
