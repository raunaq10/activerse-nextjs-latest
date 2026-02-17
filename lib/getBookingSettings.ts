/**
 * Single source of truth for booking settings.
 * Global settings apply to all days; per-day overrides (calendar) apply to specific dates.
 * Each day uses that day's override if set, otherwise global — so the next day auto-resets to its own settings.
 */

import connectDB from '@/lib/mongodb';
import BookingSettings from '@/models/BookingSettings';
import BookingDaySettings from '@/models/BookingDaySettings';
import { getDefaultTimeSlots30Min, getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';
import type { IBookingSettings } from '@/models/BookingSettings';

const SORT = { _id: 1 as const };

export async function getOrCreateBookingSettings() {
  await connectDB();
  let doc = await BookingSettings.findOne({}).sort(SORT);
  if (!doc) {
    doc = await BookingSettings.create({});
    return doc;
  }
  const plain = doc.toObject ? doc.toObject() : (doc as unknown as Record<string, unknown>);
  const needsMigration =
    !(Array.isArray(plain.timeSlots30Min) && plain.timeSlots30Min.length > 0) ||
    !(Array.isArray(plain.timeSlots60Min) && plain.timeSlots60Min.length > 0);
  if (needsMigration) {
    if (!(Array.isArray(plain.timeSlots30Min) && plain.timeSlots30Min.length > 0)) {
      doc.timeSlots30Min = getDefaultTimeSlots30Min();
      doc.markModified('timeSlots30Min');
    }
    if (!(Array.isArray(plain.timeSlots60Min) && plain.timeSlots60Min.length > 0)) {
      doc.timeSlots60Min = getDefaultTimeSlots60Min();
      doc.markModified('timeSlots60Min');
    }
    await doc.save();
  }
  return doc;
}

/** Settings for a date: global slots + per-day closed times. New day = no record = all slots open. */
export async function getSettingsForDate(date: string): Promise<IBookingSettings & { maxBookingsPerSlot: number }> {
  const globalDoc = await getOrCreateBookingSettings();
  const global = globalDoc.toObject ? globalDoc.toObject() : (globalDoc as unknown as Record<string, unknown>);

  const dayDoc = await BookingDaySettings.findOne({ date }).lean();
  const closedSet = new Set<string>(
    dayDoc?.closedTimeSlots && Array.isArray(dayDoc.closedTimeSlots) ? dayDoc.closedTimeSlots : []
  );

  const base30 = Array.isArray(global.timeSlots30Min) && global.timeSlots30Min.length > 0
    ? (global.timeSlots30Min as IBookingSettings['timeSlots30Min'])
    : getDefaultTimeSlots30Min();
  const base60 = Array.isArray(global.timeSlots60Min) && global.timeSlots60Min.length > 0
    ? (global.timeSlots60Min as IBookingSettings['timeSlots60Min'])
    : getDefaultTimeSlots60Min();

  const timeSlots30Min = base30.map((s) => ({ ...s, enabled: closedSet.has(s.value) ? false : s.enabled }));
  const timeSlots60Min = base60.map((s) => ({ ...s, enabled: closedSet.has(s.value) ? false : s.enabled }));
  const maxBookingsPerSlot =
    typeof global.maxBookingsPerSlot === 'number' && global.maxBookingsPerSlot >= 1 ? global.maxBookingsPerSlot : 24;
  const slotDurationsEnabled =
    global.slotDurationsEnabled && typeof global.slotDurationsEnabled === 'object'
      ? (global.slotDurationsEnabled as IBookingSettings['slotDurationsEnabled'])
      : { thirtyMinutes: true, sixtyMinutes: true };

  return {
    timeSlots30Min,
    timeSlots60Min,
    maxBookingsPerSlot,
    slotDurationsEnabled,
  };
}

/** Get settings as plain object (for JSON response). Uses getOrCreateBookingSettings. */
export async function getBookingSettingsPlain() {
  const doc = await getOrCreateBookingSettings();
  return doc.toObject ? doc.toObject() : doc;
}
