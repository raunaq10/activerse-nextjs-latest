'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    booking_date: '',
    booking_time: '',
    number_of_guests: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const PRICE_PER_PERSON = Number(process.env.NEXT_PUBLIC_PRICE_PER_PERSON) || 1500;
  const totalAmount = PRICE_PER_PERSON * formData.number_of_guests;

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, booking_date: prev.booking_date || today }));
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isOpen]);

  const handlePayment = async (bookingId: string, amount: number) => {
    try {
      setIsProcessingPayment(true);

      // Create payment order (Step 1.1 - Create Order in Server)
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: amount,
          currency: 'INR',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        const errorMsg = orderData.error || 'Failed to create payment order';
        throw new Error(errorMsg);
      }

      // Step 1.2 - Integrate with Checkout on Client-Side
      // Use NEXT_PUBLIC_RAZORPAY_KEY_ID for client-side access (as per Next.js docs)
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        throw new Error('Payment gateway is not configured. Please contact support.');
      }

      const options = {
        key: razorpayKeyId, // Enter the Key ID generated from the Dashboard (client-side accessible)
        amount: orderData.amount.toString(), // Amount is in currency subunits (paise)
        currency: orderData.currency,
        name: 'Activerse', // Your business name
        description: `Booking for ${formData.number_of_guests} guest(s) - Access to all game rooms`,
        order_id: orderData.order_id, // Pass the `id` obtained in the response of Step 1
        prefill: {
          // We recommend using the prefill parameter to auto-fill customer's contact information
          name: formData.name,
          email: formData.email,
          contact: formData.phone, // Provide the customer's phone number for better conversion rates
        },
        notes: {
          booking_id: bookingId,
          number_of_guests: formData.number_of_guests.toString(),
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
        },
        theme: {
          color: '#ec4899', // Activerse brand color
        },
        handler: async function (response: any) {
          // Step 1.3 - Handle Payment Success
          // Step 1.4 - Store Fields in Your Server
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            setIsProcessingPayment(true);
            
            // Step 1.5 - Verify Payment Signature
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              setSuccess(`Payment successful! Booking confirmed. Booking ID: #${bookingId}. Confirmation email sent to ${formData.email}`);
              setFormData({
                name: '',
                email: '',
                phone: '',
                booking_date: '',
                booking_time: '',
                number_of_guests: 1,
              });
              setTimeout(() => {
                onClose();
              }, 5000);
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact support with your Booking ID.');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setError(`Payment verification error: ${error.message || 'Please contact support with your Booking ID.'}`);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            setError('Payment was cancelled. Your booking is still pending. Please complete payment to confirm.');
          },
        },
      };

      // Initialize Razorpay checkout
      const rzp1 = new window.Razorpay(options);
      
      // Handle payment failure
      rzp1.on('payment.failed', function (response: any) {
        setError('Payment failed. Please try again or contact support.');
        setIsProcessingPayment(false);
      });

      // Open Razorpay checkout
      rzp1.open();
    } catch (error: any) {
      setError('Payment initialization failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.phone || !formData.booking_date || 
        !formData.booking_time || !formData.number_of_guests || formData.number_of_guests < 1) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking first
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitting(false);
        // Check if booking ID is valid
        if (!data.booking?.id) {
          setError('Booking created but ID is missing. Please contact support.');
          setIsSubmitting(false);
          return;
        }
        // Initiate payment
        await handlePayment(data.booking.id, totalAmount);
      } else {
        setError(data.error || 'Failed to submit booking. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setError(`Unable to submit booking: ${error.message || 'Please check your connection and try again.'}`);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Book Your Experience</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="booking-name">Full Name *</label>
            <input
              type="text"
              id="booking-name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-email">Email *</label>
            <input
              type="email"
              id="booking-email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-phone">Phone Number *</label>
            <input
              type="tel"
              id="booking-phone"
              name="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="booking-date">Date *</label>
              <input
                type="date"
                id="booking-date"
                name="booking_date"
                required
                min={today}
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-time">Time *</label>
              <select
                id="booking-time"
                name="booking_time"
                required
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                className="w-full"
              >
                <option value="">Select Time</option>
                <option value="12:00">12-1 PM</option>
                <option value="13:00">1-2 PM</option>
                <option value="14:00">2-3 PM</option>
                <option value="15:00">3-4 PM</option>
                <option value="16:00">4-5 PM</option>
                <option value="17:00">5-6 PM</option>
                <option value="18:00">6-7 PM</option>
                <option value="19:00">7-8 PM</option>
                <option value="20:00">8-9 PM</option>
                <option value="21:00">9-10 PM</option>
                <option value="22:00">10-11 PM</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="booking-guests">Number of Guests *</label>
              <input
                type="number"
                id="booking-guests"
                name="number_of_guests"
                min="1"
                max="50"
                required
                value={formData.number_of_guests}
                onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })}
                className="w-full"
              />
              <small className="text-white/70 text-sm mt-1 block">
                Price: ₹{PRICE_PER_PERSON.toLocaleString('en-IN')} per person
              </small>
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="form-group" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ec4899' }}>Total Amount:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <small className="text-white/70 text-sm mt-1 block">
              Payment will be processed securely via Razorpay
            </small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isSubmitting || isProcessingPayment}
            style={{ background: isSubmitting || isProcessingPayment ? '#666' : undefined }}
          >
            {isSubmitting ? 'Creating Booking...' : isProcessingPayment ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Book`}
          </button>
        </form>
      </div>
    </div>
  );
}
