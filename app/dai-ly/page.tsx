"use client";

import dynamic from "next/dynamic";
import { LocateFixed, MapPin, Phone, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type DealerStatus = "Mở cửa" | "Đóng cửa";

export type Dealer = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  province: string;
  address: string;
  phone: string;
  tags: string[];
  status: DealerStatus;
  images: string[];
};

export type DealerWithDistance = Dealer & {
  distanceKm?: number;
};

const DEALERS_DATA: Dealer[] = [
  {
    id: "dak-mil",
    name: "Trạm Nhà Bè Agri Đắk Mil",
    lat: 12.4579,
    lng: 107.6231,
    province: "Đắk Nông",
    address: "QL14, xã Đắk Lao, huyện Đắk Mil, Đắk Nông",
    phone: "0901234561",
    tags: ["Kho sẵn Drone", "Chuyên gia châm phân", "Thi công thực địa"],
    status: "Mở cửa",
    images: ["https://placehold.co/1200x720?text=Tram+Dak+Mil"],
  },
  {
    id: "buon-ma-thuot",
    name: "Trạm Nhà Bè Agri Buôn Ma Thuột",
    lat: 12.6797,
    lng: 108.0443,
    province: "Đắk Lắk",
    address: "Đường Hà Huy Tập, TP. Buôn Ma Thuột, Đắk Lắk",
    phone: "0901234562",
    tags: ["Kho sẵn vật tư", "Kỹ thuật tại vườn", "Lắp đặt hệ thống tưới"],
    status: "Mở cửa",
    images: ["https://placehold.co/1200x720?text=Tram+Buon+Ma+Thuot"],
  },
  {
    id: "gia-nghia",
    name: "Trạm Nhà Bè Agri Gia Nghĩa",
    lat: 11.9982,
    lng: 107.7007,
    province: "Đắk Nông",
    address: "Quốc lộ 28, phường Nghĩa Tân, TP. Gia Nghĩa, Đắk Nông",
    phone: "0901234563",
    tags: ["Chuyên gia châm phân", "Kho phụ kiện HDPE", "Bảo trì định kỳ"],
    status: "Mở cửa",
    images: ["https://placehold.co/1200x720?text=Tram+Gia+Nghia"],
  },
  {
    id: "bao-loc",
    name: "Trạm Nhà Bè Agri Bảo Lộc",
    lat: 11.5478,
    lng: 107.8077,
    province: "Lâm Đồng",
    address: "Đường Trần Phú, TP. Bảo Lộc, Lâm Đồng",
    phone: "0901234564",
    tags: ["Trung tâm demo drone", "Đội thi công thực địa", "Hỗ trợ hồ sơ vay"],
    status: "Đóng cửa",
    images: ["https://placehold.co/1200x720?text=Tram+Bao+Loc"],
  },
  {
    id: "cam-my",
    name: "Trạm Nhà Bè Agri Cẩm Mỹ",
    lat: 10.8249,
    lng: 107.3165,
    province: "Đồng Nai",
    address: "Ấp Duyên Lãng, huyện Cẩm Mỹ, Đồng Nai",
    phone: "0901234565",
    tags: ["Kho sẵn Drone", "Chuyên gia cây ăn trái", "Bảo hành nhanh 24h"],
    status: "Mở cửa",
    images: ["https://placehold.co/1200x720?text=Tram+Cam+My"],
  },
];

const DaiLyMap = dynamic(() => import("./DaiLyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white text-sm font-semibold text-gray-600">
      Đang tải bản đồ đại lý...
    </div>
  ),
});

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const earthRadiusKm = 6371;
  const toRad = (degree: number) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export default function DaiLyPage() {
  const [query, setQuery] = useState("");
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const visibleDealers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const bySearch = DEALERS_DATA.filter((dealer) => {
      if (!needle) return true;
      return (
        dealer.name.toLowerCase().includes(needle) ||
        dealer.province.toLowerCase().includes(needle) ||
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
  }, [query, userLocation]);

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
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const nearest = [...DEALERS_DATA]
          .map((dealer) => ({
            id: dealer.id,
            distanceKm: calculateDistance(
              nextLocation.lat,
              nextLocation.lng,
              dealer.lat,
              dealer.lng,
            ),
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
        <div className="flex h-[52vh] flex-col border-b border-gray-200 bg-white md:h-full md:w-[350px] md:min-w-[350px] md:border-b-0 md:border-r">
          <div className="border-b border-gray-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#4CAF50]">O2O Lead Engine</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">Bản đồ hệ thống đại lý</h1>

            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập tỉnh thành hoặc tên đại lý..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
              />
            </label>

            <button
              type="button"
              onClick={handleLocateNearest}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              <LocateFixed className={cn("h-4 w-4 text-[#4CAF50]", locating && "animate-pulse")} />
              {locating ? "Đang định vị..." : "📍 TÌM TRẠM GẦN TÔI NHẤT"}
            </button>

            {geoError ? (
              <p className="mt-2 text-xs font-medium text-orange-700">{geoError}</p>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {visibleDealers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                Không tìm thấy đại lý phù hợp với từ khóa.
              </div>
            ) : (
              <ul className="space-y-2">
                {visibleDealers.map((dealer) => {
                  const isSelected = selectedDealer?.id === dealer.id;
                  const isNearest = nearestDealerId === dealer.id;

                  return (
                    <li key={dealer.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedDealerId(dealer.id)}
                        className={cn(
                          "w-full rounded-xl border bg-white p-3 text-left transition",
                          isSelected
                            ? "border-[#4CAF50] shadow-sm ring-2 ring-[#4CAF50]/15"
                            : "border-gray-200 hover:border-[#4CAF50]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{dealer.name}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-500">{dealer.province}</p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[11px] font-semibold",
                              dealer.status === "Mở cửa"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {dealer.status}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{dealer.address}</p>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          {typeof dealer.distanceKm === "number" ? (
                            <span className="font-semibold text-[#2E7D32]">
                              Cách bạn {formatDistance(dealer.distanceKm)}
                            </span>
                          ) : (
                            <span className="text-gray-500">Chưa định vị GPS</span>
                          )}
                          {isNearest ? (
                            <span className="rounded-full bg-[#4CAF50]/10 px-2 py-1 font-bold text-[#2E7D32]">
                              Gần nhất
                            </span>
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

        <div className="relative h-[48vh] min-h-[360px] flex-1 md:h-full">
          <DaiLyMap
            dealers={visibleDealers}
            selectedDealerId={selectedDealer?.id ?? null}
            userLocation={userLocation}
            onSelectDealer={setSelectedDealerId}
          />

          <aside
            className={cn(
              "absolute right-0 top-0 z-[500] h-full w-full max-w-[380px] border-l border-gray-200 bg-white shadow-xl transition-transform duration-300",
              selectedDealer ? "translate-x-0" : "translate-x-full",
            )}
            aria-live="polite"
          >
            {selectedDealer ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-bold text-gray-900">Chi tiết đại lý</p>
                  <button
                    type="button"
                    onClick={() => setSelectedDealerId(null)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Đóng hồ sơ đại lý"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  <img
                    src={selectedDealer.images[0]}
                    alt={`Ảnh mặt tiền ${selectedDealer.name}`}
                    className="h-44 w-full rounded-xl object-cover"
                    loading="lazy"
                  />

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedDealer.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">{selectedDealer.province}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                      <span>{selectedDealer.address}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <Phone className="h-4 w-4 text-[#4CAF50]" />
                      {selectedDealer.phone}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        selectedDealer.status === "Mở cửa"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {selectedDealer.status}
                    </span>
                    {typeof selectedDealer.distanceKm === "number" ? (
                      <p className="text-xs font-semibold text-[#2E7D32]">
                        Cách bạn {formatDistance(selectedDealer.distanceKm)}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">Năng lực chính</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedDealer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4">
                  <a
                    href={phoneHref(selectedDealer.phone)}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-[#4CAF50] text-sm font-bold text-white transition hover:bg-[#43A047]"
                  >
                    📞 GỌI HOTLINE ĐẠI LÝ
                  </a>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
