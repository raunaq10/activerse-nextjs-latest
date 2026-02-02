/**
 * Centralized configuration for the application
 * Slot-based pricing configurable via environment variables
 * SLOT_1_PRICE (30 minutes) and SLOT_2_PRICE (60 minutes)
 */

// Slot pricing configuration from environment variables
export const SLOT_PRICES = {
  30: Number(process.env.SLOT_1_PRICE) || 1000, // 30 minutes slot: Default Rs 1000 per person
  60: Number(process.env.SLOT_2_PRICE) || 1500, // 1 hour slot: Default Rs 1500 per person
} as const;

// Legacy support: PRICE_PER_PERSON defaults to 1 hour price
export const PRICE_PER_PERSON = Number(process.env.PRICE_PER_PERSON) || SLOT_PRICES[60];

// Helper function to get price based on slot duration
export function getPriceForSlotDuration(duration: 30 | 60): number {
  return SLOT_PRICES[duration] || SLOT_PRICES[60];
}

// Validate prices are positive numbers
Object.entries(SLOT_PRICES).forEach(([duration, price]) => {
  if (isNaN(price) || price <= 0) {
    throw new Error(`SLOT_PRICES[${duration}] must be a positive number`);
  }
});
