"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Search, Droplets, Thermometer, CloudRain, Wind, Sun, 
  TrendingUp, TrendingDown, MapPin, Phone, Leaf, Calculator,
  ChevronRight, Sprout, AlertTriangle, ArrowRight,
  Globe, Newspaper, BookOpen, Clock, User, Zap, Lightbulb, Package
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CropSolutionsTabs from "@/components/CropSolutionsTabs";

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

const PRICE_TICKERS = [
  { id: "ca-phe", name: "Cà Phê Robusta", price: 107500, change: 1.8, unit: "đ/kg" },
  { id: "ho-tieu", name: "Hồ Tiêu Đen", price: 149800, change: -0.5, unit: "đ/kg" },
  { id: "sau-rieng", name: "Sầu Riêng Ri6", price: 76500, change: 2.4, unit: "đ/kg" },
  { id: "gao", name: "Gạo ST25", price: 35000, change: 0.0, unit: "đ/kg" },
];

const DEALERS = [
  {
    id: 1,
    name: "Vật Tư Nông Nghiệp Minh Quân",
    address: "123 QL14, P. Nhơn Bình, TP. Quy Nhơn, Bình Định",
    phone: "0935 123 456",
    isOpen: true,
    distance: "2.5 km",
    lat: 13.7565,
    lng: 109.2384,
    products: ["Máy bơm", "Ống tưới", "Béc tưới"]
  },
  {
    id: 2,
    name: "Điện Nước Nhựt Hưng",
    address: "456 Lê Duẩn, P. Thắng Lợi, TP. Pleiku, Gia Lai",
    phone: "0978 654 321",
    isOpen: true,
    distance: "5.8 km",
    lat: 13.9699,
    lng: 108.0024,
    products: ["Tủ điện", "Máy bơm", "Van các loại"]
  },
  {
    id: 3,
    name: "VTN Nông Lâm Nguyễn Văn Thành",
    address: "789 Trần Hưng Đạo, P. Tân Tiến, TX. Buôn Hồ, Đắk Lắk",
    phone: "0912 345 678",
    isOpen: false,
    distance: "12.3 km",
    lat: 12.7833,
    lng: 108.4167,
    products: ["Phân bón", "Thuốc BVTV", "Hạt giống"]
  },
  {
    id: 4,
    name: "Thiết Bị Tưới Cao Nguyên",
    address: "234 Nguyễn Chí Thanh, P. 6, Đà Lạt, Lâm Đồng",
    phone: "0909 888 777",
    isOpen: true,
    distance: "8.2 km",
    lat: 11.9364,
    lng: 108.4403,
    products: ["Béc tưới", "Ống PE", "Bộ lọc"]
  },
  {
    id: 5,
    name: "Vật Tư Hùng Thắng",
    address: "567 Hùng Vương, P. An Tây, TX. An Nhơn, Bình Định",
    phone: "0945 111 222",
    isOpen: true,
    distance: "15.7 km",
    lat: 13.9033,
    lng: 109.1333,
    products: ["Phân bón", "Máy bơm", "Dây tưới"]
  },
];

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

const SUGGESTED_PRODUCTS = [
  { id: 1, name: "Bộ Điều Khiển Tưới Smart", price: 12500000, unit: "đ/bộ" },
  { id: 2, name: "Béc Tưới Nhỏ Giọt", price: 45000, unit: "đ/cái" },
  { id: 3, name: "Tủ Điện Timer 8 Zone", price: 3200000, unit: "đ/tủ" },
  { id: 4, name: "Máy Bơm Tưới 2HP", price: 4200000, unit: "đ/máy" },
  { id: 5, name: "Phân Humic Acid 25kg", price: 1250000, unit: "đ/bao" },
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

function DealerItem({ dealer, isSelected, onSelect, onHover, onLeave }: DealerItemProps) {
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
        <div>
          <h4 className={cn("font-semibold text-sm", isSelected ? "text-emerald-800" : "text-slate-900")}>
            {dealer.name}
          </h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {dealer.distance}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            dealer.isOpen
              ? "text-green-600 border-green-200 bg-green-50"
              : "text-slate-500"
          )}
        >
          {dealer.isOpen ? "Đang mở" : "Đóng cửa"}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{dealer.address}</p>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <a
          href={`tel:${dealer.phone.replace(/\s/g, "")}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className={cn(
              "h-7 text-xs gap-1",
              dealer.isOpen
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-slate-200 hover:bg-slate-300 text-slate-500"
            )}
            disabled={!dealer.isOpen}
          >
            <Phone className="w-3 h-3" />
            Gọi ngay
          </Button>
        </a>
        <a
          href={`https://maps.google.com/maps?q=${dealer.lat},${dealer.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <MapPin className="w-3 h-3" />
            Chỉ đường
          </Button>
        </a>
      </div>
    </div>
  );
}

function DealerMapSection() {
  const router = useRouter();
  const [hoveredDealer, setHoveredDealer] = useState<number | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<number | null>(null);

  const handleDealerSelect = (dealer: typeof DEALERS[0]) => {
    // Navigate to dealer public profile
    const slug = `dealer-${dealer.id}`;
    router.push(`/dai-ly/${slug}`);
  };

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
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

        {/* 2-Column Grid: Map + List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Real Leaflet Map */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Bản Đồ Vệ Tinh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] lg:h-[450px]">
                <DealerMap
                  dealers={DEALERS}
                  center={[12.6667, 108.0383]}
                  zoom={8}
                  activeId={hoveredDealer}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right: Scrollable Dealer List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Danh sách Đại lý</CardTitle>
                <Badge variant="outline" className="text-xs">{DEALERS.length} đại lý</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] lg:h-[450px] px-4 pb-4">
                <div className="space-y-3 pr-4">
                  {DEALERS.map((dealer) => (
                    <DealerItem
                      key={dealer.id}
                      dealer={dealer}
                      isSelected={hoveredDealer === dealer.id || selectedDealer === dealer.id}
                      onSelect={() => handleDealerSelect(dealer)}
                      onHover={() => setHoveredDealer(dealer.id)}
                      onLeave={() => setHoveredDealer(null)}
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
 * Tier 5: Product Cross-sell Slider
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

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {SUGGESTED_PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className="flex-shrink-0 w-48 bg-white rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className="w-full h-24 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 mb-3 flex items-center justify-center">
                <Droplets className="w-8 h-8 text-slate-300" />
              </div>
              
              <h4 className="font-medium text-sm text-slate-900 mb-2 line-clamp-2">
                {product.name}
              </h4>
              <p className="text-sm font-bold text-emerald-600 mb-3">
                {new Intl.NumberFormat("vi-VN").format(product.price)} 
                <span className="text-xs font-normal text-muted-foreground ml-1">{product.unit}</span>
              </p>
              
              <Button variant="outline" className="w-full h-9 text-sm gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Xem Điểm Bán
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
 * Hero Product Showcase — Auto-rotating 3D showcase
 * ───────────────────────────────────────────── */

const HERO_PRODUCTS = [
  {
    id: 1,
    name: "Béc tưới bù áp",
    tag: "💧 Phân bổ nước 100%",
    description: "Đảm bảo nước phân bổ đều cho mọi góc độ, phù hợp địa hình đồi",
    price: "45.000",
    unit: "đ/cái",
  },
  {
    id: 2,
    name: "Bộ trung tâm lọc",
    tag: "⚡ Chống tắc nghẽn tối đa",
    description: "Hệ thống lọc đa tầng, bảo vệ đường ống và béc khỏi cặn bẩn",
    price: "2.850.000",
    unit: "đ/bộ",
  },
  {
    id: 3,
    name: "Ống LDPE nguyên sinh",
    tag: "🛡️ Độ bền trên 10 năm",
    description: "Chịu UV, chống lão hóa, chịu áp lực cao, phù hợp khí hậu Việt Nam",
    price: "18.000",
    unit: "đ/m",
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const product = HERO_PRODUCTS[currentIndex];

  return (
    <div className="hidden xl:flex flex-col items-center justify-center w-full max-w-sm">
      {/* Product Card */}
      <div
        className={cn(
          "relative w-full transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
        )}
      >
        {/* Card Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Product Image Placeholder */}
          <div className="w-full h-40 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30 flex items-center justify-center mb-4 border-2 border-dashed border-white/30">
            <div className="text-center">
              <Droplets className="w-16 h-16 text-white/50 mx-auto mb-2" />
              <p className="text-white/60 text-xs">{product.name}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="text-center">
            {/* Tag */}
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-medium mb-3">
              {product.tag}
            </span>

            {/* Name */}
            <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>

            {/* Description */}
            <p className="text-sm text-emerald-100/80 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Price */}
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-emerald-200/60">Giá tham khảo</p>
              <p className="text-lg font-bold text-white">
                {product.price} <span className="text-sm font-normal">{product.unit}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
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
                "w-2 h-2 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Hero Banner — Primary CTA Section
 * ───────────────────────────────────────────── */

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-xl">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur">
              <Sprout className="w-3 h-3 mr-1" />
              Hệ thống tưới tiêu thông minh #1 Việt Nam
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Tưới tiết kiệm 60% nước.<br />
              <span className="text-emerald-200">Tính vật tư chỉ 3 giây.</span>
            </h1>

            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Hệ thống tưới tự động cho sầu riêng, cà phê, cây ăn trái —
              Báo giá trọn gói, lắp đặt tại farm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg hover:shadow-xl transition-all rounded-lg"
              >
                <Link href="/tinh-toan" className="gap-2">
                  <span>🔥</span>
                  Tính Toán Vật Tư
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 bg-transparent border-2 border-white/40 text-white hover:bg-white/10 font-semibold backdrop-blur rounded-lg"
              >
                <Link href="/giai-phap" className="gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Khám Phá Giải Pháp
                </Link>
              </Button>
            </div>

            {/* Stats Badge */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-emerald-100">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                500+ đại lý toàn quốc
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Lắp đặt trong 48h
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Bảo hành 2 năm
              </span>
            </div>
          </div>

          {/* Right: Product Showcase */}
          <HeroProductShowcase />
        </div>
      </div>

      {/* Decorative Wave */}
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

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {SUGGESTED_PRODUCTS.map((product) => (
              <div 
                key={product.id}
                className="flex-shrink-0 w-48 bg-white rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="w-full h-24 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 mb-3 flex items-center justify-center">
                  <Droplets className="w-8 h-8 text-slate-300" />
                </div>
                
                <h4 className="font-medium text-sm text-slate-900 mb-2 line-clamp-2">
                  {product.name}
                </h4>
                <p className="text-sm font-bold text-emerald-600 mb-3">
                  {new Intl.NumberFormat("vi-VN").format(product.price)} 
                  <span className="text-xs font-normal text-muted-foreground ml-1">{product.unit}</span>
                </p>
                
                <Button variant="outline" className="w-full h-9 text-sm gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Xem Điểm Bán
                </Button>
              </div>
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
