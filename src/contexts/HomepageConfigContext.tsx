"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type BlockKey = 'ticker' | 'weather' | 'hero' | 'map' | 'bento' | 'diary';

export interface BlockConfig {
  key: BlockKey;
  label: string;
  emoji: string;
  visible: boolean;
  order: number;
  /** Optional HSL accent color override (e.g. "142 71% 45%"). Used to tint widget headers/borders. */
  accentHsl?: string;
}

export type MapMode = 'light' | 'dark' | 'satellite';

export interface PromoBanner {
  id: string;
  imageUrl: string;
  link: string;
  alt: string;
  expiresAt: string; // ISO
  active: boolean;
}

export interface HomepageConfig {
  blocks: BlockConfig[];
  ticker: {
    mode: 'auto' | 'manual';
    manualText: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaLink: string;
  };
  seo: {
    title: string;
    description: string;
  };
  promos: PromoBanner[];
  map: {
    mode: MapMode;
    defaultRadiusKm: number;
  };
  heatmap: {
    radius: number;        // 10..80
    blur: number;          // 5..50
    maxIntensity: number;  // 0.5..3
  };
  pinnedHotspot: {
    enabled: boolean;
    province: string;
    note: string;
  };
  featuredProductIds: string[];
}

const DEFAULT_CONFIG: HomepageConfig = {
  blocks: [
    { key: 'ticker', label: 'Ticker giá nông sản', emoji: '📈', visible: true, order: 1 },
    { key: 'weather', label: 'Widget thời tiết', emoji: '🌤️', visible: true, order: 2 },
    { key: 'hero', label: 'Hero Banner', emoji: '🎯', visible: true, order: 3 },
    { key: 'map', label: 'Bản đồ tương tác', emoji: '🗺️', visible: true, order: 4 },
    { key: 'bento', label: 'Bento Grid sản phẩm', emoji: '🧩', visible: true, order: 5 },
    { key: 'diary', label: 'Nhật ký thi công', emoji: '📸', visible: true, order: 6 },
  ],
  ticker: { mode: 'auto', manualText: '🔥 Khuyến mãi tháng 4: Giảm 15% hệ thống tưới Netafim · Liên hệ ngay 1900 1234' },
  hero: {
    headline: 'Tìm đại lý gần bạn nhất',
    subheadline: 'Chọn sản phẩm → Hệ thống tìm Top 3 đại lý trong bán kính 50km → Gọi hoặc Chat Zalo ngay.',
    ctaLabel: 'Khám phá sản phẩm',
    ctaLink: '/products',
  },
  seo: {
    title: 'Nhà Bè Agri - Giải pháp tưới công nghệ cao',
    description: 'Cung cấp hệ thống tưới thông minh, béc bù áp và vật tư nông nghiệp chính hãng cho Sầu riêng, Cà phê. 500+ đại lý ủy quyền toàn quốc.',
  },
  promos: [],
  map: { mode: 'light', defaultRadiusKm: 50 },
  heatmap: { radius: 35, blur: 25, maxIntensity: 1.2 },
  pinnedHotspot: { enabled: false, province: 'Đắk Lắk', note: 'Sầu riêng tăng giá kỷ lục — cơ hội bán hệ thống tưới' },
  featuredProductIds: [],
};

const STORAGE_KEY = 'homepage_config_v1';

interface Ctx {
  config: HomepageConfig;
  setConfig: (c: HomepageConfig) => void;
  updateBlock: (key: BlockKey, patch: Partial<BlockConfig>) => void;
  resetDefaults: () => void;
  isBlockVisible: (key: BlockKey) => boolean;
  orderedVisibleBlocks: () => BlockConfig[];
}

const HomepageConfigContext = createContext<Ctx | null>(null);

export function HomepageConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<HomepageConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HomepageConfig;
        setConfigState({ ...DEFAULT_CONFIG, ...parsed, blocks: mergeBlocks(parsed.blocks) });
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
  }, [config, isInitialized]);

  const setConfig = (c: HomepageConfig) => setConfigState(c);
  const updateBlock = (key: BlockKey, patch: Partial<BlockConfig>) =>
    setConfigState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => (b.key === key ? { ...b, ...patch } : b)),
    }));
  const resetDefaults = () => setConfigState(DEFAULT_CONFIG);
  const isBlockVisible = (key: BlockKey) =>
    config.blocks.find(b => b.key === key)?.visible ?? true;
  const orderedVisibleBlocks = () =>
    [...config.blocks].filter(b => b.visible).sort((a, b) => a.order - b.order);

  return (
    <HomepageConfigContext.Provider
      value={{ config, setConfig, updateBlock, resetDefaults, isBlockVisible, orderedVisibleBlocks }}
    >
      {children}
    </HomepageConfigContext.Provider>
  );
}

function mergeBlocks(saved: BlockConfig[] | undefined): BlockConfig[] {
  if (!saved) return DEFAULT_CONFIG.blocks;
  return DEFAULT_CONFIG.blocks.map(d => saved.find(s => s.key === d.key) ?? d);
}

export function useHomepageConfig() {
  const ctx = useContext(HomepageConfigContext);
  if (!ctx) throw new Error('useHomepageConfig must be used within HomepageConfigProvider');
  return ctx;
}

export function getActivePromos(promos: PromoBanner[]): PromoBanner[] {
  const now = Date.now();
  return promos.filter(p => p.active && new Date(p.expiresAt).getTime() > now);
}
