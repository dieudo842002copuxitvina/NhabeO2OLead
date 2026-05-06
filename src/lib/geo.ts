/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  GEO UTILITIES - Haversine Distance Calculation                       ║
 * ║  Spatial mathematics for dealer-lead matching                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * GeoCoord type for location coordinates
 */
export interface GeoCoord {
  lat: number;
  lon: number;
}

/**
 * Default location (Ho Chi Minh City)
 */
export const DEFAULT_LOCATION: GeoCoord = {
  lat: 10.8231,
  lon: 106.6297,
};

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 * 
 * @param lat1 - Latitude of point 1 (in degrees)
 * @param lon1 - Longitude of point 1 (in degrees)
 * @param lat2 - Latitude of point 2 (in degrees)
 * @param lon2 - Longitude of point 2 (in degrees)
 * @returns Distance in kilometers
 * 
 * @example
 * // Distance from Ho Chi Minh City to Hanoi
 * const distance = calculateDistance(10.8231, 106.6297, 21.0285, 105.8542);
 * // Returns approximately 1154.5 km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Validate inputs
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error("Invalid coordinates provided");
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(3));
}

/**
 * Validate latitude and longitude values
 * 
 * @param lat - Latitude value
 * @param lon - Longitude value
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  if (lat === null || lat === undefined || isNaN(lat)) return false;
  if (lon === null || lon === undefined || isNaN(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

/**
 * Find the nearest dealer to a given location
 * 
 * @param latitude - Customer's latitude
 * @param longitude - Customer's longitude
 * @param dealers - Array of dealers with latitude and longitude
 * @returns The nearest dealer and distance, or null if no valid dealers found
 */
export function findNearestDealer<T extends { id: string; latitude?: number | null; longitude?: number | null }>(
  latitude: number,
  longitude: number,
  dealers: T[]
): { dealer: T; distanceKm: number } | null {
  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  let nearestDealer: T | null = null;
  let minDistance = Infinity;

  for (const dealer of dealers) {
    const dealerLat = dealer.latitude;
    const dealerLon = dealer.longitude;

    if (dealerLat === null || dealerLat === undefined || dealerLon === null || dealerLon === undefined) {
      continue;
    }

    if (!isValidCoordinate(dealerLat, dealerLon)) {
      continue;
    }

    const distance = calculateDistance(latitude, longitude, dealerLat, dealerLon);

    if (distance < minDistance) {
      minDistance = distance;
      nearestDealer = dealer;
    }
  }

  if (nearestDealer === null) {
    return null;
  }

  return {
    dealer: nearestDealer,
    distanceKm: Number(minDistance.toFixed(3)),
  };
}
