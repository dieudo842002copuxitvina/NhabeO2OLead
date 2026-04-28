import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────
interface SpecDisplay {
  label: string;
  value: string;
  unit?: string;
}

interface DynamicTechCardData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  category: string;
  price: number;
  unit: string;
  specs: SpecDisplay[];
}

// ─── JSONB Key → Label + Unit Mapping ────────────────────────────────
const SPEC_LABEL_MAP: Record<string, { label: string; unit?: string }> = {
  // Van specs
  nominal_diameter: { label: 'Đường kính', unit: 'mm' },
  max_pressure: { label: 'Áp suất', unit: 'bar' },
  connection_type: { label: 'Kết nối' },
  material: { label: 'Chất liệu' },

  // Pipe specs
  outer_diameter: { label: 'ĐK ngoài', unit: 'mm' },
  wall_thickness: { label: 'Dày', unit: 'mm' },
  pressure_rating: { label: 'Cấp áp', unit: 'bar' },
  roll_length: { label: 'Dài cuộn', unit: 'm' },

  // Nozzle specs
  flow_rate: { label: 'Lưu lượng', unit: 'L/h' },
  spray_radius: { label: 'Bán kính', unit: 'm' },
  spray_angle: { label: 'Góc phun', unit: '°' },
  connection_size: { label: 'Đầu nối', unit: 'mm' },

  // Pump specs
  power: { label: 'Công suất', unit: 'HP' },
  max_flow: { label: 'Lưu lượng', unit: 'm³/h' },
  max_head: { label: 'Cột áp', unit: 'm' },
  inlet_size: { label: 'Đầu hút', unit: 'inch' },
  outlet_size: { label: 'Đầu đẩy', unit: 'inch' },
  voltage: { label: 'Điện áp', unit: 'V' },

  // Sensor specs
  measurement_range: { label: 'Phạm vi đo' },
  accuracy: { label: 'Độ chính xác' },
  protocol: { label: 'Giao thức' },
  battery_life: { label: 'Pin', unit: 'tháng' },

  // Fertilizer specs
  npk_ratio: { label: 'NPK' },
  weight: { label: 'Trọng lượng', unit: 'kg' },
  application_method: { label: 'Phương pháp' },

  // Generic fallbacks
  brand: { label: 'Thương hiệu' },
  origin: { label: 'Xuất xứ' },
  description: { label: 'Mô tả' },
};

// Priority order for choosing "important" specs per category
const CATEGORY_PRIORITY: Record<string, string[]> = {
  van: ['nominal_diameter', 'max_pressure', 'material'],
  pipe: ['outer_diameter', 'wall_thickness', 'pressure_rating'],
  nozzle: ['flow_rate', 'spray_radius', 'spray_angle'],
  pump: ['power', 'max_flow', 'max_head'],
  sensor: ['measurement_range', 'accuracy', 'protocol'],
  fertilizer: ['npk_ratio', 'weight', 'application_method'],
};

const DEFAULT_SPEC_KEYS = ['brand', 'origin', 'description'];

/**
 * Convert raw JSONB specifications into display-ready SpecDisplay[].
 * Takes the top 3 most important specs based on category priority.
 * Falls back to 'Thương hiệu', 'Xuất xứ', 'Mã SKU' if JSONB is empty.
 */
export function mapSpecsToDisplay(
  specifications: Record<string, unknown> | null | undefined,
  category: string,
  slug?: string
): SpecDisplay[] {
  if (!specifications || typeof specifications !== 'object') {
    return [
      { label: 'Thương hiệu', value: 'Nhà Bè Agri' },
      { label: 'Xuất xứ', value: 'Việt Nam' },
      { label: 'Mã SKU', value: slug?.toUpperCase()?.slice(0, 10) ?? 'N/A' },
    ];
  }

  const specs = specifications as Record<string, string | number | null | undefined>;
  const priorityKeys = CATEGORY_PRIORITY[category] ?? DEFAULT_SPEC_KEYS;

  // Pick up to 3 specs: prioritized keys first, then any available keys
  const picked: SpecDisplay[] = [];
  const usedKeys = new Set<string>();

  // First pass: use priority keys
  for (const key of priorityKeys) {
    if (picked.length >= 3) break;
    const val = specs[key];
    if (val !== null && val !== undefined && val !== '') {
      const meta = SPEC_LABEL_MAP[key];
      picked.push({
        label: meta?.label ?? key,
        value: String(val),
        unit: meta?.unit,
      });
      usedKeys.add(key);
    }
  }

  // Second pass: fill remaining slots from any available keys
  if (picked.length < 3) {
    for (const [key, val] of Object.entries(specs)) {
      if (picked.length >= 3) break;
      if (usedKeys.has(key)) continue;
      if (val === null || val === undefined || val === '') continue;
      const meta = SPEC_LABEL_MAP[key];
      picked.push({
        label: meta?.label ?? key,
        value: String(val),
        unit: meta?.unit,
      });
    }
  }

  // Final fallback if still empty
  if (picked.length === 0) {
    return [
      { label: 'Thương hiệu', value: 'Nhà Bè Agri' },
      { label: 'Xuất xứ', value: 'Việt Nam' },
      { label: 'Mã SKU', value: slug?.toUpperCase()?.slice(0, 10) ?? 'N/A' },
    ];
  }

  return picked;
}

/**
 * Server-side data fetcher for DynamicTechCard.
 * Fetches products from Supabase and maps JSONB specifications.
 */
export async function fetchTechCardProducts(limit = 8): Promise<DynamicTechCardData[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, image, category, price, unit, attributes')
    .eq('active', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DynamicTechCard] Supabase fetch error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => {
    // The "attributes" column holds JSONB specs; some rows may also have direct spec fields
    const rawSpecs = extractSpecsFromAttributes(row.attributes);

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      image: row.image,
      category: row.category,
      price: row.price,
      unit: row.unit,
      specs: mapSpecsToDisplay(rawSpecs, row.category, row.slug),
    };
  });
}

/**
 * Extracts a flat key-value record from the `attributes` JSONB column.
 * The column stores an array of { key, value, label, unit, group } objects.
 */
function extractSpecsFromAttributes(
  attributes: unknown
): Record<string, string> | null {
  if (!attributes) return null;

  // If it's already an object (flat JSONB), return directly
  if (typeof attributes === 'object' && !Array.isArray(attributes)) {
    return attributes as Record<string, string>;
  }

  // If it's an array of ProductAttribute objects
  if (Array.isArray(attributes)) {
    const result: Record<string, string> = {};
    for (const attr of attributes) {
      if (attr && typeof attr === 'object' && 'key' in attr && 'value' in attr) {
        result[attr.key as string] = String(attr.value);
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  return null;
}

// ─── React Component ─────────────────────────────────────────────────
import React from 'react';
import { cn } from '@/lib/utils';

interface DynamicTechCardProps {
  product: DynamicTechCardData;
  className?: string;
}

/**
 * DynamicTechCard — Horizontal product card with JSONB-driven spec grid.
 * 40% image, 60% content, 3-column spec display.
 * TypeScript-safe with null/undefined checks throughout.
 */
export default function DynamicTechCard({ product, className }: DynamicTechCardProps) {
  const { name, image, category, price, unit, specs, slug } = product;
  const displayImage = image ?? '/placeholder.svg';

  return (
    <a
      href={`/san-pham/${slug}`}
      className={cn(
        'group flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      {/* Image — 40% */}
      <div className="relative w-[40%] flex-shrink-0 overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <span className="absolute left-2 top-2 rounded-md bg-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {category}
        </span>
      </div>

      {/* Content — 60% */}
      <div className="flex w-[60%] flex-col justify-between p-3">
        {/* Title */}
        <div>
          <h3
            className="mb-0.5 line-clamp-2 text-sm font-bold leading-tight text-slate-900"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {name}
          </h3>
          <p className="text-xs font-semibold text-green-700">
            {price.toLocaleString('vi-VN')}đ/{unit}
          </p>
        </div>

        {/* Spec Grid — 3 columns with dividers */}
        {specs.length > 0 && (
          <div className="my-2 flex items-stretch divide-x divide-slate-200 rounded-lg border border-slate-100 bg-slate-50">
            {specs.map((spec, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-center px-1.5 py-1.5">
                <span className="text-[9px] font-medium text-slate-400 leading-none">{spec.label}</span>
                <span className="mt-0.5 text-[11px] font-bold text-green-700 leading-none">
                  {spec.value}
                  {spec.unit && (
                    <span className="ml-0.5 text-[9px] font-normal text-slate-400">{spec.unit}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SKU */}
        <p className="text-[10px] text-slate-400">
          SKU: {slug?.toUpperCase()?.replace(/-/g, '').slice(0, 8)}
        </p>
      </div>
    </a>
  );
}

export type { DynamicTechCardData, SpecDisplay };
