"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Droplets,
  Filter,
  MapPin,
  Sprout,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import SeoMeta from "@/components/SeoMeta";
import { NhaBePricePageCTA } from "@/components/NhaBeConversionBox";
import {
  fetchCurrentPrices,
  fetchPriceHistory,
  getAvailableCrops,
  getAvailableRegions,
  type MarketPriceItem,
  type PriceHistoryItem,
} from "@/lib/prices";

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const MAJOR_CROPS = [
  { slug: "sau-rieng-ri6", name: "Sầu riêng Ri6", icon: "🥭" },
  { slug: "sau-rieng-monthong", name: "Sầu riêng Monthong", icon: "🥭" },
  { slug: "ca-phe-robusta", name: "Cà phê Robusta", icon: "☕" },
  { slug: "ca-phe-arabica", name: "Cà phê Arabica", icon: "☕" },
  { slug: "tieude", name: "Hạt tiêu", icon: "🌶️" },
  { slug: "dieu", name: "Hạt điều", icon: "🥜" },
  { slug: "buoi", name: "Bưởi", icon: "🍊" },
  { slug: "xoai", name: "Xoài", icon: "🥭" },
];

const CURRENCY_FORMAT = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatPrice(value: number): string {
  return CURRENCY_FORMAT.format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MARQUEE TICKER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function PriceMarquee({ prices }: { prices: MarketPriceItem[] }) {
  const marqueePrices = useMemo(() => {
    const seen = new Set<string>();
    return prices
      .filter((p) => {
        const key = p.cropSlug;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [prices]);

  if (marqueePrices.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#2E7D32] py-2.5 shadow-md">
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent" />

      <div className="animate-marquee flex gap-10 whitespace-nowrap">
        {[...marqueePrices, ...marqueePrices].map((price, idx) => (
          <Link
            key={`${price.id}-${idx}`}
            href={`#price-${price.cropSlug}`}
            className="flex items-center gap-3 text-white transition-opacity hover:opacity-90"
          >
            <Sprout className="h-4 w-4 opacity-80" />
            <span className="font-medium">{price.cropName}</span>
            <span className="font-bold">{formatPrice(price.price)}</span>
            <span className="text-xs text-white/70">{price.unit}</span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs text-white/60">{price.region}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SIDEBAR QUICK FILTERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function SidebarFilters({
  crops,
  selectedCrop,
  onCropSelect,
}: {
  crops: Array<{ slug: string; name: string }>;
  selectedCrop: string;
  onCropSelect: (slug: string) => void;
}) {
  const majorCropSlugs = MAJOR_CROPS.map((c) => c.slug);

  const majorCrops = useMemo(() => {
    return crops.filter((c) => majorCropSlugs.includes(c.slug));
  }, [crops]);

  return (
    <Card className="sticky top-4 overflow-hidden rounded-2xl border-[#E9ECEF]">
      <CardHeader className="border-b border-[#F1F5F9] bg-gradient-to-r from-[#F8FAFC] to-white pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4 text-[#4CAF50]" />
          Cây trồng chính
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          <button
            onClick={() => onCropSelect("")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              !selectedCrop
                ? "bg-[#4CAF50]/10 text-[#2F8E36]"
                : "text-[#5F6B7A] hover:bg-[#F8FAFC]"
            }`}
          >
            <span className="text-base">📋</span>
            <span className="font-medium">Tất cả</span>
          </button>

          {majorCrops.map((crop) => {
            const majorCrop = MAJOR_CROPS.find((c) => c.slug === crop.slug);
            return (
              <button
                key={crop.slug}
                onClick={() => onCropSelect(crop.slug)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCrop === crop.slug
                    ? "bg-[#4CAF50]/10 text-[#2F8E36]"
                    : "text-[#5F6B7A] hover:bg-[#F8FAFC]"
                }`}
              >
                <span className="text-base">
                  {majorCrop?.icon || "🌱"}
                </span>
                <span className="font-medium">{crop.name}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRICE CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function PriceCard({
  price,
  isSelected,
  onClick,
}: {
  price: MarketPriceItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      id={`price-${price.cropSlug}`}
      onClick={onClick}
      className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg ${
        isSelected
          ? "border-[#4CAF50] shadow-md ring-2 ring-[#4CAF50]/20"
          : "border-[#E9ECEF] hover:border-[#4CAF50]/30"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]`}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold text-[#1A1A1A]">
              {price.cropName}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs text-[#7B8794]">
              <MapPin className="h-3 w-3" />
              {price.region}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 border-[#E3F4E4] bg-[#F3FAF3] text-[11px] text-[#2F8E36]"
          >
            {price.unit}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-1 text-xl font-bold text-[#1A1A1A]">
          {formatPrice(price.price)}
        </div>

        {price.source && (
          <p className="truncate text-xs text-[#7B8794]">
            Nguồn: {price.source}
          </p>
        )}

        <p className="mt-2 flex items-center gap-1 text-xs text-[#9CA3AF]">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(price.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRICE CHART COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function PriceChart({
  history,
  cropName,
  region,
}: {
  history: PriceHistoryItem[];
  cropName: string;
  region: string;
}) {
  const chartData = useMemo(
    () =>
      history.map((h) => ({
        date: formatDate(h.recordedAt),
        priceAvg: h.priceAvg,
        priceMin: h.priceMin,
        priceMax: h.priceMax,
      })),
    [history]
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-[#9CA3AF]">
        <div className="text-center">
          <TrendingUp className="mx-auto mb-2 h-10 w-10 text-[#E9ECEF]" />
          <p>Không có dữ liệu lịch sử cho {cropName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs text-[#7B8794]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4CAF50]" />
          Giá TB
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-[#8BC34A]" />
          Thấp nhất
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-[#FF7043]" />
          Cao nhất
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#7B8794" }}
            tickLine={false}
            axisLine={{ stroke: "#E9ECEF" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#7B8794" }}
            tickLine={false}
            axisLine={{ stroke: "#E9ECEF" }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E9ECEF",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 13,
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 6, color: "#1A1A1A" }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                priceAvg: "Giá TB",
                priceMin: "Thấp nhất",
                priceMax: "Cao nhất",
              };
              return [formatPrice(value), labels[name] || name];
            }}
          />
          <Area
            type="monotone"
            dataKey="priceAvg"
            fill="url(#colorPriceGradient)"
            stroke="transparent"
          />
          <Line
            type="monotone"
            dataKey="priceAvg"
            stroke="#4CAF50"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: "#4CAF50", stroke: "#fff", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="priceMin"
            stroke="#8BC34A"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="priceMax"
            stroke="#FF7043"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CTA BANNER COMPONENT (NhaBe Branded)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function CTABanner() {
  return <NhaBePricePageCTA />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * LAST UPDATED BADGE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function LastUpdatedBadge({ updatedAt }: { updatedAt: Date | null }) {
  return (
    <Badge
      variant="outline"
      className="border-[#E3F4E4] bg-[#F3FAF3] text-[#2F8E36]"
    >
      <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-[#4CAF50]" />
      {updatedAt ? `Cập nhật ${formatRelativeTime(updatedAt)}` : "Đang tải..."}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FILTER BAR (Mobile)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function MobileFilterBar({
  crops,
  regions,
  selectedCrop,
  selectedRegion,
  onCropChange,
  onRegionChange,
  onReset,
}: {
  crops: Array<{ slug: string; name: string }>;
  regions: string[];
  selectedCrop: string;
  selectedRegion: string;
  onCropChange: (crop: string) => void;
  onRegionChange: (region: string) => void;
  onReset: () => void;
}) {
  const hasFilters = selectedCrop || selectedRegion;

  return (
    <div className="rounded-2xl border border-[#E9ECEF] bg-white p-4 lg:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#4CAF50]" />
          <span className="text-sm font-medium">Lọc:</span>
        </div>

        <select
          value={selectedCrop}
          onChange={(e) => onCropChange(e.target.value)}
          className="h-9 flex-1 appearance-none rounded-lg border border-[#E9ECEF] bg-white px-3 text-sm transition-colors focus:border-[#4CAF50] focus:outline-none"
        >
          <option value="">Tất cả cây</option>
          {crops.map((crop) => (
            <option key={crop.slug} value={crop.slug}>
              {crop.name}
            </option>
          ))}
        </select>

        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="h-9 flex-1 appearance-none rounded-lg border border-[#E9ECEF] bg-white px-3 text-sm transition-colors focus:border-[#4CAF50] focus:outline-none"
        >
          <option value="">Tất cả vùng</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 gap-1.5 text-xs text-[#7B8794]"
          >
            <RefreshCw className="h-3 w-3" />
            Xóa
          </Button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function GiaNongSanPage() {
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [crops, setCrops] = useState<Array<{ slug: string; name: string }>>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedPriceForChart, setSelectedPriceForChart] =
    useState<MarketPriceItem | null>(null);
  const [chartHistory, setChartHistory] = useState<PriceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch initial data (Server-side pattern simulation)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [pricesData, cropsData, regionsData] = await Promise.all([
          fetchCurrentPrices(),
          getAvailableCrops(),
          getAvailableRegions(),
        ]);

        setPrices(pricesData);
        setCrops(cropsData);
        setRegions(regionsData);
        setLastUpdated(new Date());

        // Auto-select first price for chart
        if (pricesData.length > 0) {
          setSelectedPriceForChart(pricesData[0]);
        }
      } catch (error) {
        console.error("[GiaNongSan] Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Fetch chart data when selected price changes
  useEffect(() => {
    async function loadChartData() {
      if (!selectedPriceForChart) return;

      try {
        const history = await fetchPriceHistory(
          selectedPriceForChart.cropSlug,
          selectedPriceForChart.region,
          30
        );
        setChartHistory(history);
      } catch (error) {
        console.error("[GiaNongSan] Error loading chart:", error);
      }
    }

    loadChartData();
  }, [selectedPriceForChart]);

  // Filter prices
  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      if (selectedCrop && p.cropSlug !== selectedCrop) return false;
      if (selectedRegion && p.region !== selectedRegion) return false;
      return true;
    });
  }, [prices, selectedCrop, selectedRegion]);

  const handleReset = () => {
    setSelectedCrop("");
    setSelectedRegion("");
  };

  const handlePriceSelect = (price: MarketPriceItem) => {
    setSelectedPriceForChart(price);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SeoMeta
        title="Giá Nông Sản - Nhà Bè Agri"
        description="Theo dõi giá nông sản cập nhật theo vùng miền: sầu riêng, cà phê, tiêu, bưởi. Biểu đồ xu hướng giá 30 ngày."
      />

      {/* Price Marquee Ticker */}
      <PriceMarquee prices={filteredPrices.length > 0 ? filteredPrices : prices} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4CAF50]">
                Market Data
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
                Giá Nông Sản
              </h1>
              <p className="mt-1 text-sm text-[#5F6B7A]">
                Cập nhật giá thị trường nông sản theo vùng miền
              </p>
            </div>

            <LastUpdatedBadge updatedAt={lastUpdated} />
          </div>
        </header>

        {/* Mobile Filter */}
        <MobileFilterBar
          crops={crops}
          regions={regions}
          selectedCrop={selectedCrop}
          selectedRegion={selectedRegion}
          onCropChange={setSelectedCrop}
          onRegionChange={setSelectedRegion}
          onReset={handleReset}
        />

        {/* Main Layout: Sidebar + Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block">
            <SidebarFilters
              crops={crops}
              selectedCrop={selectedCrop}
              onCropSelect={setSelectedCrop}
            />
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Chart Section */}
            <Card className="overflow-hidden rounded-2xl border-[#E9ECEF]">
              <CardHeader className="border-b border-[#F1F5F9] bg-white pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                      {selectedPriceForChart
                        ? `Xu hướng giá: ${selectedPriceForChart.cropName}`
                        : "Xu hướng giá"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {selectedPriceForChart && (
                        <>
                          <MapPin className="h-3 w-3" />
                          {selectedPriceForChart.region}
                          <span className="text-[#E9ECEF]">•</span>
                          <span>30 ngày gần đây</span>
                        </>
                      )}
                    </CardDescription>
                  </div>

                  {/* Quick crop selector for chart */}
                  <select
                    value={
                      selectedPriceForChart
                        ? `${selectedPriceForChart.cropSlug}-${selectedPriceForChart.region}`
                        : ""
                    }
                    onChange={(e) => {
                      const [slug, region] = e.target.value.split("-");
                      const price = prices.find(
                        (p) => p.cropSlug === slug && p.region === region
                      );
                      if (price) setSelectedPriceForChart(price);
                    }}
                    className="h-9 appearance-none rounded-lg border border-[#E9ECEF] bg-white px-3 pr-8 text-sm transition-colors focus:border-[#4CAF50] focus:outline-none"
                  >
                    {filteredPrices.map((p) => (
                      <option
                        key={`${p.cropSlug}-${p.region}`}
                        value={`${p.cropSlug}-${p.region}`}
                      >
                        {p.cropName} - {p.region}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="bg-white p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex h-80 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4CAF50] border-t-transparent" />
                  </div>
                ) : selectedPriceForChart ? (
                  <PriceChart
                    history={chartHistory}
                    cropName={selectedPriceForChart.cropName}
                    region={selectedPriceForChart.region}
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center text-[#9CA3AF]">
                    Chọn một loại nông sản để xem biểu đồ
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Cards Grid */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Giá thị trường hôm nay
                </h2>
                <Badge
                  variant="outline"
                  className="border-[#E9ECEF] bg-white text-[#5F6B7A]"
                >
                  {filteredPrices.length} mặt hàng
                </Badge>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse overflow-hidden rounded-2xl">
                      <CardHeader className="pb-2">
                        <div className="h-5 w-3/4 rounded bg-[#E9ECEF]" />
                        <div className="mt-1 h-3 w-1/2 rounded bg-[#E9ECEF]" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-7 w-2/3 rounded bg-[#E9ECEF]" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPrices.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-[#E9ECEF]">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Sprout className="mb-3 h-12 w-12 text-[#9CA3AF]" />
                    <h3 className="mb-1 text-lg font-medium text-[#1A1A1A]">
                      Không có dữ liệu
                    </h3>
                    <p className="text-sm text-[#7B8794]">
                      Thử thay đổi bộ lọc hoặc quay lại sau
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="mt-4 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Xóa bộ lọc
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPrices.map((price) => (
                    <PriceCard
                      key={price.id}
                      price={price}
                      isSelected={
                        selectedPriceForChart?.id === price.id
                      }
                      onClick={() => handlePriceSelect(price)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* CTA Banner */}
            <CTABanner />
          </div>
        </div>
      </main>
    </div>
  );
}
