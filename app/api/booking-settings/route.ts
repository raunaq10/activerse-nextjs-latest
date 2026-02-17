import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import BookingSettings from '@/models/BookingSettings';
import { getOrCreateBookingSettings } from '@/lib/getBookingSettings';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAuth();
    const settings = await getOrCreateBookingSettings();
    const out = settings.toObject ? settings.toObject() : settings;
    return NextResponse.json(out);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch booking settings';
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function sanitizeSlotList(arr: unknown): { value: string; label: string; enabled: boolean }[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      value: typeof item.value === 'string' ? item.value.trim() : String(item.value ?? ''),
      label: typeof item.label === 'string' ? item.label.trim() : String(item.label ?? ''),
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }))
    .filter((s) => s.value.length > 0);
}

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { timeSlots30Min, timeSlots60Min, maxBookingsPerSlot, slotDurationsEnabled } = body;

    const settings = await getOrCreateBookingSettings();

    if (Array.isArray(timeSlots30Min)) {
      const sanitized = sanitizeSlotList(timeSlots30Min);
      settings.timeSlots30Min = sanitized.length ? sanitized : getDefaultTimeSlots30Min();
      settings.markModified('timeSlots30Min');
    }
    if (Array.isArray(timeSlots60Min)) {
      const sanitized = sanitizeSlotList(timeSlots60Min);
      settings.timeSlots60Min = sanitized.length ? sanitized : getDefaultTimeSlots60Min();
      settings.markModified('timeSlots60Min');
    }
    if (typeof maxBookingsPerSlot === 'number' && maxBookingsPerSlot >= 1 && maxBookingsPerSlot <= 500) {
      settings.maxBookingsPerSlot = Math.round(maxBookingsPerSlot);
    }
    if (slotDurationsEnabled && typeof slotDurationsEnabled === 'object') {
      settings.slotDurationsEnabled = settings.slotDurationsEnabled || { thirtyMinutes: true, sixtyMinutes: true };
      settings.slotDurationsEnabled.thirtyMinutes = typeof slotDurationsEnabled.thirtyMinutes === 'boolean' ? slotDurationsEnabled.thirtyMinutes : true;
      settings.slotDurationsEnabled.sixtyMinutes = typeof slotDurationsEnabled.sixtyMinutes === 'boolean' ? slotDurationsEnabled.sixtyMinutes : true;
      settings.markModified('slotDurationsEnabled');
    }

    await settings.save();
    const out = settings.toObject ? settings.toObject() : settings;
    return NextResponse.json(out);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update booking settings';
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('PUT /api/booking-settings error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
