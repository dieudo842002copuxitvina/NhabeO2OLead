// Distance Matrix edge function
// - If GOOGLE_MAPS_API_KEY is set: calls Google Distance Matrix API for real road distance/duration
// - Otherwise: falls back to Haversine great-circle distance (free)
// Used by NearbyDealers to refine geo-matching beyond chim-bay distance.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LatLng { lat: number; lng: number }
interface ReqBody {
  origin: LatLng;
  destinations: { id: string; lat: number; lng: number }[];
  mode?: 'driving' | 'walking' | 'bicycling';
}
interface MatrixResult {
  id: string;
  distance_m: number;
  duration_s: number | null;
  source: 'google' | 'haversine';
}

function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function googleMatrix(
  origin: LatLng,
  destinations: ReqBody['destinations'],
  mode: string,
  apiKey: string,
): Promise<MatrixResult[] | null> {
  try {
    const dest = destinations.map((d) => `${d.lat},${d.lng}`).join('|');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${encodeURIComponent(dest)}&mode=${mode}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json() as {
      rows?: { elements?: { status: string; distance?: { value: number }; duration?: { value: number } }[] }[];
    };
    const elements = json.rows?.[0]?.elements ?? [];
    return destinations.map((d, i) => {
      const el = elements[i];
      if (!el || el.status !== 'OK') {
        return { id: d.id, distance_m: Math.round(haversine(origin, d)), duration_s: null, source: 'haversine' as const };
      }
      return {
        id: d.id,
        distance_m: el.distance?.value ?? 0,
        duration_s: el.duration?.value ?? null,
        source: 'google' as const,
      };
    });
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.origin || !Array.isArray(body.destinations) || body.destinations.length === 0) {
      return new Response(JSON.stringify({ error: 'origin + destinations required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.destinations.length > 25) {
      return new Response(JSON.stringify({ error: 'max 25 destinations per call' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mode = body.mode ?? 'driving';
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    let results: MatrixResult[] | null = null;
    let source: 'google' | 'haversine' = 'haversine';

    if (apiKey) {
      results = await googleMatrix(body.origin, body.destinations, mode, apiKey);
      if (results) source = 'google';
    }

    if (!results) {
      results = body.destinations.map((d) => ({
        id: d.id,
        distance_m: Math.round(haversine(body.origin, d)),
        duration_s: null,
        source: 'haversine' as const,
      }));
    }

    // Sort nearest first
    results.sort((a, b) => a.distance_m - b.distance_m);

    return new Response(JSON.stringify({ source, results }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
