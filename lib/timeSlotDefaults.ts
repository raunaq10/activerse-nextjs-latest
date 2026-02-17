/**
 * Default time slots 11:00 AM to 11:00 PM (23:00)
 * 30-min: 11:00, 11:30, 12:00, ... 22:30, 23:00
 * 60-min: 11:00, 12:00, ... 23:00
 */

export interface TimeSlotOption {
  value: string;
  label: string;
  enabled: boolean;
}

function timeToDisplay(h: number, m: number): string {
  if (h === 0 && m === 0) return '12:00 AM';
  if (h === 12 && m === 0) return '12:00 PM';
  if (h < 12) return `${h}:${m === 0 ? '00' : m.toString().padStart(2, '0')} AM`;
  return `${h - 12}:${m === 0 ? '00' : m.toString().padStart(2, '0')} PM`;
}

/** 30-min slot: label as "11 AM to 11:30 AM", "11:30 AM to 12 PM", etc. */
export function getDefaultTimeSlots30Min(): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  for (let h = 11; h <= 23; h++) {
    slots.push({
      value: `${h.toString().padStart(2, '0')}:00`,
      label: h < 23 ? `${timeToDisplay(h, 0)} to ${timeToDisplay(h, 30)}` : `${timeToDisplay(23, 0)} to 12 AM`,
      enabled: true,
    });
    if (h < 23) {
      slots.push({
        value: `${h.toString().padStart(2, '0')}:30`,
        label: `${timeToDisplay(h, 30)} to ${timeToDisplay(h + 1, 0)}`,
        enabled: true,
      });
    }
  }
  return slots;
}

/** 60-min slot: label as "11 AM to 12 PM", "12 PM to 1 PM", etc. */
export function getDefaultTimeSlots60Min(): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  for (let h = 11; h <= 23; h++) {
    const endH = h + 1;
    const endDisplay = endH <= 23 ? timeToDisplay(endH, 0) : '12 AM';
    slots.push({
      value: `${h.toString().padStart(2, '0')}:00`,
      label: `${timeToDisplay(h, 0)} to ${endDisplay}`,
      enabled: true,
    });
  }
  return slots;
}
