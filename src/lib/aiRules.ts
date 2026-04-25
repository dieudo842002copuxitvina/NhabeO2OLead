/**
 * AI Rules Manager — Store + evaluator for Admin-controlled triggers.
 * 
 * Three rule types:
 *  - weather: rainfall < X mm for N consecutive days in region → push hero banner
 *  - price: commodity price change > X% in window → show popup for crop region
 *  - geo_weight: tune Geo-matching algorithm (distance vs reputation/stock)
 * 
 * Persisted to localStorage; observable via subscribe().
 */

import { commodityPrices } from '@/data/mock';

export type RuleStatus = 'active' | 'paused';

export interface WeatherRule {
  id: string;
  type: 'weather';
  status: RuleStatus;
  name: string;
  rainfallMmMax: number;       // < this value counts as "dry day"
  consecutiveDays: number;     // N
  region: string;              // e.g. "Tây Nguyên"
  bannerTitle: string;
  bannerCta: string;
  bannerCtaTo: string;
  createdAt: string;
}

export interface PriceRule {
  id: string;
  type: 'price';
  status: RuleStatus;
  name: string;
  commodity: string;           // matches commodityPrices[].name
  changePctMin: number;        // > this triggers
  windowDays: number;          // 7 = weekly
  popupTitle: string;
  popupBody: string;
  popupCta: string;
  popupCtaTo: string;
  targetCropRegion: string;    // e.g. "Tây Nguyên" — filter audience
  createdAt: string;
}

export interface GeoWeightRule {
  // weights sum to 100; UI uses a single slider
  distanceWeight: number;      // 0–100 (higher = prioritize nearer dealer)
  reputationWeight: number;    // 0–100 (higher = prioritize rating + stock)
  inStockBoost: number;        // multiplier 1.0–3.0
  updatedAt: string;
}

export type AnyRule = WeatherRule | PriceRule;

const LS_RULES = 'agriflow_ai_rules_v1';
const LS_GEO = 'agriflow_ai_geo_weights_v1';

const DEFAULT_GEO: GeoWeightRule = {
  distanceWeight: 60,
  reputationWeight: 40,
  inStockBoost: 1.5,
  updatedAt: new Date().toISOString(),
};

// ============== Storage ==============

function readRules(): AnyRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_RULES);
    if (!raw) return seedRules();
    return JSON.parse(raw) as AnyRule[];
  } catch {
    return seedRules();
  }
}

function writeRules(rules: AnyRule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_RULES, JSON.stringify(rules));
  emit();
}

function seedRules(): AnyRule[] {
  const seed: AnyRule[] = [
    {
      id: 'rule-weather-tn-drought',
      type: 'weather',
      status: 'active',
      name: 'Hạn hán Tây Nguyên',
      rainfallMmMax: 5,
      consecutiveDays: 10,
      region: 'Tây Nguyên',
      bannerTitle: 'Giải pháp tưới chống hạn cho vườn Tây Nguyên',
      bannerCta: 'Xem giải pháp chống hạn',
      bannerCtaTo: '/giai-phap',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rule-price-coffee-surge',
      type: 'price',
      status: 'active',
      name: 'Cà phê tăng giá > 20%/tuần',
      commodity: 'Cà phê',
      changePctMin: 20,
      windowDays: 7,
      popupTitle: 'Nâng cấp hệ thống tưới tự động',
      popupBody: 'Giá cà phê đang tăng mạnh — đây là thời điểm vàng để đầu tư hệ thống tưới tự động, tăng năng suất 30%.',
      popupCta: 'Xem gói nâng cấp',
      popupCtaTo: '/san-pham?category=Hệ thống tưới',
      targetCropRegion: 'Tây Nguyên',
      createdAt: new Date().toISOString(),
    },
  ];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_RULES, JSON.stringify(seed));
  }
  return seed;
}

function readGeo(): GeoWeightRule {
  if (typeof window === 'undefined') return DEFAULT_GEO;
  try {
    const raw = localStorage.getItem(LS_GEO);
    if (!raw) return DEFAULT_GEO;
    return JSON.parse(raw) as GeoWeightRule;
  } catch {
    return DEFAULT_GEO;
  }
}

function writeGeo(g: GeoWeightRule): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_GEO, JSON.stringify(g));
  emit();
}

// ============== Pub/Sub ==============

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() { listeners.forEach(l => l()); }
export function subscribeRules(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

// ============== CRUD ==============

export function getRules(): AnyRule[] { return readRules(); }
export function getGeoWeights(): GeoWeightRule { return readGeo(); }

export function saveRule(rule: AnyRule): void {
  const all = readRules();
  const idx = all.findIndex(r => r.id === rule.id);
  if (idx >= 0) all[idx] = rule; else all.push(rule);
  writeRules(all);
}

export function deleteRule(id: string): void {
  writeRules(readRules().filter(r => r.id !== id));
}

export function toggleRule(id: string): void {
  const all = readRules().map(r =>
    r.id === id ? { ...r, status: r.status === 'active' ? 'paused' as RuleStatus : 'active' as RuleStatus } : r
  );
  writeRules(all);
}

export function updateGeoWeights(patch: Partial<GeoWeightRule>): void {
  const next = { ...readGeo(), ...patch, updatedAt: new Date().toISOString() };
  // normalize sum to 100
  const sum = next.distanceWeight + next.reputationWeight;
  if (sum !== 100 && sum > 0) {
    next.distanceWeight = Math.round((next.distanceWeight / sum) * 100);
    next.reputationWeight = 100 - next.distanceWeight;
  }
  writeGeo(next);
}

// ============== Evaluators ==============

/**
 * Mock weather feed: returns last N days of rainfall (mm) for a region.
 * In production this would call OpenWeather / VietnamWeather API.
 */
function mockRainfallSeries(region: string, days: number): number[] {
  // Simulate Tây Nguyên dry season — mostly < 5mm
  const base = region === 'Tây Nguyên' ? 2 : 8;
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    // pseudo-random but deterministic per region
    const seed = (region.charCodeAt(0) + i * 7) % 10;
    out.push(Math.max(0, base + seed - 5));
  }
  return out;
}

export function evaluateWeatherRule(rule: WeatherRule): { triggered: boolean; dryDays: number } {
  const series = mockRainfallSeries(rule.region, rule.consecutiveDays);
  const dryDays = series.filter(mm => mm < rule.rainfallMmMax).length;
  return { triggered: dryDays >= rule.consecutiveDays, dryDays };
}

export function evaluatePriceRule(rule: PriceRule): { triggered: boolean; changePct: number } {
  const c = commodityPrices.find(x => x.name.toLowerCase().includes(rule.commodity.toLowerCase()));
  if (!c) return { triggered: false, changePct: 0 };
  return { triggered: c.change > rule.changePctMin, changePct: c.change };
}

/** Returns the first active+triggered weather rule (for hero banner injection) */
export function getActiveWeatherBanner(): WeatherRule | null {
  const rules = readRules().filter((r): r is WeatherRule => r.type === 'weather' && r.status === 'active');
  for (const r of rules) {
    if (evaluateWeatherRule(r).triggered) return r;
  }
  return null;
}

/** Returns active+triggered price rule for popup */
export function getActivePricePopup(): PriceRule | null {
  const rules = readRules().filter((r): r is PriceRule => r.type === 'price' && r.status === 'active');
  for (const r of rules) {
    if (evaluatePriceRule(r).triggered) return r;
  }
  return null;
}
