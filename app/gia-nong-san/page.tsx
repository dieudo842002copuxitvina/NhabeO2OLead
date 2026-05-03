"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, TrendingUp, TrendingDown, Minus, Calculator, 
  ArrowRight, Wind, Droplets, Sun, AlertTriangle, 
  CloudRain, Thermometer, ShoppingCart, BarChart3
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * Types & Constants
 * ───────────────────────────────────────────── */

export interface AgriCommodity {
  id: string;
  name: string;
  category: string;
  region: string;
  current_price: number;
  unit: string;
  change_percent: number;
  trend_7d: number[];
}

const MOCK_DATA: AgriCommodity[] = [
  { id: "ca-phe-robusta", name: "Cà Phê Robusta", category: "Cà Phê", region: "Đắk Lắk", current_price: 107500, unit: "đ/kg", change_percent: 1.8, trend_7d: [102000, 103500, 104000, 103000, 105000, 106500, 107500] },
  { id: "ca-phe-arabica", name: "Cà Phê Arabica", category: "Cà Phê", region: "Lâm Đồng", current_price: 128000, unit: "đ/kg", change_percent: -0.5, trend_7d: [129000, 128500, 129500, 130000, 128000, 128500, 128000] },
  { id: "ho-tieu-den", name: "Hồ Tiêu Đen", category: "Hồ Tiêu", region: "Gia Lai", current_price: 149800, unit: "đ/kg", change_percent: 0.9, trend_7d: [145000, 146000, 147500, 148000, 148500, 149000, 149800] },
  { id: "ho-tieu-trang", name: "Hồ Tiêu Trắng", category: "Hồ Tiêu", region: "Bà Rịa - Vũng Tàu", current_price: 192000, unit: "đ/kg", change_percent: 1.4, trend_7d: [188000, 189000, 189500, 190000, 191000, 191500, 192000] },
  { id: "gao-st25", name: "Gạo ST25", category: "Lúa Gạo", region: "Sóc Trăng", current_price: 35000, unit: "đ/kg", change_percent: 0.0, trend_7d: [35000, 35000, 35000, 35000, 35000, 35000, 35000] },
  { id: "lua-om5451", name: "Lúa OM5451", category: "Lúa Gạo", region: "An Giang", current_price: 9650, unit: "đ/kg", change_percent: -1.2, trend_7d: [9800, 9750, 9700, 9700, 9680, 9650, 9650] },
  { id: "sau-rieng-ri6", name: "Sầu Riêng Ri6", category: "Trái Cây", region: "Tiền Giang", current_price: 76500, unit: "đ/kg", change_percent: 2.4, trend_7d: [70000, 71500, 72000, 74000, 75000, 76000, 76500] },
  { id: "thanh-long-ruot-do", name: "Thanh Long Ruột Đỏ", category: "Trái Cây", region: "Bình Thuận", current_price: 22400, unit: "đ/kg", change_percent: -0.8, trend_7d: [24000, 23500, 23000, 22800, 22500, 22600, 22400] },
  { id: "xoai-cat-chu", name: "Xoài Cát Chu", category: "Trái Cây", region: "Đồng Tháp", current_price: 28600, unit: "đ/kg", change_percent: 1.3, trend_7d: [27000, 27500, 27500, 28000, 28200, 28500, 28600] },
  { id: "vai-thieu", name: "Vải Thiều", category: "Trái Cây", region: "Bắc Giang", current_price: 40200, unit: "đ/kg", change_percent: 3.1, trend_7d: [35000, 36000, 37500, 38000, 39000, 39500, 40200] },
];

const TABS_CONFIG = [
  { value: "all", label: "Tất cả" },
  { value: "Cà Phê", label: "Cà Phê" },
  { value: "Hồ Tiêu", label: "Hồ Tiêu" },
  { value: "Lúa Gạo", label: "Lúa Gạo" },
  { value: "Trái Cây", label: "Trái Cây" },
];

/* ─────────────────────────────────────────────
 * Sparkline Component
 * ───────────────────────────────────────────── */

interface SparklineProps {
  data: number[];
  trend: "up" | "down" | "neutral";
}

function Sparkline({ data, trend }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const lineColor = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#94a3b8";

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={lineColor} 
          strokeWidth={1.5} 
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────
 * Change Badge Component
 * ───────────────────────────────────────────── */

interface ChangeBadgeProps {
  value: number;
}

function ChangeBadge({ value }: ChangeBadgeProps) {
  const isUp = value > 0;
  const isDown = value < 0;
  const isNeutral = value === 0;

  if (isUp) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
        <TrendingUp className="w-3 h-3" />
        +{value}%
      </Badge>
    );
  }
  if (isDown) {
    return (
      <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 gap-1">
        <TrendingDown className="w-3 h-3" />
        {value}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Minus className="w-3 h-3" />
      {value}%
    </Badge>
  );
}

/* ─────────────────────────────────────────────
 * Market Table Row Component
 * ───────────────────────────────────────────── */

interface MarketRowProps {
  item: AgriCommodity;
  flashState: "up" | "down" | null;
  onRowClick: (id: string) => void;
}

function MarketRow({ item, flashState, onRowClick }: MarketRowProps) {
  const trend = item.change_percent > 0 ? "up" : item.change_percent < 0 ? "down" : "neutral";

  return (
    <TableRow 
      onClick={() => onRowClick(item.id)}
      className={cn(
        "cursor-pointer hover:bg-muted/50 transition-colors",
        flashState === "up" && "animate-[flash-green_1s_ease-in-out]",
        flashState === "down" && "animate-[flash-red_1s_ease-in-out]"
      )}
    >
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.category}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{item.region}</span>
        </div>
      </TableCell>
      <TableCell className="font-bold text-lg">
        <div>{new Intl.NumberFormat("vi-VN").format(item.current_price)}</div>
        <div className="text-xs text-muted-foreground font-normal">{item.unit}</div>
      </TableCell>
      <TableCell>
        <ChangeBadge value={item.change_percent} />
      </TableCell>
      <TableCell className="w-28">
        <Sparkline data={item.trend_7d} trend={trend} />
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────
 * Market Table Component
 * ───────────────────────────────────────────── */

interface MarketTableProps {
  data: AgriCommodity[];
  priceFlash: Record<string, "up" | "down" | null>;
  onRowClick: (id: string) => void;
}

function MarketTable({ data, priceFlash, onRowClick }: MarketTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[200px]">Nông Sản</TableHead>
          <TableHead>Khu Vực</TableHead>
          <TableHead>Giá Hôm Nay</TableHead>
          <TableHead>Biến Động</TableHead>
          <TableHead className="w-32">Xu Hướng 7N</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <MarketRow
            key={item.id}
            item={item}
            flashState={priceFlash[item.id]}
            onRowClick={onRowClick}
          />
        ))}
      </TableBody>
    </Table>
  );
}

/* ─────────────────────────────────────────────
 * Profit Calculator Card Component
 * ───────────────────────────────────────────── */

interface ProfitCalculatorCardProps {
  products: AgriCommodity[];
}

function ProfitCalculatorCard({ products }: ProfitCalculatorCardProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [yieldAmount, setYieldAmount] = useState("1000");
  const [cost, setCost] = useState("20000000");

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [selectedProductId, products]
  );

  const estimatedProfit = useMemo(() => {
    const yieldNum = parseFloat(yieldAmount) || 0;
    const costNum = parseFloat(cost) || 0;
    const revenue = yieldNum * (selectedProduct?.current_price || 0);
    return revenue - costNum;
  }, [yieldAmount, cost, selectedProduct]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Tính Lợi Nhuận</CardTitle>
            <CardDescription>Ước tính thu nhập dự kiến</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chọn nông sản</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.region}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Giá thị trường: <span className="font-semibold text-emerald-600">
              {new Intl.NumberFormat("vi-VN").format(selectedProduct?.current_price || 0)} đ/kg
            </span>
          </p>
        </div>

        {/* Yield Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Sản lượng (kg)</label>
          <Input
            type="number"
            value={yieldAmount}
            onChange={(e) => setYieldAmount(e.target.value)}
            placeholder="VD: 1000"
            className="text-base font-medium"
          />
        </div>

        {/* Cost Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Chi phí (VNĐ)</label>
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="VD: 20000000"
            className="text-base font-medium"
          />
        </div>

        {/* Result */}
        <div className={cn(
          "mt-6 p-4 rounded-xl border-2 transition-colors",
          estimatedProfit >= 0 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-rose-50 border-rose-200"
        )}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Dự Kiến Thu Về
          </p>
          <p className={cn(
            "text-2xl font-bold",
            estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"
          )}>
            {new Intl.NumberFormat("vi-VN").format(estimatedProfit)} đ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
 * Weather Advisory Card Component
 * ───────────────────────────────────────────── */

function WeatherAdvisoryCard() {
  const weatherMetrics = [
    { icon: Thermometer, label: "Nhiệt độ", value: "28°C", color: "text-orange-500" },
    { icon: Droplets, label: "Độ Ẩm", value: "75%", color: "text-blue-500" },
    { icon: Wind, label: "Tốc độ gió", value: "12 km/h", color: "text-teal-500" },
    { icon: CloudRain, label: "Lượng mưa", value: "2.4 mm", color: "text-cyan-500" },
  ];

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Radar Thời Tiết</CardTitle>
            <CardDescription>Vi Mô Khí Hậu Nông Vụ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weather Grid */}
        <div className="grid grid-cols-2 gap-3">
          {weatherMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <metric.icon className={cn("w-4 h-4", metric.color)} />
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-semibold text-sm">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ET0 Full Width */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
          <Sun className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-blue-600 font-medium">ET₀ (Bốc Hơi Ngày)</p>
            <p className="font-bold text-blue-700">4.2 mm/ngày</p>
          </div>
        </div>

        {/* AI Advisory Alert */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Cảnh Báo Sương Muối</AlertTitle>
          <AlertDescription className="text-amber-700">
            Cấp độ 2 cho khu vực Đắk Lắk vào sáng mai. Nên sử dụng hệ thống phun sương làm ấm.
          </AlertDescription>
        </Alert>

        {/* CTA Button */}
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <ShoppingCart className="w-4 h-4" />
          Xem Giải Pháp
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
 * Main Page Component
 * ───────────────────────────────────────────── */

export default function GiaNongSanPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<AgriCommodity[]>(MOCK_DATA);
  const [priceFlash, setPriceFlash] = useState<Record<string, "up" | "down" | null>>({});
  const [activeTab, setActiveTab] = useState("all");

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const newPrices = [...prev];
        const numUpdates = Math.random() > 0.5 ? 2 : 1;
        const flashUpdates: Record<string, "up" | "down" | null> = {};

        for (let i = 0; i < numUpdates; i++) {
          const randomIndex = Math.floor(Math.random() * newPrices.length);
          const item = newPrices[randomIndex];
          const change = item.current_price * (Math.random() * 0.002 - 0.001);
          const newPrice = Math.round(item.current_price + change);

          newPrices[randomIndex] = {
            ...item,
            current_price: newPrice,
            change_percent: Number((item.change_percent + (Math.random() * 0.2 - 0.1)).toFixed(1)),
          };

          flashUpdates[item.id] = change > 0 ? "up" : "down";
        }

        setPriceFlash(flashUpdates);
        setTimeout(() => setPriceFlash({}), 1000);

        return newPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return prices;
    return prices.filter((item) => item.category === activeTab);
  }, [prices, activeTab]);

  const handleRowClick = (slug: string) => {
    router.push(`/gia-nong-san/${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Market Table ── */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bảng Giá Nông Sản</CardTitle>
                <CardDescription>
                  Cập nhật real-time mỗi 5 giây từ các vùng trồng trọt
                </CardDescription>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-5">
                    {TABS_CONFIG.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <MarketTable
                  data={filteredData}
                  priceFlash={priceFlash}
                  onRowClick={handleRowClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Sidebar ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 lg:self-start">
            <ProfitCalculatorCard products={prices} />
            <WeatherAdvisoryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
