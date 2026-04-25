/**
 * Partner Availability Store
 * Tracks "available" / "busy" status per partner (dealer or installer).
 * Used by Partner Portal to gate work distribution.
 */

export type PartnerStatus = 'available' | 'busy';

const KEY = 'agriflow_partner_status_v1';
const subscribers = new Set<() => void>();

function loadAll(): Record<string, PartnerStatus> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function saveAll(map: Record<string, PartnerStatus>) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* noop */ }
  subscribers.forEach(fn => fn());
}

export function getPartnerStatus(partnerId: string): PartnerStatus {
  return loadAll()[partnerId] ?? 'available';
}

export function setPartnerStatus(partnerId: string, status: PartnerStatus) {
  const all = loadAll();
  all[partnerId] = status;
  saveAll(all);
}

export function subscribePartnerStatus(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
