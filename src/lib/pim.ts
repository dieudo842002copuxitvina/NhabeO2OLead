import { supabase } from '@/integrations/supabase/client';

export interface ProductAttribute {
  group: string;
  key: string;
  label: string;
  value: string;
  unit?: string;
}

export interface MediaItem {
  title: string;
  url: string;
}

export interface ProductMedia {
  videos: MediaItem[];
  pdfs: MediaItem[];
  images: string[];
}

export interface SpecialtyGroup {
  id: string;
  key: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface CropTag {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface TerrainTag {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface PimProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  specialty_group_key: string | null;
  description: string | null;
  price: number;
  unit: string;
  image: string | null;
  stock: number;
  attributes: ProductAttribute[];
  media: ProductMedia;
  tags: string[];
  crop_tags: string[];
  terrain_tags: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const EMPTY_MEDIA: ProductMedia = { videos: [], pdfs: [], images: [] };

export function normalizeMedia(raw: unknown): ProductMedia {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_MEDIA };
  const r = raw as Partial<ProductMedia>;
  return {
    videos: Array.isArray(r.videos) ? r.videos : [],
    pdfs: Array.isArray(r.pdfs) ? r.pdfs : [],
    images: Array.isArray(r.images) ? r.images : [],
  };
}

export function normalizeAttributes(raw: unknown): ProductAttribute[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((a): a is ProductAttribute =>
    !!a && typeof a === 'object' && 'key' in a && 'label' in a && 'value' in a
  );
}

export async function fetchProducts(): Promise<PimProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    attributes: normalizeAttributes(row.attributes),
    media: normalizeMedia(row.media),
    tags: row.tags ?? [],
    crop_tags: row.crop_tags ?? [],
    terrain_tags: row.terrain_tags ?? [],
  })) as PimProduct[];
}

export async function fetchSpecialtyGroups(): Promise<SpecialtyGroup[]> {
  const { data, error } = await supabase
    .from('product_specialty_groups')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data as SpecialtyGroup[];
}

export async function fetchCropTags(): Promise<CropTag[]> {
  const { data, error } = await (supabase as any)
    .from('crop_tags')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as CropTag[];
}

export async function fetchTerrainTags(): Promise<TerrainTag[]> {
  const { data, error } = await (supabase as any)
    .from('terrain_tags')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as TerrainTag[];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** YouTube ID extraction for embed previews */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
