/**
 * Utility Functions for Agri Engine
 */

/**
 * Round a number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function round(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Format number with Vietnamese locale
 * @param value - Number to format
 * @returns Formatted string
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

/**
 * Clamp a number between min and max
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
