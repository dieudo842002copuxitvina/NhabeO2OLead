/**
 * Mini-CRM Leads Store
 * Captures O2O lead events (Zalo / Call clicks) as actionable leads for dealers.
 * In-memory + localStorage persistence (mock backend).
 */

export type LeadChannel = 'zalo' | 'call' | 'inquiry';
export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

export interface Lead {
  id: string;
  dealerId: string;
  channel: LeadChannel;
  productId?: string;
  productName?: string;
  customerHint?: string; // anonymized: "Khách từ TP.HCM" or partial phone
  customerName?: string;
  customerPhone?: string;        // full phone for partner-only views
  customerLat?: number;
  customerLng?: number;
  source: string;        // page url
  status: LeadStatus;
  note?: string;
  createdAt: number;
}

const STORAGE_KEY = 'agriflow_leads';

function load(): Lead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedLeads();
  } catch {
    return seedLeads();
  }
}

function save(leads: Lead[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    /* noop */
  }
}

function seedLeads(): Lead[] {
  const now = Date.now();
  const seed: Lead[] = [
    {
      id: 'L-001', dealerId: 'd-1', channel: 'zalo',
      productId: 'p-1', productName: 'Hệ thống tưới nhỏ giọt Netafim Pro',
      customerHint: 'Khách từ TP.HCM · ****567', source: '/products/tuoi-nho-giot-netafim-pro',
      status: 'new', createdAt: now - 1000 * 60 * 12,
    },
    {
      id: 'L-002', dealerId: 'd-1', channel: 'call',
      productId: 'p-9', productName: 'Máy bơm năng lượng mặt trời Lorentz PS2-150',
      customerHint: 'Khách từ Đồng Nai · ****812', source: '/products/may-bom-solar-lorentz',
      status: 'contacted', note: 'Đã báo giá, chờ phản hồi', createdAt: now - 1000 * 60 * 60 * 3,
    },
    {
      id: 'L-003', dealerId: 'd-1', channel: 'zalo',
      productId: 'p-3', productName: 'Cảm biến độ ẩm đất IoT ST-100',
      customerHint: 'Khách từ Bình Dương · ****034', source: '/diem-ban/dai-ly-nong-phat',
      status: 'won', note: 'Đã chốt 5 cảm biến', createdAt: now - 1000 * 60 * 60 * 26,
    },
    {
      id: 'L-004', dealerId: 'd-1', channel: 'inquiry',
      productId: 'p-6', productName: 'Bộ điều khiển tưới tự động AC-8',
      customerHint: 'Khách từ Long An · ****221', source: '/products/dieu-khien-tuoi-ac8',
      status: 'new', createdAt: now - 1000 * 60 * 45,
    },
  ];
  save(seed);
  return seed;
}

let cache: Lead[] | null = null;
const subscribers = new Set<() => void>();

function getCache(): Lead[] {
  if (!cache) cache = load();
  return cache;
}

function notify() {
  subscribers.forEach(fn => fn());
}

export function getLeads(dealerId?: string): Lead[] {
  const all = getCache();
  return dealerId ? all.filter(l => l.dealerId === dealerId) : all;
}

export function pushLead(input: Omit<Lead, 'id' | 'createdAt' | 'status'> & { status?: LeadStatus }): Lead {
  const lead: Lead = {
    ...input,
    id: `L-${String(getCache().length + 1).padStart(3, '0')}`,
    status: input.status ?? 'new',
    createdAt: Date.now(),
  };
  const next = [lead, ...getCache()];
  cache = next;
  save(next);
  notify();
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus, note?: string) {
  const next = getCache().map(l => (l.id === id ? { ...l, status, note: note ?? l.note } : l));
  cache = next;
  save(next);
  notify();
}

export function subscribeLeads(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function leadStats(dealerId?: string) {
  const list = getLeads(dealerId);
  return {
    total: list.length,
    new: list.filter(l => l.status === 'new').length,
    contacted: list.filter(l => l.status === 'contacted').length,
    won: list.filter(l => l.status === 'won').length,
    zalo: list.filter(l => l.channel === 'zalo').length,
    call: list.filter(l => l.channel === 'call').length,
  };
}
