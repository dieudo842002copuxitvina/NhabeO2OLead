export type UserRole = 'admin' | 'dealer' | 'fieldsales' | 'customer';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  brand_id: string;
  price: number;
  unit: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  specs: Record<string, any>;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface Dealer {
  id: string;
  name: string;
  region: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  totalOrders: number;
  revenue: number;
  status: 'active' | 'inactive';
  phone: string;
  zalo: string;
  image: string;
}

export interface DealerProduct {
  dealerId: string;
  productId: string;
  stock: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimeline {
  status: string;
  label: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  dealerId: string;
  dealerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  region: string;
  timeline: OrderTimeline[];
}

export interface CartItem {
  product: Product;
  dealerId: string;
  dealerName: string;
  dealerPrice: number;
  quantity: number;
}

export interface AnalyticsInsight {
  type: 'restock' | 'trending' | 'regional' | 'warning';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

export interface DealerOffer {
  dealer: Dealer;
  price: number;
  stock: number;
  distance: number;
}

// ==================== NEW ====================

export interface CommodityPrice {
  name: string;
  unit: string;
  currentPrice: number;
  change: number;
  history: { date: string; price: number }[];
}

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    humidity: number;
    rainfall: number;
    wind: number;
    condition: string;
  };
  forecast: {
    day: string;
    temp: number;
    humidity: number;
    rainfall: number;
    condition: string;
  }[];
}

export interface MarketAlert {
  type: 'warning' | 'opportunity';
  title: string;
  description: string;
  region: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  aiSummary: boolean;
}
