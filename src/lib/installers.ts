/**
 * Installer Network — Đội thợ thi công
 * KYC submission, admin approval, geo-matching, availability status.
 * Mock store (localStorage). Migrate to Lovable Cloud when ready.
 */

export type InstallerStatus = 'pending' | 'approved' | 'rejected';
export type InstallerAvailability = 'available' | 'busy' | 'offline';
export type InstallerSpecialty = 'tuoi' | 'bom' | 'dien' | 'iot' | 'duong_ong';

export interface InstallerKYC {
  fullName: string;
  phone: string;
  zalo: string;
  province: string;
  experienceYears: number;
  specialties: InstallerSpecialty[];
  cccdImage: string;     // data URL or external URL
  portfolioImages: string[]; // up to 5
}

export interface Installer extends InstallerKYC {
  id: string;
  lat: number;
  lng: number;
  rating: number;       // 0-5
  jobsDone: number;
  status: InstallerStatus;
  availability: InstallerAvailability;
  rejectReason?: string;
  createdAt: number;
}

export const SPECIALTY_META: Record<InstallerSpecialty, { label: string; emoji: string }> = {
  tuoi:     { label: 'Hệ tưới',     emoji: '💧' },
  bom:      { label: 'Máy bơm',     emoji: '⚙️' },
  dien:     { label: 'Điện 3 pha',  emoji: '⚡' },
  iot:      { label: 'IoT/Cảm biến', emoji: '📡' },
  duong_ong:{ label: 'Đường ống',    emoji: '🔧' },
};

export const AVAILABILITY_META: Record<InstallerAvailability, { label: string; color: string }> = {
  available: { label: 'Đang rảnh',     color: 'bg-success/15 text-success border-success/30' },
  busy:      { label: 'Đang thi công', color: 'bg-warning/15 text-warning border-warning/30' },
  offline:   { label: 'Tạm nghỉ',      color: 'bg-muted text-muted-foreground border-border' },
};

const STORAGE_KEY = 'agriflow_installers';

function seed(): Installer[] {
  const now = Date.now();
  const list: Installer[] = [
    {
      id: 'i-1', fullName: 'Nguyễn Văn Hùng', phone: '0901111222', zalo: '0901111222',
      province: 'Đồng Nai', lat: 10.95, lng: 107.20, experienceYears: 8,
      specialties: ['tuoi', 'bom', 'duong_ong'],
      cccdImage: '/placeholder.svg',
      portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 4.9, jobsDone: 142, status: 'approved', availability: 'available',
      createdAt: now - 1000 * 60 * 60 * 24 * 90,
    },
    {
      id: 'i-2', fullName: 'Trần Minh Tuấn', phone: '0902222333', zalo: '0902222333',
      province: 'Đồng Nai', lat: 10.91, lng: 107.28, experienceYears: 5,
      specialties: ['tuoi', 'iot'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg'],
      rating: 4.7, jobsDone: 87, status: 'approved', availability: 'busy',
      createdAt: now - 1000 * 60 * 60 * 24 * 60,
    },
    {
      id: 'i-3', fullName: 'Lê Quốc Bảo', phone: '0903333444', zalo: '0903333444',
      province: 'Lâm Đồng', lat: 11.93, lng: 108.45, experienceYears: 10,
      specialties: ['tuoi', 'bom', 'dien', 'duong_ong'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 4.8, jobsDone: 198, status: 'approved', availability: 'available',
      createdAt: now - 1000 * 60 * 60 * 24 * 120,
    },
    {
      id: 'i-4', fullName: 'Phạm Thị Lan', phone: '0904444555', zalo: '0904444555',
      province: 'Tây Ninh', lat: 11.05, lng: 106.40, experienceYears: 4,
      specialties: ['tuoi', 'iot'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg'],
      rating: 4.5, jobsDone: 52, status: 'approved', availability: 'available',
      createdAt: now - 1000 * 60 * 60 * 24 * 45,
    },
    {
      id: 'i-5', fullName: 'Võ Tấn Khoa', phone: '0905555666', zalo: '0905555666',
      province: 'Cần Thơ', lat: 10.04, lng: 105.78, experienceYears: 6,
      specialties: ['bom', 'dien'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 4.6, jobsDone: 110, status: 'approved', availability: 'busy',
      createdAt: now - 1000 * 60 * 60 * 24 * 75,
    },
    {
      id: 'i-6', fullName: 'Đặng Hữu Phúc', phone: '0906666777', zalo: '0906666777',
      province: 'Đồng Nai', lat: 10.98, lng: 107.18, experienceYears: 3,
      specialties: ['tuoi', 'duong_ong'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg'],
      rating: 4.4, jobsDone: 34, status: 'approved', availability: 'available',
      createdAt: now - 1000 * 60 * 60 * 24 * 30,
    },
    // Pending KYC ví dụ cho admin
    {
      id: 'i-7', fullName: 'Nguyễn Hoàng Nam', phone: '0907777888', zalo: '0907777888',
      province: 'Bình Phước', lat: 11.75, lng: 106.90, experienceYears: 2,
      specialties: ['tuoi'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg'],
      rating: 0, jobsDone: 0, status: 'pending', availability: 'offline',
      createdAt: now - 1000 * 60 * 60 * 6,
    },
    {
      id: 'i-8', fullName: 'Bùi Thanh Sơn', phone: '0908888999', zalo: '0908888999',
      province: 'Đắk Lắk', lat: 12.66, lng: 108.05, experienceYears: 7,
      specialties: ['bom', 'dien', 'iot'],
      cccdImage: '/placeholder.svg', portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 0, jobsDone: 0, status: 'pending', availability: 'offline',
      createdAt: now - 1000 * 60 * 60 * 28,
    },
  ];
  save(list);
  return list;
}

function load(): Installer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch { return seed(); }
}

function save(list: Installer[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

let cache: Installer[] | null = null;
const subs = new Set<() => void>();

function getAll(): Installer[] {
  if (!cache) cache = load();
  return cache;
}

function notify() { subs.forEach(fn => fn()); }

export function getInstallers(filter?: { status?: InstallerStatus }): Installer[] {
  const list = getAll();
  return filter?.status ? list.filter(i => i.status === filter.status) : list;
}

export function getInstaller(id: string): Installer | undefined {
  return getAll().find(i => i.id === id);
}

export function submitInstaller(kyc: InstallerKYC, coord: { lat: number; lng: number }): Installer {
  const list = getAll();
  const next: Installer = {
    ...kyc,
    id: `i-${list.length + 1}`,
    lat: coord.lat, lng: coord.lng,
    rating: 0, jobsDone: 0,
    status: 'pending', availability: 'offline',
    createdAt: Date.now(),
  };
  cache = [next, ...list];
  save(cache);
  notify();
  return next;
}

export function setInstallerStatus(id: string, status: InstallerStatus, rejectReason?: string) {
  const next = getAll().map(i =>
    i.id === id
      ? {
          ...i,
          status,
          rejectReason: status === 'rejected' ? rejectReason : undefined,
          availability: status === 'approved' && i.availability === 'offline' ? 'available' as InstallerAvailability : i.availability,
        }
      : i
  );
  cache = next; save(next); notify();
}

export function setInstallerAvailability(id: string, availability: InstallerAvailability) {
  const next = getAll().map(i => i.id === id ? { ...i, availability } : i);
  cache = next; save(next); notify();
}

export function subscribeInstallers(fn: () => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function installerStats() {
  const list = getAll();
  return {
    total: list.length,
    pending: list.filter(i => i.status === 'pending').length,
    approved: list.filter(i => i.status === 'approved').length,
    rejected: list.filter(i => i.status === 'rejected').length,
    available: list.filter(i => i.status === 'approved' && i.availability === 'available').length,
    busy: list.filter(i => i.status === 'approved' && i.availability === 'busy').length,
  };
}
