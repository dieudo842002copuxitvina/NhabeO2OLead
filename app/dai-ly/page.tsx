"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Clock, MapPin, Navigation, Phone, Search, Store, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEALERS_DATA, type Dealer, type DealerType } from "@/data/dealers";
import { cn } from "@/lib/utils";

const DaiLyMap = dynamic(() => import("./DaiLyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[40vh] items-center justify-center bg-white text-sm font-semibold text-gray-600">
      Đang tải bản đồ...
    </div>
  ),
});

const filters: Array<{ value: "all" | DealerType; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "office", label: "Văn phòng" },
  { value: "dealer", label: "Cửa hàng vật tư" },
];

const regionFilters = ["all", ...Array.from(new Set(DEALERS_DATA.map((dealer) => dealer.region)))];

export type DealerResult = Dealer & {
  distanceKm?: number;
};

function dealerTypeLabel(type: DealerType) {
  if (type === "office") return "Văn phòng";
  return "Cửa hàng vật tư";
}

function dealerIcon(type: DealerType) {
  if (type === "office") return Building2;
  return Store;
}

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : undefined;
}

function directionsHref(dealer: Dealer) {
  return `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`;
}

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(value: number) {
  return value < 10 ? value.toFixed(1) : Math.round(value).toString();
}

function DaiLyContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlRegion = searchParams.get("region") ?? "all";

  const [query, setQuery] = useState(urlSearch);
  const [filter, setFilter] = useState<"all" | DealerType>("all");
  const [regionFilter, setRegionFilter] = useState(urlRegion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setQuery(urlSearch);
    setRegionFilter(regionFilters.includes(urlRegion) ? urlRegion : "all");
  }, [urlRegion, urlSearch]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedQuery = query.trim();

    if (trimmedQuery) nextParams.set("search", trimmedQuery);
    else nextParams.delete("search");

    if (regionFilter !== "all") nextParams.set("region", regionFilter);
    else nextParams.delete("region");

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [pathname, query, regionFilter, router, searchParams]);

  const filteredDealers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = DEALERS_DATA.filter((dealer) => {
      const matchesFilter = filter === "all" || dealer.type === filter;
      const matchesRegion = regionFilter === "all" || dealer.region === regionFilter;
      const matchesQuery =
        !needle ||
        dealer.name.toLowerCase().includes(needle) ||
        dealer.address.toLowerCase().includes(needle) ||
        dealer.region.toLowerCase().includes(needle) ||
        dealer.phone.includes(needle);
      return matchesFilter && matchesRegion && matchesQuery;
    });

    if (!userLocation) return result;

    return result
      .map((dealer): DealerResult => ({
        ...dealer,
        distanceKm: distanceKm(userLocation, { lat: dealer.lat, lng: dealer.lng }),
      }))
      .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
  }, [filter, query, regionFilter, userLocation]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="h-[calc(100vh-96px)] min-h-[720px] bg-white text-gray-900 md:min-h-[640px]">
      <div className="flex h-full flex-col bg-white md:flex-row">
        <aside className="order-2 flex h-[60vh] flex-col border-r border-gray-200 bg-gray-50 md:order-1 md:h-full md:w-[40%]">
          <div className="shrink-0 border-b border-gray-200 bg-white p-4 md:p-5">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#4CAF50]">Hệ thống đại lý</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">Tìm điểm hỗ trợ gần bạn</h1>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên đại lý, tỉnh thành, số điện thoại..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/15"
                />
              </label>
              <Button
                type="button"
                onClick={handleLocate}
                className="h-11 rounded-lg bg-white px-4 font-semibold text-gray-900 shadow-none ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <Target className={cn("mr-2 h-4 w-4 text-[#4CAF50]", locating && "animate-pulse")} />
                {locating ? "Đang định vị" : "Sử dụng vị trí của tôi"}
              </Button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {regionFilters.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setRegionFilter(region)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    regionFilter === region
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#4CAF50] hover:text-[#2E7D32]",
                  )}
                >
                  {region === "all" ? "Tất cả vùng" : region}
                </button>
              ))}
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    filter === item.value
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#4CAF50] hover:text-[#2E7D32]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
              <span>{filteredDealers.length} / {DEALERS_DATA.length} điểm trong khu vực</span>
              <span className="font-semibold text-gray-900">Việt Nam</span>
            </div>

            {filteredDealers.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
                <p className="max-w-sm text-base font-semibold text-gray-900">
                  Chưa có đại lý tại khu vực này. Liên hệ Hotline để nhận vật tư tận rẫy: 0983.230.879
                </p>
                <a
                  href="tel:0983230879"
                  className="mt-4 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#43A047]"
                >
                  Gọi Ngay
                </a>
              </div>
            ) : (
            <div className="space-y-3">
              {filteredDealers.map((dealer) => {
                const Icon = dealerIcon(dealer.type);
                const active = hoveredId === dealer.id || selectedId === dealer.id;
                const callHref = phoneHref(dealer.phone);
                return (
                  <article
                    key={dealer.id}
                    onMouseEnter={() => setHoveredId(dealer.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(dealer.id)}
                    className={cn(
                      "rounded-xl border bg-white p-4 shadow-sm transition",
                      active
                        ? "border-[#4CAF50] shadow-md ring-2 ring-[#4CAF50]/10"
                        : "border-gray-200 hover:border-[#4CAF50]",
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                          dealer.type === "office" ? "bg-amber-100 text-amber-700" : "bg-[#4CAF50]/10 text-[#2E7D32]",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-base font-bold leading-snug text-gray-900">{dealer.name}</h2>
                          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {dealerTypeLabel(dealer.type)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2E7D32]">{dealer.region}</p>
                        {typeof dealer.distanceKm === "number" ? (
                          <span className="mt-2 inline-flex rounded-full bg-[#4CAF50]/10 px-2.5 py-1 text-xs font-bold text-[#2E7D32]">
                            📍 Cách {formatDistance(dealer.distanceKm)} km
                          </span>
                        ) : null}
                        <p className="mt-2 flex gap-2 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                          <span>{dealer.address}</span>
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {dealer.phone}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {dealer.time}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Link
                            href={`/dai-ly/${dealer.slug}`}
                            className="rounded-lg bg-[#4CAF50] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#43A047]"
                          >
                            Xem chi tiết
                          </Link>
                          {callHref ? (
                            <a
                              href={callHref}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 transition hover:border-[#4CAF50]"
                            >
                              Gọi ngay
                            </a>
                          ) : null}
                          <a
                            href={directionsHref(dealer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chỉ đường đến ${dealer.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-900 transition hover:border-[#4CAF50] hover:text-[#2E7D32]"
                          >
                            <Navigation className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            )}
          </div>
        </aside>

        <div className="order-1 h-[40vh] bg-white md:order-2 md:h-full md:w-[60%]">
          <DaiLyMap
            dealers={filteredDealers}
            hoveredId={hoveredId}
            selectedId={selectedId}
            userLocation={userLocation}
            onSelectDealer={setSelectedId}
          />
        </div>
      </div>
    </section>
  );
}

export default function DaiLyPage() {
  return (
    <Suspense
      fallback={
        <section className="h-[calc(100vh-96px)] min-h-[720px] bg-white text-gray-900 md:min-h-[640px]" />
      }
    >
      <DaiLyContent />
    </Suspense>
  );
}
