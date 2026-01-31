'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Successfully subscribed to our newsletter!');
        setEmail('');
        setMessage('');
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Unable to subscribe. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full sm:flex-1"
      />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
