"use client";

import dynamic from "next/dynamic";
import { Clock3, LocateFixed, MapPin, Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DEALERS_DATA, type Dealer } from "@/data/dealers";
import { cn } from "@/lib/utils";

const REGIONS = ["Tất cả", "Miền Bắc", "Miền Trung", "Tây Nguyên", "Miền Nam"] as const;
type RegionFilter = (typeof REGIONS)[number];

export type DealerWithDistance = Dealer & {
  distanceKm?: number;
};

const DaiLyMap = dynamic(() => import("./DaiLyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white text-sm font-semibold text-gray-600">
      Đang tải bản đồ đại lý...
    </div>
  ),
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 10) return `${distanceKm.toFixed(1)}km`;
  return `${Math.round(distanceKm)}km`;
}

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export default function DaiLyPage() {
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("Tất cả");
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const visibleDealers = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const byRegion =
      activeRegion === "Tất cả"
        ? DEALERS_DATA
        : DEALERS_DATA.filter((dealer) => dealer.region.toLowerCase() === activeRegion.toLowerCase());

    const bySearch = byRegion.filter((dealer) => {
      if (!needle) return true;
      return (
        dealer.name.toLowerCase().includes(needle) ||
        dealer.region.toLowerCase().includes(needle) ||
        dealer.address.toLowerCase().includes(needle)
      );
    });

    if (!userLocation) return bySearch;

    return bySearch
      .map((dealer): DealerWithDistance => ({
        ...dealer,
        distanceKm: calculateDistance(userLocation.lat, userLocation.lng, dealer.lat, dealer.lng),
      }))
      .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
  }, [activeRegion, query, userLocation]);

  const nearestDealerId = userLocation && visibleDealers.length > 0 ? visibleDealers[0].id : null;

  const selectedDealer = useMemo(() => {
    const activeId = selectedDealerId ?? nearestDealerId;
    if (!activeId) return null;
    return visibleDealers.find((dealer) => dealer.id === activeId) ?? null;
  }, [nearestDealerId, selectedDealerId, visibleDealers]);

  const handleLocateNearest = () => {
    if (!navigator.geolocation) {
      setGeoError("Trình duyệt không hỗ trợ GPS.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        const nearest = [...visibleDealers]
          .map((dealer) => ({
            id: dealer.id,
            distanceKm: calculateDistance(nextLocation.lat, nextLocation.lng, dealer.lat, dealer.lng),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)[0];

        setUserLocation(nextLocation);
        setSelectedDealerId(nearest?.id ?? null);
        setLocating(false);
      },
      () => {
        setGeoError("Không thể lấy vị trí hiện tại. Vui lòng cấp quyền GPS.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="h-[calc(100vh-96px)] min-h-[700px] bg-gray-50 text-gray-900">
      <div className="flex h-full flex-col md:flex-row">
        <div className="flex h-[56vh] flex-col border-b border-gray-200 bg-white md:h-full md:w-[390px] md:min-w-[390px] md:border-b-0 md:border-r">
          <div className="border-b border-gray-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-green-600">Nhà Bè Agri</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">Mạng lưới đại lý ủy quyền</h1>

            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập khu vực, tên đại lý..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </label>

            <button
              type="button"
              onClick={handleLocateNearest}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              <LocateFixed className={cn("h-4 w-4 text-green-600", locating && "animate-pulse")} />
              {locating ? "Đang định vị..." : "Tìm trạm gần tôi nhất"}
            </button>

            {geoError ? <p className="mt-2 text-xs font-medium text-orange-700">{geoError}</p> : null}
          </div>

          <div className="border-b border-gray-200 px-3 py-3">
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => {
                const isActive = activeRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setActiveRegion(region);
                      setSelectedDealerId(null);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      isActive ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {visibleDealers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                Không tìm thấy đại lý phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <ul className="space-y-4">
                {visibleDealers.map((dealer) => {
                  const isSelected = selectedDealer?.id === dealer.id;
                  const isNearest = nearestDealerId === dealer.id;
                  return (
                    <li key={dealer.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedDealerId(dealer.id)}
                        className={cn(
                          "w-full rounded-xl border bg-white p-4 text-left shadow-sm transition",
                          isSelected ? "border-green-500 ring-2 ring-green-100" : "border-gray-200 hover:border-green-300",
                        )}
                      >
                        <p className="text-sm font-bold text-green-700">{dealer.name}</p>
                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                          {dealer.region}
                        </span>

                        <div className="mt-3 space-y-2 text-xs text-gray-700">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                            <span>{dealer.address}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                            <span>{dealer.hours}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-green-600" />
                            <span>{dealer.phone}</span>
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          {typeof dealer.distanceKm === "number" ? (
                            <span className="font-semibold text-green-700">Cách bạn {formatDistance(dealer.distanceKm)}</span>
                          ) : (
                            <span className="text-gray-500">Chưa định vị GPS</span>
                          )}
                          {isNearest ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 font-bold text-green-700">Gần nhất</span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="relative h-[44vh] min-h-[360px] flex-1 md:h-full">
          <DaiLyMap
            dealers={visibleDealers}
            selectedDealerId={selectedDealer?.id ?? null}
            userLocation={userLocation}
            onSelectDealer={setSelectedDealerId}
          />

          {selectedDealer ? (
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-[380px] rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <p className="text-sm font-bold text-green-700">{selectedDealer.name}</p>
              <p className="mt-1 text-xs text-gray-600">{selectedDealer.address}</p>
              <a
                href={phoneHref(selectedDealer.phone)}
                className="pointer-events-auto mt-3 inline-flex h-9 items-center rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
              >
                Gọi đại lý
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
