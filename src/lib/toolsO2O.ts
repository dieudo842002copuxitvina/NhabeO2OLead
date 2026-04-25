"use client";

import { dealers } from "@/data/mock";
import { DEFAULT_LOCATION, haversineDistance } from "@/lib/geo";
import { submitGeneralLead } from "@/lib/supabaseQueries";
import { supabase } from "@/integrations/supabase/client";

export interface ToolResultPayload {
  toolKey: string;
  toolName: string;
  summary: string;
  data: Record<string, unknown>;
}

export interface MatchedDealer {
  dealerId: string | null;
  dealerName: string;
  dealerPhone: string;
  dealerZalo: string;
  distanceKm: number;
}

function readLocation(): { lat: number; lng: number } {
  if (typeof window === "undefined") return DEFAULT_LOCATION;
  const raw = localStorage.getItem("agriflow:last_location");
  if (!raw) return DEFAULT_LOCATION;
  try {
    const parsed = JSON.parse(raw) as { lat: number; lng: number };
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") return parsed;
  } catch {
    return DEFAULT_LOCATION;
  }
  return DEFAULT_LOCATION;
}

export function persistToolResult(payload: ToolResultPayload): void {
  if (typeof window === "undefined") return;
  const key = "agriflow:tool_results";
  const prev = localStorage.getItem(key);
  const list = prev ? (JSON.parse(prev) as ToolResultPayload[]) : [];
  const next = [{ ...payload, at: new Date().toISOString() }, ...list].slice(0, 30);
  localStorage.setItem(key, JSON.stringify(next));
}

export function matchNearestDealer(): MatchedDealer {
  const origin = readLocation();
  const active = dealers.filter((d) => d.status === "active");
  const ranked = active
    .map((d) => ({
      item: d,
      distance: Math.round(haversineDistance(origin, { lat: d.lat, lng: d.lng })),
    }))
    .sort((a, b) => a.distance - b.distance);

  const picked = ranked[0];
  if (!picked) {
    return {
      dealerId: null,
      dealerName: "Nhà Bè Agri",
      dealerPhone: "",
      dealerZalo: "",
      distanceKm: 0,
    };
  }

  return {
    dealerId: picked.item.id,
    dealerName: picked.item.name,
    dealerPhone: picked.item.phone,
    dealerZalo: picked.item.zalo,
    distanceKm: picked.distance,
  };
}

export async function matchNearestDealerFromSupabase(): Promise<MatchedDealer> {
  const origin = readLocation();
  const { data, error } = await supabase
    .from("dealers" as any)
    .select("id, name, province, address, phone, zalo, lat, lng, status")
    .eq("status", "active");

  if (error || !data || data.length === 0) {
    return matchNearestDealer();
  }

  const ranked = (data as unknown as Array<Record<string, unknown>>)
    .filter((d) => typeof d.lat === "number" && typeof d.lng === "number")
    .map((d) => ({
      item: d,
      distance: Math.round(haversineDistance(origin, { lat: d.lat as number, lng: d.lng as number })),
    }))
    .sort((a, b) => a.distance - b.distance);

  const picked = ranked[0];
  if (!picked) return matchNearestDealer();

  return {
    dealerId: String(picked.item.id),
    dealerName: String(picked.item.name ?? "Nhà Bè Agri"),
    dealerPhone: String(picked.item.phone ?? ""),
    dealerZalo: String(picked.item.zalo ?? ""),
    distanceKm: picked.distance,
  };
}

export async function submitToolLead(payload: ToolResultPayload, dealer: MatchedDealer): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const loggedIn = !!data.user;
  if (!loggedIn) return;

  await submitGeneralLead({
    customer_name: data.user?.user_metadata?.full_name || "Khách hàng AgriFlow",
    customer_phone: data.user?.phone || "0000000000",
    province: "",
    district: "",
    crop_type: payload.toolName,
    area_m2: null,
    message: `${payload.summary}`,
    calculator_data: payload.data,
    assigned_dealer_id: dealer.dealerId,
    source: payload.toolKey,
  });
}
