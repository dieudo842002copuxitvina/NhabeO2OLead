export interface CropCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CropItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image_url: string;
  tier: 1 | 2;
}

export interface PriceRecord {
  id: string;
  crop_id: string;
  province: string;
  price: number;
  unit: string;
  date: string;
  change_percentage: number;
  is_verified: boolean;
}
