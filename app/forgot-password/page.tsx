'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetToken('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError('Unable to connect to server. Please make sure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--dark-bg)' }}>
      <div className="forgot-card" style={{ background: 'var(--darker-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '3rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
        <Link href="/login" className="back-link" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', transition: 'color 0.3s' }}>
          ← Back to Login
        </Link>
        <div className="forgot-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '2rem', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            Forgot Password
          </h1>
          <p style={{ color: 'var(--gray-text)' }}>Enter your email to reset your password</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {resetToken && (
            <div className="reset-token-display" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', padding: '1rem', marginTop: '1rem', wordBreak: 'break-all' }}>
              <strong style={{ color: 'var(--primary-color)', display: 'block', marginBottom: '0.5rem' }}>Reset Token (for testing):</strong>
              <code style={{ color: 'var(--light-text)', fontSize: '0.9rem' }}>{resetToken}</code>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-text)' }}>
                Copy this token and use it on the <Link href="/reset-password" style={{ color: 'var(--primary-color)' }}>Reset Password</Link> page.
                <br />
                <small>Note: In production, this would be sent via email.</small>
              </p>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
