'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.push('/bookings');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          router.push('/bookings');
        }, 500);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please make sure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--dark-bg)' }}>
      <div className="login-card" style={{ background: 'var(--darker-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '3rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
        <Link href="/" className="back-link" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', transition: 'color 0.3s' }}>
          ← Back to Home
        </Link>
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '2rem', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            ACTIVERSE
          </h1>
          <p style={{ color: 'var(--gray-text)' }}>Admin Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              autoFocus
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
