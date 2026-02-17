'use client';

import { useState, useEffect } from 'react';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

interface TimeSlotOption {
  value: string;
  label: string;
  enabled: boolean;
}

interface BookingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type Tab = 'default' | 'calendar';

export default function BookingSettingsModal({ isOpen, onClose, onSaved }: BookingSettingsModalProps) {
  const [tab, setTab] = useState<Tab>('default');
  const [timeSlots30Min, setTimeSlots30Min] = useState<TimeSlotOption[]>([]);
  const [timeSlots60Min, setTimeSlots60Min] = useState<TimeSlotOption[]>([]);
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState(24);
  const [slotDurationsEnabled, setSlotDurationsEnabled] = useState({ thirtyMinutes: true, sixtyMinutes: true });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [calendarDate, setCalendarDate] = useState('');
  const [calendarOverrides, setCalendarOverrides] = useState<string[]>([]);
  const [closedTimeSlots, setClosedTimeSlots] = useState<string[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setLoading(true);
      fetch('/api/booking-settings', { credentials: 'include' })
        .then((res) => {
          if (res.status === 401) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data) => {
          if (data?.error && typeof data.error === 'string') {
            setError(data.error);
            return;
          }
          if (Array.isArray(data.timeSlots30Min) && data.timeSlots30Min.length > 0) {
            setTimeSlots30Min(data.timeSlots30Min);
          } else {
            setTimeSlots30Min(getDefaultTimeSlots30Min());
          }
          if (Array.isArray(data.timeSlots60Min) && data.timeSlots60Min.length > 0) {
            setTimeSlots60Min(data.timeSlots60Min);
          } else {
            setTimeSlots60Min(getDefaultTimeSlots60Min());
          }
          if (typeof data.maxBookingsPerSlot === 'number' && data.maxBookingsPerSlot >= 1) {
            setMaxBookingsPerSlot(data.maxBookingsPerSlot);
          }
          if (data.slotDurationsEnabled && typeof data.slotDurationsEnabled === 'object') {
            setSlotDurationsEnabled({
              thirtyMinutes: typeof data.slotDurationsEnabled.thirtyMinutes === 'boolean' ? data.slotDurationsEnabled.thirtyMinutes : true,
              sixtyMinutes: typeof data.slotDurationsEnabled.sixtyMinutes === 'boolean' ? data.slotDurationsEnabled.sixtyMinutes : true,
            });
          }
        })
        .catch((err) => setError(err?.message || 'Failed to load settings'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && tab === 'calendar') {
      fetch('/api/booking-settings/calendar', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : []))
        .then((list: { date: string }[]) => {
          setCalendarOverrides(Array.isArray(list) ? list.map((d) => d.date) : []);
        })
        .catch(() => setCalendarOverrides([]));
    }
  }, [isOpen, tab]);

  useEffect(() => {
    if (!calendarDate || tab !== 'calendar') return;
    setCalendarLoading(true);
    fetch(`/api/booking-settings/calendar?date=${calendarDate}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setClosedTimeSlots(Array.isArray(data?.closedTimeSlots) ? data.closedTimeSlots : []);
      })
      .catch(() => setClosedTimeSlots([]))
      .finally(() => setCalendarLoading(false));
  }, [calendarDate, tab]);

  const toggleClosedSlot = (value: string, closed: boolean) => {
    setClosedTimeSlots((prev) =>
      closed ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const saveCalendarDay = async () => {
    if (!calendarDate) return;
    setCalendarSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/booking-settings/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date: calendarDate, closedTimeSlots }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      setSuccess(`Closed slots saved for ${calendarDate}.`);
      setCalendarOverrides((prev) => (prev.includes(calendarDate) ? prev : [...prev, calendarDate].sort()));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setCalendarSaving(false);
    }
  };

  const resetCalendarDay = async () => {
    if (!calendarDate) return;
    if (!confirm(`Open all slots for ${calendarDate}?`)) return;
    setCalendarSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/booking-settings/calendar?date=${calendarDate}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to reset');
      setSuccess(`All slots open for ${calendarDate}.`);
      setCalendarOverrides((prev) => prev.filter((d) => d !== calendarDate));
      setClosedTimeSlots([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setCalendarSaving(false);
    }
  };

  const updateSlot = (duration: 30 | 60, index: number, field: keyof TimeSlotOption, value: string | boolean) => {
    if (duration === 30) {
      setTimeSlots30Min((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    } else {
      setTimeSlots60Min((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    }
  };

  const addSlot = (duration: 30 | 60) => {
    if (duration === 30) {
      setTimeSlots30Min((prev) => [...prev, { value: '11:00', label: '11:00 AM', enabled: true }]);
    } else {
      setTimeSlots60Min((prev) => [...prev, { value: '11:00', label: '11 AM-12 PM', enabled: true }]);
    }
  };

  const removeSlot = (duration: 30 | 60, index: number) => {
    if (duration === 30) setTimeSlots30Min((prev) => prev.filter((_, i) => i !== index));
    else setTimeSlots60Min((prev) => prev.filter((_, i) => i !== index));
  };

  const resetToDefault = (duration: 30 | 60) => {
    if (duration === 30) setTimeSlots30Min(getDefaultTimeSlots30Min());
    else setTimeSlots60Min(getDefaultTimeSlots60Min());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await fetch('/api/booking-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          timeSlots30Min,
          timeSlots60Min,
          maxBookingsPerSlot,
          slotDurationsEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      if (data?.error) throw new Error(data.error);
      setSuccess('Settings saved. They apply immediately to the booking form and availability.');
      onSaved?.();
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const renderSlotList = (
    duration: 30 | 60,
    slots: TimeSlotOption[],
    title: string,
    updateFn: (d: 30 | 60, i: number, field: keyof TimeSlotOption, value: string | boolean) => void,
    setSlots: React.Dispatch<React.SetStateAction<TimeSlotOption[]>>
  ) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label style={{ color: '#fff', fontWeight: 600 }}>{title}</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setSlots(duration === 30 ? getDefaultTimeSlots30Min() : getDefaultTimeSlots60Min())} style={{ padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Reset 11 AM–11 PM</button>
          <button type="button" onClick={() => setSlots((prev) => [...prev, { value: '11:00', label: duration === 30 ? '11:00 AM' : '11 AM-12 PM', enabled: true }])} style={{ padding: '0.35rem 0.75rem', background: 'rgba(76, 175, 80, 0.3)', color: '#4CAF50', border: '1px solid #4CAF50', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Add slot</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflow: 'auto' }}>
        {slots.map((slot, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Value (e.g. 11:00)"
              value={slot.value}
              onChange={(e) => updateFn(duration, i, 'value', e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem' }}
              aria-label={`${title} slot ${i + 1} value`}
            />
            <input
              type="text"
              placeholder="Label"
              value={slot.label}
              onChange={(e) => updateFn(duration, i, 'label', e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem' }}
              aria-label={`${title} slot ${i + 1} label`}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={slot.enabled} onChange={(e) => updateFn(duration, i, 'enabled', e.target.checked)} />
              Enabled
            </label>
            <button type="button" onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))} style={{ padding: '0.35rem 0.5rem', background: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="modal-content" style={{ background: '#1a1a2e', borderRadius: '12px', padding: '2rem', maxWidth: '640px', width: '95%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose} style={{ cursor: 'pointer', float: 'right', fontSize: '1.5rem', color: '#fff' }}>&times;</span>
        <h2 style={{ marginTop: 0, color: '#fff' }}>Booking Settings</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Default (all days): edit time slots and max per slot. Calendar: for a specific date, only close certain times; each new day has all slots open by default.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setTab('default')}
            style={{
              padding: '0.5rem 1rem',
              background: tab === 'default' ? '#4CAF50' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: `1px solid ${tab === 'default' ? '#4CAF50' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Default (all days)
          </button>
          <button
            type="button"
            onClick={() => setTab('calendar')}
            style={{
              padding: '0.5rem 1rem',
              background: tab === 'calendar' ? '#4CAF50' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: `1px solid ${tab === 'calendar' ? '#4CAF50' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Calendar (per day)
          </button>
        </div>

        {tab === 'calendar' ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Select date</label>
              <input
                type="date"
                value={calendarDate}
                onChange={(e) => setCalendarDate(e.target.value)}
                aria-label="Select date for per-day settings"
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', marginRight: '0.5rem' }}
              />
              {calendarOverrides.length > 0 && (
                <small style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '0.5rem' }}>
                  Days with custom settings: {calendarOverrides.join(', ')}
                </small>
              )}
            </div>
            {calendarDate && (
              <>
                {calendarLoading ? (
                  <p style={{ color: '#fff' }}>Loading...</p>
                ) : (
                  <>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Check a time to close it for this day. Uncheck to open. Save to apply. Reset opens all slots for this day.
                    </p>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>30-minute slots — close for this day</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
                        {getDefaultTimeSlots30Min().map((slot) => (
                          <label key={slot.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={closedTimeSlots.includes(slot.value)}
                              onChange={(e) => toggleClosedSlot(slot.value, e.target.checked)}
                              aria-label={`Close ${slot.label} for this day`}
                            />
                            <span>{slot.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>60-minute slots — close for this day</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflow: 'auto' }}>
                        {getDefaultTimeSlots60Min().map((slot) => (
                          <label key={slot.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>
                            <input
                              type="checkbox"
                              checked={closedTimeSlots.includes(slot.value)}
                              onChange={(e) => toggleClosedSlot(slot.value, e.target.checked)}
                              aria-label={`Close ${slot.label} for this day`}
                            />
                            <span>{slot.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={saveCalendarDay} disabled={calendarSaving} style={{ padding: '0.6rem 1.2rem', background: calendarSaving ? '#666' : '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: calendarSaving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                        {calendarSaving ? 'Saving...' : `Save closed slots for ${calendarDate}`}
                      </button>
                      <button type="button" onClick={resetCalendarDay} disabled={calendarSaving} style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: calendarSaving ? 'not-allowed' : 'pointer' }}>
                        Open all slots for this day
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            {error && <div style={{ color: '#f44336', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#4CAF50', marginTop: '1rem', fontSize: '0.9rem' }}>{success}</div>}
          </div>
        ) : loading ? (
          <p style={{ color: '#fff' }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="max-bookings-per-slot" style={{ display: 'block', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>
                Max bookings per time slot
              </label>
              <input
                id="max-bookings-per-slot"
                type="number"
                min={1}
                max={500}
                value={maxBookingsPerSlot}
                onChange={(e) => setMaxBookingsPerSlot(Math.max(1, Math.min(500, parseInt(e.target.value) || 24)))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                aria-label="Maximum bookings per time slot"
              />
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Maximum number of guests per (date, time, duration) slot (e.g. 24).</small>
            </div>

            {renderSlotList(30, timeSlots30Min, '30-minute time slots', updateSlot, setTimeSlots30Min)}
            {renderSlotList(60, timeSlots60Min, '60-minute (1 hour) time slots', updateSlot, setTimeSlots60Min)}

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <label style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Slot duration options</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={slotDurationsEnabled.thirtyMinutes} onChange={(e) => setSlotDurationsEnabled((p) => ({ ...p, thirtyMinutes: e.target.checked }))} />
                30 minutes slot
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
                <input type="checkbox" checked={slotDurationsEnabled.sixtyMinutes} onChange={(e) => setSlotDurationsEnabled((p) => ({ ...p, sixtyMinutes: e.target.checked }))} />
                60 minutes (1 hour) slot
              </label>
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>Disabling both will hide duration choice; at least one is recommended.</small>
            </div>

            {error && <div style={{ color: '#f44336', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#4CAF50', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: saving ? '#666' : '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save settings'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
