import { NextResponse } from 'next/server';
import { getOrCreateBookingSettings } from '@/lib/getBookingSettings';
import { getDefaultTimeSlots60Min } from '@/lib/timeSlotDefaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getOrCreateBookingSettings();
    const s = settings.toObject ? settings.toObject() : (settings as unknown as Record<string, unknown>);

    const timeSlots60Min = (Array.isArray(s.timeSlots60Min) && s.timeSlots60Min.length > 0
      ? s.timeSlots60Min
      : getDefaultTimeSlots60Min()
    ).filter((x: { enabled: boolean }) => x.enabled);
    const maxBookingsPerSlot = typeof s.maxBookingsPerSlot === 'number' && s.maxBookingsPerSlot >= 1
      ? s.maxBookingsPerSlot
      : 24;
    const slotDurationsEnabled =
      s.slotDurationsEnabled && typeof s.slotDurationsEnabled === 'object'
        ? {
            sixtyMinutes: typeof (s.slotDurationsEnabled as Record<string, unknown>).sixtyMinutes === 'boolean'
              ? (s.slotDurationsEnabled as { sixtyMinutes: boolean }).sixtyMinutes
              : true,
          }
        : { sixtyMinutes: true };

    return NextResponse.json({

      timeSlots60Min,
      maxBookingsPerSlot,
      slotDurationsEnabled,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch booking settings';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
