'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavigationProps {
  onBookingClick: () => void;
}

export default function Navigation({ onBookingClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Activerse Logo"
              className="logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('Logo image failed to load:', target.src);
                target.style.display = 'none';
              }}
            />
          </Link>
        </div>
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link href="/#home" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          </li>
          <li>
            <Link href="/#games" onClick={() => setIsMobileMenuOpen(false)}>Games</Link>
          </li>
          <li>
            <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          </li>
        </ul>
        <button className="cta-button" onClick={onBookingClick}>Book Now</button>
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
