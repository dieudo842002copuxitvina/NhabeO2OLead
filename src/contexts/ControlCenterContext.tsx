"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';

/* =========================================================================
   AgriFlow — Algorithm & UI Command Center
   Lưu cấu hình real-time vào localStorage; áp dụng toàn site qua context.
   ========================================================================= */

export interface GeoWeights {
  distance: number;   // W1 — gần hơn = điểm cao
  stock: number;      // W2 — còn hàng = điểm cao
  reputation: number; // W3 — uy tín = điểm cao
}

export type EmergencyMode = 'off' | 'flood' | 'drought';

export interface EmergencyConfig {
  mode: EmergencyMode;
  customHeadline?: string;
  /** product tag/category keywords to surface to top */
  flood_keywords: string[];
  drought_keywords: string[];
}

export interface ControlCenterConfig {
  weights: GeoWeights;
  /** Lower = stricter cutoff for in-stock detection */
  inStockThreshold: number;
  emergency: EmergencyConfig;
  updatedAt: string;
}

export const DEFAULT_WEIGHTS: GeoWeights = { distance: 60, stock: 25, reputation: 15 };

const DEFAULT_CONFIG: ControlCenterConfig = {
  weights: DEFAULT_WEIGHTS,
  inStockThreshold: 1,
  emergency: {
    mode: 'off',
    flood_keywords: ['bơm', 'pump', 'xả lũ', 'thoát nước', 'chìm'],
    drought_keywords: ['tưới', 'nhỏ giọt', 'tiết kiệm nước', 'phun mưa', 'drip'],
  },
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'control_center_config_v1';

interface Ctx {
  config: ControlCenterConfig;
  setWeights: (w: GeoWeights) => void;
  setInStockThreshold: (n: number) => void;
  setEmergency: (e: Partial<EmergencyConfig>) => void;
  reset: () => void;
  /** Pre-computed normalized weights (sum=1). */
  normalizedWeights: GeoWeights;
}

const ControlCenterContext = createContext<Ctx | null>(null);

function normalize(w: GeoWeights): GeoWeights {
  const sum = w.distance + w.stock + w.reputation || 1;
  return {
    distance: w.distance / sum,
    stock: w.stock / sum,
    reputation: w.reputation / sum,
  };
}

export function ControlCenterProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ControlCenterConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as ControlCenterConfig;
        setConfig({
          ...DEFAULT_CONFIG,
          ...p,
          weights: { ...DEFAULT_WEIGHTS, ...(p.weights ?? {}) },
          emergency: { ...DEFAULT_CONFIG.emergency, ...(p.emergency ?? {}) },
        });
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Broadcast for other tabs/components that don't subscribe to context
      window.dispatchEvent(new CustomEvent('controlcenter:update', { detail: config }));
    } catch {}
  }, [config, isInitialized]);

  const value = useMemo<Ctx>(() => ({
    config,
    setWeights: (weights) => setConfig((c) => ({ ...c, weights, updatedAt: new Date().toISOString() })),
    setInStockThreshold: (inStockThreshold) =>
      setConfig((c) => ({ ...c, inStockThreshold, updatedAt: new Date().toISOString() })),
    setEmergency: (patch) =>
      setConfig((c) => ({ ...c, emergency: { ...c.emergency, ...patch }, updatedAt: new Date().toISOString() })),
    reset: () => setConfig({ ...DEFAULT_CONFIG, updatedAt: new Date().toISOString() }),
    normalizedWeights: normalize(config.weights),
  }), [config]);

  return <ControlCenterContext.Provider value={value}>{children}</ControlCenterContext.Provider>;
}

export function useControlCenter() {
  const ctx = useContext(ControlCenterContext);
  if (!ctx) throw new Error('useControlCenter must be used within ControlCenterProvider');
  return ctx;
}

/* =========================================================================
   Pure helpers — usable outside React (e.g. in geo.ts) by reading localStorage.
   Always falls back to DEFAULT_CONFIG safely.
   ========================================================================= */

export function readControlCenterConfig(): ControlCenterConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const p = JSON.parse(raw) as ControlCenterConfig;
    return {
      ...DEFAULT_CONFIG,
      ...p,
      weights: { ...DEFAULT_WEIGHTS, ...(p.weights ?? {}) },
      emergency: { ...DEFAULT_CONFIG.emergency, ...(p.emergency ?? {}) },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Composite ranking score (lower = better).
 * Inputs are normalized to 0..1 BEFORE entering this function:
 *  - distance01: distance / maxDistanceKm  (close=0)
 *  - stock01:    1 - clamp(stock/threshold) (in stock plenty=0)
 *  - reputation01: 1 - reputationScore     (best reputation=0)
 */
export function compositeScore(
  distance01: number,
  stock01: number,
  reputation01: number,
  weights: GeoWeights = DEFAULT_WEIGHTS,
): number {
  const w = normalize(weights);
  return w.distance * distance01 + w.stock * stock01 + w.reputation * reputation01;
}
