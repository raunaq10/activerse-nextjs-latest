/**
 * Centralized configuration for the application
 * Price per person can be controlled via environment variable for testing
 */

export const PRICE_PER_PERSON = Number(process.env.PRICE_PER_PERSON) || 1500;

// Validate price is a positive number
if (isNaN(PRICE_PER_PERSON) || PRICE_PER_PERSON <= 0) {
  throw new Error('PRICE_PER_PERSON must be a positive number');
}
