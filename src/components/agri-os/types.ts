export interface ValveState {
  id: string;
  name: string;
  status: 'ON' | 'OFF' | 'WARNING';
}

export interface TankLevel {
  id: 'N' | 'P' | 'K';
  level: number; // 0-100
}

export interface MarketPrice {
  product: string;
  region: string;
  price: number;
  change: number; // percentage
  trend: number[]; // sparkline data
}

export interface WeatherData {
  temp: number;
  condition: string;
  forecast: { day: string; temp: number }[];
}

export interface PriceAlert {
  id: string;
  crop: string;
  threshold: number;
  active: boolean;
}
