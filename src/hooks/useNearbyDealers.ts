"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES — mirror real DB columns from the `dealers` table
 * ───────────────────────────────────────────────────────────────────────────── */

export interface DealerFromDB {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  zalo: string | null;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean | null;
  region: string | null;
  cover_image: string | null;
}

export interface DealerWithDistance extends DealerFromDB {
  /** Computed client-side in km */
  distance_km: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * HAVERSINE — compute distance between two lat/lng points
 * ───────────────────────────────────────────────────────────────────────────── */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─────────────────────────────────────────────────────────────────────────────
 * HOOK
 * ───────────────────────────────────────────────────────────────────────────── */

export interface UseNearbyDealersOptions {
  /** Browser GPS latitude */
  lat: number | null;
  /** Browser GPS longitude */
  lng: number | null;
  /** Search radius in meters (default 50 000 = 50 km) */
  radiusMeters?: number;
  /** Min number of dealers to return */
  limit?: number;
}

export interface UseNearbyDealersResult {
  dealers: DealerWithDistance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useNearbyDealers({
  lat,
  lng,
  radiusMeters = 50_000,
  limit = 20,
}: UseNearbyDealersOptions): UseNearbyDealersResult {
  const queryKey = ["nearby-dealers", lat, lng, radiusMeters, limit];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    // Only run when we have valid coordinates
    queryFn: async (): Promise<DealerWithDistance[]> => {
      if (!lat || !lng) return [];

      // ── Call RPC ────────────────────────────────────────────────────────────
      // Falls back to PostGIS ST_DWithin + ST_Distance if RPC not yet deployed
      let dealers: DealerFromDB[] = [];

      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_nearby_dealers",
          {
            user_lat: lat,
            user_lng: lng,
            radius_meters: radiusMeters,
          }
        );

        if (rpcError) throw rpcError;
        if (rpcData && rpcData.length > 0) {
          dealers = rpcData as DealerFromDB[];
        }
      } catch {
        // RPC not found or errored — fall back to bounding-box pre-filter
        const approxDegPerKm = radiusMeters / 111_320;
        const minLat = lat - approxDegPerKm;
        const maxLat = lat + approxDegPerKm;
        const minLng = lng - approxDegPerKm / Math.cos(toRad(lat));
        const maxLng = lng + approxDegPerKm / Math.cos(toRad(lat));

        const { data: boxData, error: boxError } = await supabase
          .from("dealers")
          .select(
            "id, name, slug, address, phone, email, zalo, province, district, latitude, longitude, is_active, region, cover_image"
          )
          .eq("is_active", true)
          .gte("latitude", minLat)
          .lte("latitude", maxLat)
          .gte("longitude", minLng)
          .lte("longitude", maxLng)
          .limit(limit * 3);

        if (!boxError && boxData) {
          dealers = boxData as unknown as DealerFromDB[];
        }
      }

      if (dealers.length === 0) {
        // Final fallback: just return any active dealers, sorted by name
        const { data: allData } = await supabase
          .from("dealers")
          .select(
            "id, name, slug, address, phone, email, zalo, province, district, latitude, longitude, is_active, region, cover_image"
          )
          .eq("is_active", true)
          .limit(limit);

        if (allData) dealers = allData as unknown as DealerFromDB[];
      }

      // ── Attach distance and sort ──────────────────────────────────────────
      const withDistance: DealerWithDistance[] = dealers
        .filter((d) => d.latitude != null && d.longitude != null)
        .map((d) => ({
          ...d,
          distance_km: haversineDistance(lat, lng, d.latitude!, d.longitude!),
        }))
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, limit);

      return withDistance;
    },

    // Guard: skip entirely if no GPS coordinates
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,   // 5 minutes — GPS won't change fast
    gcTime: 10 * 60 * 1000,      // 10 minutes cache
    retry: 1,
  });

  return {
    dealers: data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}
