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
  /**
   * 1 = Sản phẩm chủ lực/trending, 2 = Sản phẩm thường.
   */
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
  /**
   * true = Giá từ hệ thống, false = Giá cộng đồng báo.
   */
  is_verified: boolean;
}

