"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search, Droplets, Thermometer, CloudRain, Wind, Sun,
  TrendingUp, TrendingDown, MapPin, Phone, Leaf, Calculator,
  ChevronRight, Sprout, AlertTriangle, ArrowRight,
  Globe, Newspaper, BookOpen, Clock, User, Zap, Lightbulb, Package, Shield, Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AgriPriceWidget from "@/components/AgriPriceWidget";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CropSolutionsTabs from "@/components/CropSolutionsTabs";
import { useNearbyDealers, type DealerWithDistance } from "@/hooks/useNearbyDealers";
import { useApp } from "@/contexts/AppContext";

/* ─────────────────────────────────────────────
 * Dynamic Import - SSR Disabled for Leaflet
 * ───────────────────────────────────────────── */

const DealerMap = dynamic(
  () => import("@/components/DealerMap").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

/* ─────────────────────────────────────────────
 * Mock Data
 * ───────────────────────────────────────────── */

const NEWS_ARTICLES = [
  {
    id: 1,
    title: "Giá cà phê Robusta tăng mạnh sau tin đồn mất mùa ở Brazil",
    category: "Thị trường",
    thumbnail: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=338&fit=crop",
    author: "AgriHub News",
    date: "2026-04-30",
    slug: "gia-ca-phe-robusta-tang-manh"
  },
  {
    id: 2,
    title: "Hướng dẫn lắp đặt hệ thống tưới nhỏ giọt tiết kiệm 40% nước",
    category: "Kỹ thuật",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=338&fit=crop",
    author: "Kỹ sư Nguyễn Văn A",
    date: "2026-04-28",
    slug: "huong-dan-lap-dat-he-thong-tuoi-nho-giot"
  },
  {
    id: 3,
    title: "Sầu riêng R6 Đắk Lắk được mùa, nông dân phấn khởi",
    category: "Nông vụ",
    thumbnail: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=338&fit=crop",
    author: "AgriHub News",
    date: "2026-04-25",
    slug: "sau-rieng-r6-dak-lak-duoc-mua"
  },
];

const PRICE_TICKERS = [
  { id: 1, name: "Cà phê Robusta", price: 105000, change: 2.5 },
  { id: 2, name: "Sầu riêng Ri6", price: 85000, change: -1.2 },
  { id: 3, name: "Tiêu đen", price: 95000, change: 0.5 },
  { id: 4, name: "Gạo ST25", price: 35000, change: 0 },
];

const SUGGESTED_PRODUCTS = [
  { 
    id: 1, 
    name: "Bộ Điều Khiển Tưới Smart", 
    categoryName: "Hệ thống điều khiển",
    price: 12500000, 
    unit: "đ/bộ",
    slug: "bo-dieu-khien-tuoi-smart",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
    badge: "hot",
  },
  { 
    id: 2, 
    name: "Béc Tưới Nhỏ Giọt", 
    categoryName: "Béc tưới",
    price: 45000, 
    unit: "đ/cái",
    slug: "bec-tuoi-nho-giot",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80",
    badge: "sale",
  },
  { 
    id: 3, 
    name: "Tủ Điện Timer 8 Zone", 
    categoryName: "Thiết bị điện",
    price: 3200000, 
    unit: "đ/tủ",
    slug: "tu-dien-timer-8-zone",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
  { 
    id: 4, 
    name: "Máy Bơm Tưới 2HP", 
    categoryName: "Máy bơm",
    price: 4200000, 
    unit: "đ/máy",
    slug: "may-bom-tuoi-2hp",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c41?w=400&h=400&fit=crop&q=80",
    badge: "seasonal",
  },
  { 
    id: 5, 
    name: "Phân Humic Acid 25kg", 
    categoryName: "Phân bón",
    price: 1250000, 
    unit: "đ/bao",
    slug: "phan-humic-acid",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
  { 
    id: 6, 
    name: "Ống LDPE Φ20mm", 
    categoryName: "Ống dẫn",
    price: 85000, 
    unit: "đ/m",
    slug: "ong-ldpe-phi20",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80",
    badge: "bestseller",
  },
];

/* ─────────────────────────────────────────────
 * Tier 1: Weather Radar & Command Section
 * ───────────────────────────────────────────── */

function WeatherRadar() {
  const weatherMetrics = [
    { icon: Thermometer, label: "Nhiệt độ", value: "28°C", color: "text-orange-500", bgColor: "bg-orange-50" },
    { icon: Droplets, label: "Độ Ẩm", value: "75%", color: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: Wind, label: "Tốc độ gió", value: "12 km/h", color: "text-teal-500", bgColor: "bg-teal-50" },
    { icon: CloudRain, label: "Lượng mưa", value: "0 mm", color: "text-cyan-500", bgColor: "bg-cyan-50" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Sun className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-base">Radar Thời Tiết</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">Đắk Lắk</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {weatherMetrics.map((metric) => (
            <div 
              key={metric.label} 
              className={cn("flex items-center gap-2 p-3 rounded-xl", metric.bgColor)}
            >
              <metric.icon className={cn("w-5 h-5", metric.color)} />
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-bold text-sm">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-medium">ET₀ (Bốc Hơi)</p>
            <p className="font-bold text-amber-800">4.2 mm/ngày</p>
          </div>
        </div>

        <Alert className="bg-amber-50 border-amber-200 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <span className="font-semibold">Cảnh báo:</span> Dự báo khô hạn kéo dài 7 ngày tới. Khuyến cáo kiểm tra béc tưới bù áp.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function CommandSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Bạn đang tìm giá nông sản, vật tư hay điểm bán?"
          className="h-14 pl-12 pr-4 text-base bg-white border-slate-200 focus-visible:ring-emerald-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/gia-nong-san">
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Giá Nông Sản
          </Button>
        </Link>
        <Link href="/cong-cu">
          <Button variant="outline" size="sm" className="gap-2">
            <Calculator className="w-4 h-4" />
            Tính Vật Tư
          </Button>
        </Link>
        <Link href="/dai-ly">
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="w-4 h-4" />
            Tìm Đại Lý
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Bảng Giá Nhanh</h3>
          <Link href="/gia-nong-san" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            Chi tiết <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PRICE_TICKERS.map((ticker) => (
            <div 
              key={ticker.id}
              className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-muted-foreground mb-1">{ticker.name}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-bold text-slate-900">
                  {new Intl.NumberFormat("vi-VN").format(ticker.price)}
                </p>
                <Badge 
                  className={cn(
                    "gap-1",
                    ticker.change > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                    ticker.change < 0 ? "bg-rose-100 text-rose-700 hover:bg-rose-100" :
                    "bg-slate-100 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {ticker.change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                   ticker.change < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {ticker.change > 0 ? "+" : ""}{ticker.change}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Tier 2: High-Intent Tools
 * ───────────────────────────────────────────── */

function HydraulicCalculatorCard() {
  const [area, setArea] = useState("");
  const [slope, setSlope] = useState("");

  return (
    <Card className="h-full border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Droplets className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <CardTitle>Máy Tính Thủy Lực</CardTitle>
            <p className="text-sm text-muted-foreground">Tính toán BOM vật tư tưới tiêu</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Diện tích rẫy (Ha)</label>
            <Input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="VD: 5"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Độ dốc (%)</label>
            <Input
              type="number"
              value={slope}
              onChange={(e) => setSlope(e.target.value)}
              placeholder="VD: 15"
              className="h-11"
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Ước tính:</span> 2 máy bơm, 850m ống PVC63, 120 béc tưới
          </p>
        </div>
        <Link href="/cong-cu/thuy-luc">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11">
            <Calculator className="w-4 h-4 mr-2" />
            Tính Toán Vật Tư Bơm & Ống
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NutritionEngineerCard() {
  const [cropType, setCropType] = useState("ca-phe");

  return (
    <Card className="h-full border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Leaf className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <CardTitle>Kỹ Sư Dinh Dưỡng Ảo</CardTitle>
            <p className="text-sm text-muted-foreground">Lên phác đồ tưới phân tự động</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chọn loại cây trồng</label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ca-phe">Cà Phê</option>
            <option value="sau-rieng">Sầu Riêng</option>
            <option value="ho-tieu">Hồ Tiêu</option>
            <option value="lua">Lúa</option>
            <option value="thanh-long">Thanh Long</option>
          </select>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Gợi ý:</span> NPK 16-16-8, 50g/cây/lần, 3 đợt/năm
          </p>
        </div>
        <Link href="/cong-cu/bac-si-ai">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11">
            <Leaf className="w-4 h-4 mr-2" />
            Lên Phác Đồ Tưới Phân
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
 * Tier 3: O2O Dealer Map Section
 * ───────────────────────────────────────────── */

interface DealerItemProps {
  dealer: typeof DEALERS[0];
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DEALER CARD COMPONENT — works with real DB shape (DealerWithDistance)
 * ───────────────────────────────────────────────────────────────────────────── */

interface DealerItemProps {
  dealer: DealerWithDistance;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

function DealerItem({ dealer, isSelected, onSelect, onHover, onLeave }: DealerItemProps) {
  const distanceLabel = dealer.distance_km != null ? formatDistance(dealer.distance_km) : null;
  const phoneHref = dealer.phone ? `tel:${dealer.phone.replace(/\D/g, "")}` : undefined;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "bg-emerald-50 border-emerald-300 shadow-md scale-[1.02]"
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1 mr-2">
          <h4 className={cn("font-semibold text-sm", isSelected ? "text-emerald-800" : "text-slate-900")}>
            {dealer.name}
          </h4>
          {distanceLabel && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              Cách bạn {distanceLabel}
            </p>
          )}
        </div>
        {dealer.region && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            {dealer.region}
          </Badge>
        )}
      </div>

      {dealer.address && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{dealer.address}</p>
      )}

      {dealer.province && !dealer.address && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{dealer.province}</p>
      )}

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {dealer.phone ? (
          <a href={phoneHref}>
            <Button
              size="sm"
              className={cn(
                "h-7 text-xs gap-1",
                "bg-orange-500 hover:bg-orange-600"
              )}
            >
              <Phone className="w-3 h-3" />
              Gọi ngay
            </Button>
          </a>
        ) : (
          <Button size="sm" className="h-7 text-xs gap-1" disabled>
            <Phone className="w-3 h-3" />
            Gọi ngay
          </Button>
        )}
        {dealer.latitude != null && dealer.longitude != null && (
          <a
            href={`https://maps.google.com/maps?q=${dealer.latitude},${dealer.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <MapPin className="w-3 h-3" />
              Chỉ đường
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * GPS PERMISSION GATE
 * ───────────────────────────────────────────────────────────────────────────── */

function DealerMapSection() {
  const router = useRouter();
  const { userLocation, geoDetected, requestGeo } = useApp();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gpsDenied, setGpsDenied] = useState(false);

  // Trigger GPS on mount
  useEffect(() => {
    if (!geoDetected && !gpsDenied) {
      const timer = setTimeout(() => requestGeo(), 500);
      return () => clearTimeout(timer);
    }
  }, [geoDetected, gpsDenied, requestGeo]);

  // Capture GPS denial
  useEffect(() => {
    if (userLocation.lat !== 10.8231 || userLocation.lng !== 106.6297) return;
    // Still default location after a delay → likely denied
    const timer = setTimeout(() => {
      if (!geoDetected) setGpsDenied(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [geoDetected, userLocation]);

  const { dealers, isLoading, isError } = useNearbyDealers({
    lat: geoDetected ? userLocation.lat : null,
    lng: geoDetected ? userLocation.lng : null,
    radiusMeters: 50_000,
    limit: 20,
  });

  // Adapter: convert DB shape to DealerLocation for DealerMap
  const mapDealers = dealers.map((d): import("@/components/DealerMap").DealerLocation => ({
    id: d.id,
    name: d.name,
    slug: d.slug ?? undefined,
    address: d.address ?? d.province ?? "",
    phone: d.phone ?? "",
    isOpen: d.is_active ?? false,
    lat: d.latitude ?? 0,
    lng: d.longitude ?? 0,
  }));

  const handleSelect = (dealer: DealerWithDistance) => {
    const slug = dealer.slug ?? `dai-ly/${dealer.id}`;
    router.push(`/dai-ly/${slug}`);
  };

  const center: [number, number] =
    dealers.length > 0 && dealers[0].latitude && dealers[0].longitude
      ? [dealers[0].latitude, dealers[0].longitude]
      : [12.6667, 108.0383];

  // ── GPS DENIED STATE ────────────────────────────────────────────────────
  if (gpsDenied || (!geoDetected && !isLoading)) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Mạng Lưới Điểm Bán</h2>
              </div>
              <p className="text-muted-foreground">
                500+ đại lý ủy quyền toàn quốc • Tìm đại lý gần bạn nhất
              </p>
            </div>
            <Link href="/dai-ly">
              <Button variant="outline" className="gap-2">
                Xem tất cả đại lý
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Vui lòng chọn tỉnh/thành để tìm đại lý phân phối Nhà Bè Agri gần nhất
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Bật định vị GPS hoặc chọn khu vực của bạn để xem các đại lý ủy quyền trong bán kính 50km.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setGpsDenied(false);
                    requestGeo();
                  }}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <MapPin className="w-4 h-4" />
                  Bật định vị GPS
                </Button>
                <Link href="/dai-ly">
                  <Button variant="outline" className="gap-2">
                    Chọn tỉnh/thành
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // ── LOADING SKELETON ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Mạng Lưới Điểm Bán</h2>
              </div>
              <p className="text-muted-foreground">
                Đang tìm đại lý gần vị trí của bạn...
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="h-[400px] lg:h-[450px] bg-slate-100 animate-pulse" />
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // ── ERROR STATE ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Không thể tải danh sách đại lý. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
          <Link href="/dai-ly" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2">
              Xem tất cả đại lý <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // ── REAL DATA ──────────────────────────────────────────────────────────
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Mạng Lưới Điểm Bán</h2>
            </div>
            <p className="text-muted-foreground">
              {dealers.length > 0
                ? `${dealers.length} đại lý trong bán kính 50km từ vị trí của bạn`
                : "Tìm đại lý gần bạn nhất"}
            </p>
          </div>
          <Link href="/dai-ly">
            <Button variant="outline" className="gap-2">
              Xem tất cả đại lý
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Bản đồ đại lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] lg:h-[450px]">
                <DealerMap
                  dealers={mapDealers}
                  center={center}
                  zoom={dealers.length > 0 ? 9 : 7}
                  activeId={hoveredId}
                />
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Danh sách Đại lý</CardTitle>
                <Badge variant="outline" className="text-xs">{dealers.length} đại lý</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] lg:h-[450px] px-4 pb-4">
                <div className="space-y-3 pr-4">
                  {dealers.map((dealer) => (
                    <DealerItem
                      key={dealer.id}
                      dealer={dealer}
                      isSelected={hoveredId === dealer.id || selectedId === dealer.id}
                      onSelect={() => handleSelect(dealer)}
                      onHover={() => setHoveredId(dealer.id)}
                      onLeave={() => setHoveredId(null)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
 * Tier 4: News & Guides Section
 * ───────────────────────────────────────────── */

function NewsSection() {
  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Tin Tức Thị Trường & Cẩm Nang Nông Vụ</h2>
            </div>
            <p className="text-muted-foreground">
              Cập nhật tin tức, kỹ thuật canh tác và xu hướng thị trường nông sản
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              Xem tất cả bài viết
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_ARTICLES.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge 
                    className={cn(
                      "absolute top-3 left-3",
                      article.category === "Thị trường" && "bg-orange-500 hover:bg-orange-600",
                      article.category === "Kỹ thuật" && "bg-blue-500 hover:bg-blue-600",
                      article.category === "Nông vụ" && "bg-emerald-500 hover:bg-emerald-600"
                    )}
                  >
                    {article.category}
                  </Badge>
                </div>

                {/* Content */}
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/blog?category=ky-thuat">
            <Badge variant="outline" className="px-4 py-2 gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <BookOpen className="w-4 h-4" />
              Kỹ Thuật Canh Tác
            </Badge>
          </Link>
          <Link href="/blog?category=thitruong">
            <Badge variant="outline" className="px-4 py-2 gap-2 hover:bg-orange-50 hover:border-orange-300 transition-colors">
              <TrendingUp className="w-4 h-4" />
              Thị Trường
            </Badge>
          </Link>
          <Link href="/blog?category=chinhsach">
            <Badge variant="outline" className="px-4 py-2 gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors">
              <Newspaper className="w-4 h-4" />
              Chính Sách
            </Badge>
          </Link>
          <Link href="/blog?category=congnghe">
            <Badge variant="outline" className="px-4 py-2 gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
              <Calculator className="w-4 h-4" />
              Công Nghệ
            </Badge>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
 * Tier 5: Product Cross-sell Slider - Enhanced
 * ───────────────────────────────────────────── */

function ProductSlider() {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Thiết Bị Gợi Ý Theo Mùa Vụ</h3>
            <p className="text-sm text-muted-foreground">Phù hợp với nhu cầu hiện tại của bạn</p>
          </div>
          <Link href="/san-pham" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            Xem thêm <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid - Mobile: scroll snap, Desktop: grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:overflow-visible md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-5 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
          {SUGGESTED_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/san-pham/${product.slug}`}
              className="group flex-shrink-0 w-[260px] md:w-auto snap-start"
            >
              <div className="h-full bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                {/* Product Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badge - Top Right */}
                  {product.badge && (
                    <div className="absolute top-2 right-2">
                      {product.badge === 'hot' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          🔥 Bán chạy
                        </span>
                      )}
                      {product.badge === 'sale' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          ⚡ Giảm giá
                        </span>
                      )}
                      {product.badge === 'seasonal' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          💧 Mùa hạn
                        </span>
                      )}
                      {product.badge === 'bestseller' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          ⭐ Yêu thích
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm font-bold text-emerald-600 mb-3">
                    {new Intl.NumberFormat("vi-VN").format(product.price)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">{product.unit}</span>
                  </p>

                  {/* CTA Link */}
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:gap-2 transition-all">
                    Xem chi tiết
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
 * Hero Product Showcase — Premium Glassmorphism
 * ───────────────────────────────────────────── */

const HERO_PRODUCTS = [
  {
    id: 1,
    name: "Béc tưới bù áp",
    tag: "💧 Phân bổ nước 100%",
    tagBg: "bg-white",
    tagText: "text-emerald-600",
    description: "Đảm bảo nước phân bổ đều cho mọi góc độ, phù hợp địa hình đồi",
    price: "45.000",
    unit: "đ/cái",
    image: "https://images.unsplash.com/photo-1617696618941-cc5f25b9c5bd?w=400&h=300&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Bộ trung tâm lọc",
    tag: "⚡ Chống tắc nghẽn tối đa",
    tagBg: "bg-amber-400",
    tagText: "text-amber-900",
    description: "Hệ thống lọc đa tầng, bảo vệ đường ống và béc khỏi cặn bẩn",
    price: "2.850.000",
    unit: "đ/bộ",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Ống LDPE nguyên sinh",
    tag: "🛡️ Độ bền trên 10 năm",
    tagBg: "bg-white",
    tagText: "text-blue-600",
    description: "Chịu UV, chống lão hóa, chịu áp lực cao, phù hợp khí hậu Việt Nam",
    price: "18.000",
    unit: "đ/m",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&q=80",
  },
];

function HeroProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_PRODUCTS.length);
        setIsAnimating(false);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const product = HERO_PRODUCTS[currentIndex];

  return (
    <div className="hidden xl:flex flex-col items-center justify-center w-full max-w-sm">
      {/* Product Card - Premium Glassmorphism */}
      <div
        className={cn(
          "relative w-full transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
        )}
      >
        {/* Glassmorphism Card */}
        <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl rounded-3xl p-6 overflow-hidden">
          {/* Glass Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          {/* Floating Tag - Positioned top-left */}
          <div className="absolute -top-1 -left-1 z-10">
            <span className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse",
              product.tagBg,
              product.tagText
            )}>
              {product.tag}
            </span>
          </div>

          {/* Product Image with 3D Effect */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-slate-100 to-slate-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
            {/* Image Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Product Info */}
          <div className="text-center relative z-10">
            {/* Name */}
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/80 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Price Badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Giá tham khảo</p>
              <p className="text-xl font-bold text-white drop-shadow-md">
                {product.price}
                <span className="text-sm font-normal text-white/80 ml-1">{product.unit}</span>
              </p>
            </div>
          </div>

          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-emerald-500/30 to-transparent rounded-tl-full" />
        </div>

        {/* Dots Indicator with glow effect */}
        <div className="flex justify-center gap-3 mt-5">
          {HERO_PRODUCTS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsAnimating(false);
                }, 300);
              }}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "bg-white w-8 shadow-lg shadow-white/50"
                  : "bg-white/40 hover:bg-white/60 w-2.5"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Hero Banner — Premium Hero with Real Background
 * ───────────────────────────────────────────── */

function HeroBanner() {
  return (
    <section className="relative overflow-hidden min-h-[600px] lg:min-h-[550px]">
      {/* Background Image - Real Agriculture Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c41?q=80&w=2000&auto=format&fit=crop')`,
        }}
      />
      
      {/* Gradient Overlay - Dark Emerald for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/80 to-emerald-800/50" />
      
      {/* Subtle Light Rays Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 py-16 md:py-20 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-xl relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">
                🌱 Hệ thống tưới tiêu thông minh #1 Việt Nam
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 drop-shadow-2xl">
              Tưới tiết kiệm<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">
                60% nước.
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl">
                Tính vật tư chỉ 3 giây.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Hệ thống tưới tự động cho sầu riêng, cà phê, cây ăn trái —
              <span className="text-emerald-300 font-medium"> Báo giá trọn gói</span>, lắp đặt tại farm.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl"
              >
                <Link href="/tinh-toan" className="gap-2">
                  <span className="text-xl">🔥</span>
                  Tính Toán Vật Tư
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-10 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold backdrop-blur-md transition-all duration-300 rounded-xl"
              >
                <Link href="/giai-phap" className="gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Khám Phá Giải Pháp
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <span>500+ đại lý</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Lắp đặt 48h</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Bảo hành 2 năm</span>
              </div>
            </div>
          </div>

          {/* Right: Product Showcase */}
          <HeroProductShowcase />
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50L48 45C96 40 192 30 288 35C384 40 480 60 576 65C672 70 768 60 864 50C960 40 1056 30 1152 35C1248 40 1344 60 1392 70L1440 80V100H0V50Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
 * Main Page Component
 * ───────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── VỊ TRÍ 1: Hero Banner ── */}
      <HeroBanner />

      {/* ── VỊ TRÍ 1.5: Agri Price Widget ── */}
      <AgriPriceWidget />

      {/* ── VỊ TRÍ 2: Giải Pháp (Solutions) ── */}
      <section className="bg-white border-b border-slate-100">
        <CropSolutionsTabs />
      </section>

      {/* ── VỊ TRÍ 3: Sản Phẩm Lõi ── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Thiết Bị Gợi Ý Theo Mùa Vụ</h2>
              <p className="text-sm text-muted-foreground">Phù hợp với nhu cầu hiện tại của bạn</p>
            </div>
          </div>

          {/* Product Grid - Mobile: scroll snap, Desktop: grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 md:overflow-visible md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-5 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
            {SUGGESTED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="group flex-shrink-0 w-[260px] md:w-auto snap-start"
              >
                <div className="h-full bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                  {/* Product Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Badge - Top Right */}
                    {product.badge && (
                      <div className="absolute top-2 right-2">
                        {product.badge === 'hot' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            🔥 Bán chạy
                          </span>
                        )}
                        {product.badge === 'sale' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            ⚡ Giảm giá
                          </span>
                        )}
                        {product.badge === 'seasonal' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            💧 Mùa hạn
                          </span>
                        )}
                        {product.badge === 'bestseller' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            ⭐ Yêu thích
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Category Tag */}
                    <span className="inline-block px-2 py-1 mb-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 rounded-md">
                      {product.categoryName}
                    </span>
                    
                    {/* Product Name */}
                    <h4 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Price */}
                    <p className="text-sm font-bold text-emerald-600 mb-3">
                      {new Intl.NumberFormat("vi-VN").format(product.price)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">{product.unit}</span>
                    </p>

                    {/* CTA Link */}
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:gap-2 transition-all">
                      Xem chi tiết
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/danh-muc">
                Xem toàn bộ danh mục <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── VỊ TRÍ 4: Công Cụ / O2O Trap ── */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="container mx-auto px-4">
          {/* Banner CTA */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Chỉ mất 3 giây để có bản vẽ vật tư
                </h2>
                <p className="text-emerald-100">
                  Thử ngay máy tính thủy lực miễn phí — Không cần đăng ký
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg shrink-0"
              >
                <Link href="/tinh-toan" className="gap-2">
                  <span className="text-xl">🔥</span>
                  Tính Vật Tư Ngay
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Tool Cards */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bộ Công Cụ Tính Toán</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HydraulicCalculatorCard />
            <NutritionEngineerCard />
          </div>
        </div>
      </section>

      {/* ── VỊ TRÍ 5: Tin Tức / Kiến Thức ── */}
      <NewsSection />

      {/* ── VỊ TRÍ 6: Dealer Map / Trust Signals ── */}
      <DealerMapSection />

      {/* ── Bottom Stats ── */}
      <section className="py-8 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">500+</p>
              <p className="text-sm text-muted-foreground">Đại lý ủy quyền</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">10K+</p>
              <p className="text-sm text-muted-foreground">Nông trại sử dụng</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">30%</p>
              <p className="text-sm text-muted-foreground">Tiết kiệm chi phí</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">24/7</p>
              <p className="text-sm text-muted-foreground">Hỗ trợ kỹ thuật</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
