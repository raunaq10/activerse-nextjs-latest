'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface TimeSlotOption {
  value: string;
  label: string;
  enabled: boolean;
}

interface SlotAvailability {
  booked: number;
  max: number;
  isFull: boolean;
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
    slot_duration: 60 as 30 | 60, // Default to 1 hour
    number_of_guests: '' as number | '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [timeSlots30Min, setTimeSlots30Min] = useState<TimeSlotOption[]>([]);
  const [timeSlots60Min, setTimeSlots60Min] = useState<TimeSlotOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotOption[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, SlotAvailability>>({});
  const [slotDurationsEnabled, setSlotDurationsEnabled] = useState({ thirtyMinutes: true, sixtyMinutes: true });
  const [maxGuestsPerSlot, setMaxGuestsPerSlot] = useState(24);

  // Slot-based pricing from environment variables (client-side accessible)
  const SLOT_PRICES = {
    30: Number(process.env.NEXT_PUBLIC_SLOT_1_PRICE) || 1000, // 30 minutes slot
    60: Number(process.env.NEXT_PUBLIC_SLOT_2_PRICE) || 1500, // 1 hour slot
  } as const;

  const pricePerPerson = SLOT_PRICES[formData.slot_duration];
  const guestsCount = typeof formData.number_of_guests === 'number' ? formData.number_of_guests : 0;
  const totalAmount = pricePerPerson * guestsCount;

  const fetchAvailability = useCallback(async (date: string, duration: 30 | 60) => {
    if (!date) {
      setSlotAvailability({});
      return;
    }
    try {
      const res = await fetch(`/api/availability/${date}?duration=${duration}`);
      if (res.ok) {
        const data = await res.json();
        setSlotAvailability(data.availability || {});
        if (data.timeSlots?.length) {
          setTimeSlots(data.timeSlots);
        }
      }
    } catch {
      setSlotAvailability({});
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, booking_date: prev.booking_date || today }));

      fetch('/api/booking-settings/public')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          setTimeSlots30Min(Array.isArray(data?.timeSlots30Min) && data.timeSlots30Min.length > 0 ? data.timeSlots30Min : getDefaultTimeSlots30Min());
          setTimeSlots60Min(Array.isArray(data?.timeSlots60Min) && data.timeSlots60Min.length > 0 ? data.timeSlots60Min : getDefaultTimeSlots60Min());
          if (data?.slotDurationsEnabled && typeof data.slotDurationsEnabled === 'object') {
            setSlotDurationsEnabled({
              thirtyMinutes: typeof data.slotDurationsEnabled.thirtyMinutes === 'boolean' ? data.slotDurationsEnabled.thirtyMinutes : true,
              sixtyMinutes: typeof data.slotDurationsEnabled.sixtyMinutes === 'boolean' ? data.slotDurationsEnabled.sixtyMinutes : true,
            });
          }
          if (typeof data?.maxBookingsPerSlot === 'number' && data.maxBookingsPerSlot >= 1) {
            setMaxGuestsPerSlot(data.maxBookingsPerSlot);
          }
        })
        .catch(() => {
          setTimeSlots30Min(getDefaultTimeSlots30Min());
          setTimeSlots60Min(getDefaultTimeSlots60Min());
        });

      fetchAvailability(today, formData.slot_duration);

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
  }, [isOpen, fetchAvailability]);

  useEffect(() => {
    if (formData.booking_date) {
      fetchAvailability(formData.booking_date, formData.slot_duration);
    } else {
      setSlotAvailability({});
    }
  }, [formData.booking_date, formData.slot_duration, fetchAvailability]);

  useEffect(() => {
    const list = formData.slot_duration === 30 ? timeSlots30Min : timeSlots60Min;
    if (list.length) setTimeSlots(list);
  }, [formData.slot_duration, timeSlots30Min, timeSlots60Min]);

  useEffect(() => {
    const valid30 = slotDurationsEnabled.thirtyMinutes;
    const valid60 = slotDurationsEnabled.sixtyMinutes;
    if (formData.slot_duration === 30 && !valid30 && valid60) {
      setFormData((prev) => ({ ...prev, slot_duration: 60, booking_time: '' }));
    } else if (formData.slot_duration === 60 && !valid60 && valid30) {
      setFormData((prev) => ({ ...prev, slot_duration: 30, booking_time: '' }));
    }
  }, [slotDurationsEnabled, formData.slot_duration]);

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
        description: `Booking for ${guestsCount} guest(s) - ${formData.slot_duration} minutes slot - Access to all game rooms`,
        order_id: orderData.order_id, // Pass the `id` obtained in the response of Step 1
        prefill: {
          // We recommend using the prefill parameter to auto-fill customer's contact information
          name: formData.name,
          email: formData.email,
          contact: formData.phone, // Provide the customer's phone number for better conversion rates
        },
        notes: {
          booking_id: bookingId,
          number_of_guests: guestsCount.toString(),
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          slot_duration: formData.slot_duration.toString(),
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
                slot_duration: 60,
                number_of_guests: '',
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

    const guestsCount = typeof formData.number_of_guests === 'number' ? formData.number_of_guests : 0;
    if (!formData.name || !formData.email || !formData.phone || !formData.booking_date || 
        !formData.booking_time || !formData.slot_duration || !formData.number_of_guests || guestsCount < 1) {
      setError('Please fill in all required fields.');
      return;
    }
    if (guestsCount > maxGuestsPerSlot) {
      setError(`Number of guests cannot exceed ${maxGuestsPerSlot}.`);
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
        // Initiate payment - use the validated guests count
        const finalGuestsCount = typeof formData.number_of_guests === 'number' ? formData.number_of_guests : 1;
        const finalTotalAmount = pricePerPerson * finalGuestsCount;
        await handlePayment(data.booking.id, finalTotalAmount);
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
              <label htmlFor="slot-duration">Slot Duration *</label>
              <select
                id="slot-duration"
                name="slot_duration"
                required
                value={formData.slot_duration}
                onChange={(e) => setFormData({ ...formData, slot_duration: parseInt(e.target.value) as 30 | 60, booking_time: '' })}
                className="w-full"
              >
                {slotDurationsEnabled.thirtyMinutes && (
                  <option value="30">30 Minutes - ₹{SLOT_PRICES[30].toLocaleString('en-IN')} per person</option>
                )}
                {slotDurationsEnabled.sixtyMinutes && (
                  <option value="60">1 Hour - ₹{SLOT_PRICES[60].toLocaleString('en-IN')} per person</option>
                )}
                {!slotDurationsEnabled.thirtyMinutes && !slotDurationsEnabled.sixtyMinutes && (
                  <>
                    <option value="30">30 Minutes - ₹{SLOT_PRICES[30].toLocaleString('en-IN')} per person</option>
                    <option value="60">1 Hour - ₹{SLOT_PRICES[60].toLocaleString('en-IN')} per person</option>
                  </>
                )}
              </select>
            </div>
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
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="booking-time">Time *</label>
              {formData.booking_time ? (
                <div
                  style={{
                    padding: '0.6rem 0.75rem',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    borderRadius: '8px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {timeSlots.find((s) => s.value === formData.booking_time)?.label ?? formData.booking_time}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, booking_time: '' })}
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  role="listbox"
                  aria-label="Select time slot"
                  id="booking-time"
                  className="w-full"
                  style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                >
                  {timeSlots.map((slot) => {
                    const avail = slotAvailability[slot.value];
                    const isFull = avail?.isFull ?? false;
                    return (
                      <div
                        key={slot.value}
                        role="option"
                        aria-disabled={isFull ? 'true' : 'false'}
                        tabIndex={0}
                        onClick={() => !isFull && setFormData({ ...formData, booking_time: slot.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!isFull) setFormData({ ...formData, booking_time: slot.value });
                          }
                        }}
                        title={isFull ? 'This slot is full, choose different' : undefined}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          opacity: isFull ? 0.7 : 1,
                          background: 'transparent',
                          color: isFull ? 'rgba(255,255,255,0.6)' : '#fff',
                        }}
                      >
                        <span>{slot.label}{isFull ? ' (Full)' : ''}</span>
                        {!isFull && avail && (
                          <span className="text-white/60 text-sm block mt-0.5">
                            {avail.max - avail.booked} spots left
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {formData.booking_time && slotAvailability[formData.booking_time]?.isFull && (
                <small className="text-white/70 text-sm mt-1 block">This slot is full, choose different</small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="booking-guests">Number of Guests *</label>
              <input
                type="number"
                id="booking-guests"
                name="number_of_guests"
                min={1}
                max={maxGuestsPerSlot}
                required
                value={formData.number_of_guests}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, number_of_guests: '' });
                    return;
                  }
                  const num = parseInt(value, 10);
                  if (!isNaN(num)) {
                    setFormData({ ...formData, number_of_guests: Math.min(maxGuestsPerSlot, Math.max(1, num)) });
                  }
                }}
                className="w-full"
              />
              <small className="text-white/70 text-sm mt-1 block">
                Price: ₹{pricePerPerson.toLocaleString('en-IN')} per person ({formData.slot_duration} min). Max {maxGuestsPerSlot} guests.
              </small>
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="form-group" style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ec4899' }}>Total Amount:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>{guestsCount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : '₹0'}</span>
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
            {isSubmitting ? 'Creating Booking...' : isProcessingPayment ? 'Processing Payment...' : guestsCount > 0 ? `Pay ₹${totalAmount.toLocaleString('en-IN')} & Book` : 'Enter Number of Guests'}
          </button>
        </form>
      </div>
    </div>
  );
}
