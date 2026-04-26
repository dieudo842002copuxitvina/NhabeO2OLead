"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nbagri_farmer_profile";

type FarmerProfile = {
  areaM2: number;
};

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function useFarmerProfile(defaultAreaHa = 1) {
  const [areaHa, setAreaHa] = useState(defaultAreaHa);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const profile = JSON.parse(raw) as FarmerProfile;
        const nextAreaHa = toNumber(profile.areaM2, defaultAreaHa * 10000) / 10000;
        if (nextAreaHa > 0) setAreaHa(nextAreaHa);
      }
    } catch {
      // Keep silent: fallback to default profile.
    } finally {
      setHydrated(true);
    }
  }, [defaultAreaHa]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = window.setTimeout(() => {
      try {
        const payload: FarmerProfile = {
          areaM2: Math.max(0, areaHa) * 10000,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage errors silently.
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [areaHa, hydrated]);

  return { areaHa, setAreaHa, hydrated };
}
