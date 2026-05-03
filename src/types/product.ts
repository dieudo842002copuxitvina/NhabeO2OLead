/**
 * Product Types for Agri-Commerce
 * Reflects Supabase products table schema with O2O technical specifications
 * 
 * SUPABASE SCHEMA REFERENCE:
 * ───────────────────────
 * Table: products
 * - tech_type: enum('Bơm Thủy Lực', 'Ống Chính', 'Ống Nhánh', 'Béc Tưới', 'Bộ Lọc Trung Tâm', 'Phụ Kiện')
 * - category_id: uuid references product_categories(id)
 */

// Tech type enum - MUST match Supabase enum exactly
export type TechType = 
  | "Bơm Thủy Lực"
  | "Ống Chính"
  | "Ống Nhánh"
  | "Béc Tưới"
  | "Bộ Lọc Trung Tâm"
  | "Phụ Kiện";

// Tech type labels for display
export const TECH_TYPE_LABELS: Record<TechType, string> = {
  "Bơm Thủy Lực": "Bơm Thủy Lực",
  "Ống Chính": "Ống Chính",
  "Ống Nhánh": "Ống Nhánh",
  "Béc Tưới": "Béc Tưới",
  "Bộ Lọc Trung Tâm": "Bộ Lọc Trung Tâm",
  "Phụ Kiện": "Phụ Kiện",
};

// Tech type enum values for Zod validation
export const TECH_TYPE_OPTIONS = [
  "Bơm Thủy Lực",
  "Ống Chính",
  "Ống Nhánh",
  "Béc Tưới",
  "Bộ Lọc Trung Tâm",
  "Phụ Kiện",
] as const;

// Product attributes stored as JSONB in Supabase
export interface ProductAttributes {
  flow_rate_lph?: number;      // Lưu lượng (lít/giờ)
  max_pressure_bar?: number;   // Áp suất tối đa (bar)
  inner_diameter_mm?: number;  // Đường kính trong (mm)
  power_hp?: number;           // Công suất (HP)
  voltage?: string;            // Điện áp
  material?: string;           // Chất liệu
  warranty_years?: number;     // Bảo hành (năm)
  [key: string]: string | number | boolean | undefined | null;
}

// Main Product interface - matches Supabase schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  unit: string;
  category_id: string;                    // Foreign key to product_categories (UUID)
  specialty_group_key: string | null;
  image: string | null;
  media: ProductAttributes | null;         // JSONB for additional media
  attributes: ProductAttributes;           // JSONB technical specifications
  tags: string[];
  crop_tags: string[];
  terrain_tags: string[];
  active: boolean;
  stock: number;
  tech_type: TechType;                   // Enum from Supabase
  is_whitelist: boolean;                  // Cho phép đưa vào Máy tính BOM
  in_stock: boolean;                     // Còn hàng
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// Form values for creating/editing products
export interface ProductFormValues {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  unit: string;
  category_id: string;                   // UUID from product_categories
  specialty_group_key: string | null;
  image: string | null;
  attributes: {
    flow_rate_lph?: number;
    max_pressure_bar?: number;
    inner_diameter_mm?: number;
    power_hp?: number;
  };
  tags: string[];
  crop_tags: string[];
  terrain_tags: string[];
  active: boolean;
  stock: number;
  tech_type: TechType;                   // Enum value
  is_whitelist: boolean;
  in_stock: boolean;
}

// Category for product grouping (from product_categories table)
export interface ProductCategory {
  id: string;                            // UUID from Supabase
  key: string;
  label: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  active: boolean;
}

// Default categories - replace with API call to Supabase
// These are for development/demo purposes
export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "uuid-tram", key: "tram", label: "Trạm Trung Tâm", icon: null, description: null, sort_order: 1, active: true },
  { id: "uuid-bec", key: "bec", label: "Béc Tưới", icon: null, description: null, sort_order: 2, active: true },
  { id: "uuid-ong", key: "ong", label: "Ống Dẫn", icon: null, description: null, sort_order: 3, active: true },
  { id: "uuid-van", key: "van", label: "Van & Phụ Kiện", icon: null, description: null, sort_order: 4, active: true },
  { id: "uuid-bom", key: "bom", label: "Máy Bơm", icon: null, description: null, sort_order: 5, active: true },
  { id: "uuid-phanbon", key: "phanbon", label: "Phân Bón", icon: null, description: null, sort_order: 6, active: true },
];

// Mock products for development - image set to null to avoid mock data
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Bộ Điều Khiển Tưới Smart 8 Zone",
    slug: "bo-dieu-khien-tuoi-smart-8-zone",
    sku: "TU-SMART-8Z",
    description: "Bộ điều khiển tưới thông minh 8 vùng với kết nối WiFi và điều khiển qua app",
    price: 12500000,
    unit: "đ/bộ",
    category_id: "uuid-tram",
    specialty_group_key: "tram",
    image: null,  // Use null for real uploads
    media: null,
    attributes: {
      flow_rate_lph: undefined,
      max_pressure_bar: undefined,
      inner_diameter_mm: undefined,
      power_hp: undefined,
      voltage: "220V",
      warranty_years: 2,
    },
    tags: ["best-seller", "smart"],
    crop_tags: ["ca-phe", "sau-rieng"],
    terrain_tags: ["dong-bang", "trung-du"],
    active: true,
    stock: 50,
    tech_type: "Phụ Kiện",  // Use Supabase enum value
    is_whitelist: true,
    in_stock: true,
    created_at: "2026-01-15T10:30:00Z",
    updated_at: "2026-04-20T14:20:00Z",
    created_by: null,
    updated_by: null,
  },
  {
    id: "2",
    name: "Béc Tưới Nhỏ Giọt Anti-Siphon",
    slug: "bec-tuoi-nho-giot-anti-siphon",
    sku: "BEC-NS-AS",
    description: "Béc tưới nhỏ giọt chống hút ngược, phù hợp cho cây trồng trong hàng",
    price: 45000,
    unit: "đ/cái",
    category_id: "uuid-bec",
    specialty_group_key: "bec",
    image: null,
    media: null,
    attributes: {
      flow_rate_lph: 4,
      max_pressure_bar: 2.5,
      inner_diameter_mm: 16,
    },
    tags: ["tiet-kiem-nuoc"],
    crop_tags: ["hoa", "rau"],
    terrain_tags: ["vuon"],
    active: true,
    stock: 5000,
    tech_type: "Béc Tưới",  // Use Supabase enum value
    is_whitelist: true,
    in_stock: true,
    created_at: "2026-02-01T08:00:00Z",
    updated_at: "2026-04-18T10:00:00Z",
    created_by: null,
    updated_by: null,
  },
  {
    id: "3",
    name: "Máy Bơm Tưới Ly Tâm 2HP",
    slug: "may-bom-tuoi-ly-tam-2hp",
    sku: "BOM-LT-2HP",
    description: "Máy bơm ly tâm trục ngang 2HP, phù hợp cho hệ thống tưới phun mưa",
    price: 4200000,
    unit: "đ/máy",
    category_id: "uuid-bom",
    specialty_group_key: "bom",
    image: null,
    media: null,
    attributes: {
      flow_rate_lph: 12000,
      max_pressure_bar: 5,
      power_hp: 2,
      voltage: "380V",
    },
    tags: ["bao-hanh-5-nam"],
    crop_tags: ["ca-phe", "sau-rieng"],
    terrain_tags: ["dong-bang"],
    active: true,
    stock: 25,
    tech_type: "Bơm Thủy Lực",  // Use Supabase enum value
    is_whitelist: true,
    in_stock: true,
    created_at: "2026-02-15T09:15:00Z",
    updated_at: "2026-04-15T16:30:00Z",
    created_by: null,
    updated_by: null,
  },
  {
    id: "4",
    name: "Ống PVC-U Phi 90mm",
    slug: "ong-pvc-u-phi-90mm",
    sku: "ONG-PVC-90",
    description: "Ống PVC-U đường kính 90mm, dày 4.3mm, chịu áp lực cao",
    price: 385000,
    unit: "đ/m",
    category_id: "uuid-ong",
    specialty_group_key: "ong",
    image: null,
    media: null,
    attributes: {
      inner_diameter_mm: 90,
      max_pressure_bar: 12.5,
    },
    tags: [],
    crop_tags: [],
    terrain_tags: [],
    active: true,
    stock: 1000,
    tech_type: "Ống Chính",  // Use Supabase enum value
    is_whitelist: true,
    in_stock: true,
    created_at: "2026-03-01T11:00:00Z",
    updated_at: "2026-04-10T08:45:00Z",
    created_by: null,
    updated_by: null,
  },
];
