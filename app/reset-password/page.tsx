'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message + ' Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError('Unable to connect to server. Please make sure the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--dark-bg)' }}>
      <div className="reset-card" style={{ background: 'var(--darker-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '3rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
        <Link href="/login" className="back-link" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem', transition: 'color 0.3s' }}>
          ← Back to Login
        </Link>
        <div className="reset-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '2rem', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--gray-text)' }}>Enter your reset token and new password</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">Reset Token</label>
            <input
              type="text"
              id="token"
              name="token"
              required
              autoFocus
              placeholder="Paste the reset token here"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              name="newPassword"
              required
              minLength={6}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <small style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Must be at least 6 characters</small>
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
