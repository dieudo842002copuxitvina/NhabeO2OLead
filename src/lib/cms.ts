import { supabase } from '@/integrations/supabase/client';

export type CmsStatus = 'draft' | 'published' | 'archived';

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  body: string;
  category: string;
  tags: string[];
  crop_tags: string[];
  terrain_tags: string[];
  related_product_ids: string[];
  status: CmsStatus;
  featured: boolean;
  view_count: number;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsCaseStudy {
  id: string;
  slug: string;
  title: string;
  customer_name: string | null;
  province: string | null;
  district: string | null;
  crop: string | null;
  area_ha: number | null;
  summary: string | null;
  body: string;
  cover_image: string | null;
  gallery: string[];
  related_product_ids: string[];
  dealer_name: string | null;
  installer_name: string | null;
  status: CmsStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ARTICLE_CATEGORIES = [
  { key: 'guide', label: 'Hướng dẫn kỹ thuật' },
  { key: 'tips', label: 'Mẹo nhà nông' },
  { key: 'product', label: 'Giới thiệu sản phẩm' },
  { key: 'news', label: 'Tin tức' },
  { key: 'crop-care', label: 'Chăm sóc cây trồng' },
];

export async function fetchArticles(): Promise<CmsArticle[]> {
  const { data, error } = await (supabase as any)
    .from('cms_articles')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsArticle[];
}

export async function fetchCaseStudies(): Promise<CmsCaseStudy[]> {
  const { data, error } = await (supabase as any)
    .from('cms_case_studies')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsCaseStudy[];
}

export async function uploadToCmsMedia(file: File, prefix = 'misc'): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('cms-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('cms-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductDoc(file: File, productSlug: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'pdf';
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 60);
  const path = `${productSlug || 'general'}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('product-docs').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-docs').getPublicUrl(path);
  return data.publicUrl;
}
