'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BookingModal from '@/components/BookingModal';
import BookingSettingsModal from '@/components/BookingSettingsModal';

interface Booking {
  _id: string;
  name: string;
  email: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  slot_duration?: number;
  number_of_guests: number;
  status: string;
  payment_status: string;
  amount_paid: number;
}

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total_bookings: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [currentFilter, setCurrentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' });
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      loadBookings();
      loadStats();
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async (status = '') => {
    try {
      const url = status ? `/api/bookings?status=${status}` : '/api/bookings';
      const response = await fetch(url, { credentials: 'include' });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats', { credentials: 'include' });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking updated successfully!');
        loadBookings(currentFilter);
        loadStats();
      } else {
        alert('Error: ' + (data.error || 'Failed to update booking'));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking. Make sure the server is running.');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking deleted successfully!');
        loadBookings(currentFilter);
        loadStats();
      } else {
        alert('Error: ' + (data.error || 'Failed to delete booking'));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Make sure the server is running.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError('New passwords do not match');
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setChangePasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChangePasswordSuccess(data.message);
        setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
        }, 2000);
      } else {
        setChangePasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setChangePasswordError('Unable to connect to server. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
        <p style={{ color: 'var(--light-text)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .bookings-container {
            padding: 130px 10px 30px !important;
          }
          .bookings-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .stat-card {
            padding: 1rem !important;
          }
          .filters {
            gap: 0.5rem !important;
          }
          .bookings-table-container {
            border-radius: 10px !important;
          }
          .nav-menu {
            flex-direction: column;
            gap: 0.75rem !important;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.95);
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            display: none;
          }
          .nav-menu.active {
            display: flex;
          }
          .logo-image {
            max-height: 50px !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .filters button {
            flex: 1;
            min-width: calc(50% - 0.25rem);
          }
        }
      `}</style>
      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image
                src="/logo.png"
                alt="Activerse Logo"
                width={150}
                height={100}
                className="logo-image"
                style={{ height: 'auto', width: 'auto', maxHeight: '100px', objectFit: 'contain' }}
                priority
              />
            </Link>
          </div>
          <ul className="nav-menu" style={{ display: 'flex', listStyle: 'none', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li><Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>Back to Home</Link></li>
            <li><span style={{ color: '#4CAF50', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>Logged in: {user?.username}</span></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setIsChangePasswordModalOpen(true); }} style={{ color: '#fff', textDecoration: 'none', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', cursor: 'pointer' }}>Change Password</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#ec4899', textDecoration: 'none', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', cursor: 'pointer' }}>Logout</a></li>
          </ul>
        </div>
      </nav>

      <div className="bookings-container" style={{ padding: '150px 20px 50px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
        <div className="bookings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="section-title" style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, color: '#fff' }}>Booking Management</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="btn"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            >
              Booking Settings
            </button>
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="btn btn-primary" 
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: '#4CAF50', 
                color: 'white', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: 600, 
                transition: 'all 0.3s', 
                display: 'inline-block',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'clamp(0.9rem, 1.5vw, 1rem)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4CAF50'}
            >
              New Booking
            </button>
          </div>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem', color: '#4CAF50', fontWeight: 700 }}>{stats.total_bookings}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Total Bookings</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem', color: '#ffc107', fontWeight: 700 }}>{stats.pending}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Pending</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem', color: '#4CAF50', fontWeight: 700 }}>{stats.confirmed}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Confirmed</p>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem', color: '#dc3545', fontWeight: 700 }}>{stats.cancelled}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Cancelled</p>
          </div>
        </div>

        <div className="filters" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            className={`filter-btn ${currentFilter === '' ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: currentFilter === '' ? '#4CAF50' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentFilter === '' ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'}`,
              color: '#fff',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              fontWeight: 600,
            }}
            onClick={() => { setCurrentFilter(''); loadBookings(''); }}
            onMouseEnter={(e) => { if (currentFilter !== '') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { if (currentFilter !== '') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            All Bookings
          </button>
          <button
            className={`filter-btn ${currentFilter === 'pending' ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: currentFilter === 'pending' ? '#ffc107' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentFilter === 'pending' ? '#ffc107' : 'rgba(255, 255, 255, 0.1)'}`,
              color: '#fff',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              fontWeight: 600,
            }}
            onClick={() => { setCurrentFilter('pending'); loadBookings('pending'); }}
            onMouseEnter={(e) => { if (currentFilter !== 'pending') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { if (currentFilter !== 'pending') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${currentFilter === 'confirmed' ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: currentFilter === 'confirmed' ? '#4CAF50' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentFilter === 'confirmed' ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'}`,
              color: '#fff',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              fontWeight: 600,
            }}
            onClick={() => { setCurrentFilter('confirmed'); loadBookings('confirmed'); }}
            onMouseEnter={(e) => { if (currentFilter !== 'confirmed') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { if (currentFilter !== 'confirmed') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            Confirmed
          </button>
          <button
            className={`filter-btn ${currentFilter === 'cancelled' ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: currentFilter === 'cancelled' ? '#dc3545' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentFilter === 'cancelled' ? '#dc3545' : 'rgba(255, 255, 255, 0.1)'}`,
              color: '#fff',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
              fontWeight: 600,
            }}
            onClick={() => { setCurrentFilter('cancelled'); loadBookings('cancelled'); }}
            onMouseEnter={(e) => { if (currentFilter !== 'cancelled') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { if (currentFilter !== 'cancelled') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            Cancelled
          </button>
        </div>

        <div className="bookings-table-container" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '15px', overflowX: 'auto', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p style={{ fontSize: '1.1rem' }}>No bookings found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Time</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Guests</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Payment</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Total / Paid</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#4CAF50', fontWeight: 600, textTransform: 'uppercase', fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>#{booking._id.slice(-6)}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.name}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.email}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.phone}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', whiteSpace: 'nowrap' }}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.booking_time}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.slot_duration || 60} min</td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>{booking.number_of_guests}</td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                      <span
                        className={`status-badge status-${booking.status}`}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          background: booking.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' : booking.status === 'confirmed' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                          color: booking.status === 'pending' ? '#ffc107' : booking.status === 'confirmed' ? '#28a745' : '#dc3545',
                        }}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          background: booking.payment_status === 'paid' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                          color: booking.payment_status === 'paid' ? '#28a745' : '#ffc107',
                        }}
                      >
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-text)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#ec4899' }}>
                          ₹{((booking.number_of_guests || 1) * (booking.slot_duration === 30 ? (Number(process.env.NEXT_PUBLIC_SLOT_1_PRICE) || 1000) : (Number(process.env.NEXT_PUBLIC_SLOT_2_PRICE) || 1500))).toLocaleString('en-IN')}
                        </span>
                        {booking.payment_status === 'paid' && booking.amount_paid > 0 && (
                          <span style={{ fontSize: '0.85rem', color: '#4caf50' }}>
                            Paid: ₹{booking.amount_paid.toLocaleString('en-IN')}
                          </span>
                        )}
                        {booking.payment_status !== 'paid' && (
                          <span style={{ fontSize: '0.85rem', color: '#ff9800' }}>
                            Pending Payment
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {booking.status === 'pending' && (
                          <button
                            className="action-btn btn-accept"
                            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', background: '#17a2b8', color: 'white', fontWeight: 600, transition: 'all 0.3s' }}
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#138496'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#17a2b8'}
                          >
                            Accept
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            className="action-btn btn-cancel"
                            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', background: '#dc3545', color: 'white', fontWeight: 600, transition: 'all 0.3s' }}
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#c82333'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#dc3545'}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className="action-btn btn-delete"
                          style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', background: '#6c757d', color: 'white', fontWeight: 600, transition: 'all 0.3s' }}
                          onClick={() => deleteBooking(booking._id)}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="modal show" onClick={(e) => e.target === e.currentTarget && setIsChangePasswordModalOpen(false)}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setIsChangePasswordModalOpen(false)}>&times;</span>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password *</label>
                <input
                  type="password"
                  id="current-password"
                  required
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password *</label>
                <input
                  type="password"
                  id="new-password"
                  required
                  minLength={6}
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                />
                <small style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Must be at least 6 characters</small>
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password-change">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirm-password-change"
                  required
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                />
              </div>
              {changePasswordError && <div className="error-message">{changePasswordError}</div>}
              {changePasswordSuccess && <div className="success-message">{changePasswordSuccess}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          loadBookings(currentFilter);
          loadStats();
        }} 
      />

      {/* Booking Settings Modal */}
      <BookingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
}
