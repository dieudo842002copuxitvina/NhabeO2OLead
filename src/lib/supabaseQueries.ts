/**
 * supabaseQueries.ts
 * Centralized Supabase fetch functions — sử dụng với TanStack Query.
 *
 * Pattern: mỗi function trả về dữ liệu đã transform sẵn,
 * components chỉ cần gọi useQuery(queryKey, fetchFn) không cần biết logic DB.
 *
 * Fallback strategy: Nếu Supabase trả lỗi → trả về mock data để UI không vỡ.
 */
import { supabase } from '@/integrations/supabase/client';
import { commodityPrices, products as mockProducts, dealers } from '@/data/mock';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketPriceTicker {
  id: string;
  cropLabel: string;
  province: string;
  priceVnd: number;
  unit: string;
  /** Phần trăm thay đổi so với ngày hôm qua (tính tương đối từ DB nếu có) */
  changePct: number | null;
  recordedAt: string;
}

export interface ProductEco {
  id: string;
  name: string;
  slug: string;
  category: string;
  /** specialty_group_key — dùng để filter */
  specialtyGroupKey: string | null;
  specialtyGroupLabel: string | null;
  description: string | null;
  imageUrl: string | null;
  badge: string;
  specs: string;
  cropTags: string[];
  tags: string[];
  price: number;
  active: boolean;
}

export interface SpecialtyGroup {
  key: string;
  label: string;
  icon: string | null;
  sortOrder: number;
}

// ─── QUERY KEYS ───────────────────────────────────────────────────────────────
// Dùng làm cache key cho TanStack Query

export const QUERY_KEYS = {
  marketPrices:    ['market_prices']       as const,
  products:        ['products', 'active']  as const,
  specialtyGroups: ['specialty_groups']    as const,
} as const;

// ─── 1. Market Prices (Ticker Tape) ──────────────────────────────────────────

/**
 * Lấy giá nông sản mới nhất từ bảng market_prices.
 * Trả về 1 bản ghi mới nhất per crop_key (distinct on crop_key order by recorded_at desc).
 * Fallback → commodityPrices mock.
 */
export async function getMarketPrices(): Promise<MarketPriceTicker[]> {
  const { data, error } = await supabase
    .from('market_prices')
    .select('id, crop_key, crop_label, price_vnd, province, unit, recorded_at')
    .order('recorded_at', { ascending: false })
    .limit(30); // lấy đủ để lọc distinct

  if (error || !data || data.length === 0) {
    // Graceful fallback → mock data
    return commodityPrices.map((c, i) => ({
      id: `mock-${i}`,
      cropLabel: c.name,
      province: 'Tây Nguyên',
      priceVnd: c.currentPrice,
      unit: c.unit,
      changePct: c.change,
      recordedAt: new Date().toISOString(),
    }));
  }

  // De-duplicate: giữ bản ghi mới nhất mỗi crop_key
  const seen = new Set<string>();
  const deduped = data.filter(row => {
    if (seen.has(row.crop_key)) return false;
    seen.add(row.crop_key);
    return true;
  });

  return deduped.map(row => ({
    id:          row.id,
    cropLabel:   row.crop_label,
    province:    row.province,
    priceVnd:    row.price_vnd,
    unit:        row.unit,
    changePct:   null,   // DB chưa có cột change — sẽ tính sau khi có 2 ngày dữ liệu
    recordedAt:  row.recorded_at,
  }));
}

// ─── 2. Products (ProductEcosystemBlock) ─────────────────────────────────────

/**
 * Lấy tất cả sản phẩm active, join với product_specialty_groups.
 * Map attributes JSON → specs string ngắn gọn.
 * Fallback → mock products.
 */
export async function getActiveProducts(): Promise<ProductEco[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, specialty_group_key,
      description, image, attributes, crop_tags, tags,
      price, active,
      product_specialty_groups ( key, label, icon, sort_order )
    `)
    .eq('active', true)
    .order('name', { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback → transform mock products
    return mockProducts.map(p => ({
      id:                 p.id,
      name:               p.name,
      slug:               p.slug,
      category:           p.category_id,
      specialtyGroupKey:  null,
      specialtyGroupLabel: p.category_id,
      description:        p.description,
      imageUrl:           null,
      badge:              deriveBadge(p.tags, p.category_id),
      specs:              objectToSpecString(p.specs),
      cropTags:           p.tags,
      tags:               p.tags,
      price:          p.price,
      active:             true,
    }));
  }

  return data.map(row => {
    // Supabase join returns nested object or null
    const group = Array.isArray(row.product_specialty_groups)
      ? row.product_specialty_groups[0]
      : (row.product_specialty_groups as { key: string; label: string; icon: string | null; sort_order: number } | null);

    // attributes is Json — treat as Record<string,string>
    const attrs = (row.attributes && typeof row.attributes === 'object' && !Array.isArray(row.attributes))
      ? (row.attributes as Record<string, string>)
      : {};

    return {
      id:                  row.id,
      name:                row.name,
      slug:                row.slug,
      category:            row.category,
      specialtyGroupKey:   row.specialty_group_key,
      specialtyGroupLabel: group?.label ?? row.category,
      description:         row.description,
      imageUrl:            row.image,
      badge:               deriveBadgeFromTags(row.crop_tags ?? [], row.tags ?? []),
      specs:               objectToSpecString(attrs),
      cropTags:            row.crop_tags ?? [],
      tags:                row.tags ?? [],
      price:           row.price,
      active:              row.active,
    };
  });
}

/**
 * Lấy danh sách nhóm sản phẩm (categories) từ product_specialty_groups.
 * Dùng để render filter pills động.
 */
export async function getSpecialtyGroups(): Promise<SpecialtyGroup[]> {
  const { data, error } = await supabase
    .from('product_specialty_groups')
    .select('key, label, icon, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback static categories
    return [
      { key: 'tram',   label: 'Trạm Trung Tâm', icon: null, sortOrder: 1 },
      { key: 'bec',    label: 'Béc Tưới',        icon: null, sortOrder: 2 },
      { key: 'ong',    label: 'Ống Dẫn',         icon: null, sortOrder: 3 },
      { key: 'phanbon',label: 'Phân bón',         icon: null, sortOrder: 4 },
    ];
  }

  return data.map(r => ({
    key:       r.key,
    label:     r.label,
    icon:      r.icon,
    sortOrder: r.sort_order,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function objectToSpecString(obj: Record<string, string>): string {
  return Object.entries(obj)
    .slice(0, 3)
    .map(([k, v]) => `${v}`)
    .join(' · ');
}

function deriveBadge(tags: string[], category: string): string {
  if (tags.includes('best seller')) return 'Bán chạy';
  if (category.includes('bơm') || category.toLowerCase().includes('pump')) return 'Bảo hành 5 năm';
  if (tags.includes('tiết kiệm nước')) return 'Tiết kiệm 60% nước';
  return 'Chính hãng';
}

function deriveBadgeFromTags(cropTags: string[], tags: string[]): string {
  if (cropTags.includes('saurieng') || cropTags.includes('sầu_riêng')) return 'Phù hợp Sầu riêng';
  if (cropTags.includes('caphe') || cropTags.includes('cà_phê'))     return 'Phù hợp Cà phê';
  if (tags.includes('bảo_hành_5_năm') || tags.includes('warranty_5y')) return 'Bảo hành 5 năm';
  if (tags.includes('best_seller') || tags.includes('best seller'))  return 'Bán chạy';
  return 'Chính hãng';
}

// ─── 3. GEO-MATCHING: Tìm đại lý theo tỉnh/huyện ────────────────────────────

/** ID kho tổng — fallback khi không match được tỉnh */
const CENTRAL_DEALER_ID = dealers[0]?.id ?? null;

/**
 * Tìm đại lý phù hợp nhất dựa trên tên tỉnh.
 * Priority: tỉnh trùng khớp → kho tổng (dealer[0]).
 */
export function geoMatchDealer(provinceName: string): {
  dealerId: string | null;
  dealerName: string;
  dealerPhone: string;
  dealerZalo: string;
} {
  if (!provinceName) {
    const fallback = dealers[0];
    return {
      dealerId: fallback?.id ?? null,
      dealerName: fallback?.name ?? 'Nhà Bè Agri',
      dealerPhone: fallback?.phone ?? '',
      dealerZalo: fallback?.zalo ?? '',
    };
  }

  // Normalize: lowercase + remove diacritics (simple compare)
  const normalize = (s: string) =>
    s.toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')
     .replace(/đ/g, 'd');

  const target = normalize(provinceName);

  const match = dealers
    .filter(d => d.status === 'active')
    .find(d => normalize(d.province).includes(target) || target.includes(normalize(d.province)));

  const chosen = match ?? dealers[0];
  return {
    dealerId:   chosen?.id ?? CENTRAL_DEALER_ID,
    dealerName: chosen?.name ?? 'Nhà Bè Agri',
    dealerPhone: chosen?.phone ?? '',
    dealerZalo: chosen?.zalo ?? '',
  };
}

// ─── 4. LEAD SUBMIT: Calculator leads ────────────────────────────────────────

export interface CalcLeadPayload {
  customer_name: string;
  customer_phone: string;
  customer_province: string;
  crop: string;
  area_m2: number;
  spacing: string;
  slope: string;
  water_source: string;
  nozzle_count: number;
  pipe_meters: number;
  pump_hp: number;
  total_cost: number;
  dealer_id: string | null;
}

export interface CalcLeadResult {
  leadId: string;
  shortId: string;
  dealerName: string;
  dealerPhone: string;
  dealerZalo: string;
}

/**
 * Insert vào calculator_leads + fire Edge Function notify-lead.
 * Throws on error (useMutation sẽ bắt và xử lý).
 */
export async function submitCalcLead(
  payload: CalcLeadPayload,
  dealerInfo: { dealerName: string; dealerPhone: string; dealerZalo: string }
): Promise<CalcLeadResult> {
  const { data, error } = await supabase
    .from('calculator_leads')
    .insert({
      customer_name:     payload.customer_name,
      customer_phone:    payload.customer_phone,
      customer_province: payload.customer_province || null,
      crop:              payload.crop,
      area_m2:           payload.area_m2,
      spacing:           payload.spacing,
      slope:             payload.slope,
      water_source:      payload.water_source,
      nozzle_count:      payload.nozzle_count,
      pipe_meters:       payload.pipe_meters,
      pump_hp:           payload.pump_hp,
      total_cost:        payload.total_cost,
      dealer_id:         payload.dealer_id,
      status:            'new',
      status_history:    [{ status: 'new', at: new Date().toISOString() }],
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể gửi yêu cầu. Vui lòng thử lại.');
  }

  const leadId = data.id;
  const shortId = leadId.slice(0, 8).toUpperCase();

  // Fire-and-forget: Edge Function notify-lead
  void supabase.functions
    .invoke('notify-lead', {
      body: {
        lead_id: leadId,
        customer: {
          name:     payload.customer_name,
          phone:    payload.customer_phone,
          province: payload.customer_province,
        },
        calculator: {
          crop:         payload.crop,
          area_m2:      payload.area_m2,
          slope:        payload.slope,
          water_source: payload.water_source,
          spacing:      payload.spacing,
          nozzle_count: payload.nozzle_count,
          pipe_meters:  payload.pipe_meters,
          pump_hp:      payload.pump_hp,
          total_cost:   payload.total_cost,
        },
        dealer: {
          id:    payload.dealer_id,
          name:  dealerInfo.dealerName,
          phone: dealerInfo.dealerPhone,
          zalo:  dealerInfo.dealerZalo,
        },
      },
    })
    .catch(() => { /* swallow — non-critical */ });

  return { leadId, shortId, ...dealerInfo };
}

// ─── 5. GENERAL LEAD SUBMIT: Contact / LeadCaptureForm ───────────────────────

export interface GeneralLeadPayload {
  customer_name: string;
  customer_phone: string;
  province:       string;
  district:       string;
  crop_type:      string;
  area_m2:        number | null;
  message:        string;
  calculator_data: Record<string, unknown> | null;
  assigned_dealer_id: string | null;
  source:         string;
}

/**
 * Submit lead từ Contact Form / LeadCaptureForm vào calculator_leads table.
 * Tái dùng cùng bảng để pipeline CRM chạy một nơi.
 */
export async function submitGeneralLead(payload: GeneralLeadPayload): Promise<{ leadId: string }> {
  const { data, error } = await supabase
    .from('calculator_leads')
    .insert({
      customer_name:     payload.customer_name,
      customer_phone:    payload.customer_phone,
      customer_province: payload.province || null,
      crop:              payload.crop_type || 'Chưa xác định',
      area_m2:           payload.area_m2 ?? 0,
      spacing:           'N/A',
      slope:             'flat',
      water_source:      'unknown',
      nozzle_count:      0,
      pipe_meters:       0,
      pump_hp:           0,
      total_cost:        0,
      dealer_id:         payload.assigned_dealer_id,
      notes:             payload.message || null,
      status:            'new',
      status_history:    [{ status: 'new', source: payload.source, at: new Date().toISOString() }],
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể gửi yêu cầu. Vui lòng thử lại.');
  }

  // Fire notify-lead edge function
  void supabase.functions
    .invoke('notify-lead', {
      body: {
        lead_id: data.id,
        customer: {
          name:     payload.customer_name,
          phone:    payload.customer_phone,
          province: payload.province,
          district: payload.district,
        },
        source: payload.source,
        dealer: { id: payload.assigned_dealer_id },
      },
    })
    .catch(() => {});

  return { leadId: data.id };
}

