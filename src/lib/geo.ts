/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  GEO UTILITIES - Haversine Distance Calculation                       ║
 * ║  Spatial mathematics for dealer-lead matching                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface GeoCoord {
  lat: number;
  lng: number;
}

export const DEFAULT_LOCATION: GeoCoord = {
  lat: 10.8231,
  lng: 106.6297,
};

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

export const haversineDistance = (
  point1: GeoCoord,
  point2: GeoCoord
): number => calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);

export function isValidCoordinate(lat: number, lon: number): boolean {
  if (lat === null || lat === undefined || isNaN(lat)) return false;
  if (lon === null || lon === undefined || isNaN(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

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

/**
 * Expanding radius search for finding nearby dealers
 * Starts with radius=1 and expands until maxRadius or find results
 * @updated 2026-05-08 - Fixed exports for Vercel build
 */
export interface ExpandingRadiusOptions<T> {
  maxRadius?: number;
  initialRadius?: number;
}

export function expandingRadiusSearch<T>(
  origin: GeoCoord,
  items: T[],
  getCoord: (item: T) => GeoCoord,
  maxRadius: number = 100,
  initialRadius: number = 1
): { results: T[]; radiusUsed: number; expanded: number } {
  let radius = initialRadius;
  let expanded = 0;
  let results: T[] = [];

  while (radius <= maxRadius) {
    expanded++;
    results = items.filter((item) => {
      const coord = getCoord(item);
      return haversineDistance(origin, coord) <= radius;
    });

    if (results.length > 0) {
      break;
    }
    radius *= 2;
  }

  return { results, radiusUsed: Math.min(radius, maxRadius), expanded };
}
