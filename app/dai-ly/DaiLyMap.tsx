"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "lucide-react";
import type { DealerResult } from "./page";

type DaiLyMapProps = {
  dealers: DealerResult[];
  hoveredId: string | null;
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onSelectDealer: (dealerId: string) => void;
};

function createDealerIcon(dealer: DealerResult, active: boolean) {
  const isOffice = dealer.type === "office";
  const fill = isOffice ? "#F59E0B" : "#4CAF50";
  const ring = isOffice ? "rgba(245,158,11,0.2)" : "rgba(76,175,80,0.2)";
  const label = isOffice ? "VP" : "DL";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${active ? "46px" : "38px"};
        height:${active ? "46px" : "38px"};
        border-radius:999px;
        background:${ring};
        display:flex;
        align-items:center;
        justify-content:center;
        transform:${active ? "translateY(-8px)" : "translateY(0)"};
        transition:all 180ms ease;
      ">
        <div style="
          width:${active ? "34px" : "30px"};
          height:${active ? "34px" : "30px"};
          border-radius:999px;
          background:${fill};
          color:white;
          border:3px solid white;
          box-shadow:0 10px 22px rgba(17,24,39,0.25);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:11px;
          font-weight:800;
          font-family:Arial, sans-serif;
        ">${label}</div>
      </div>
    `,
    iconSize: active ? [46, 46] : [38, 38],
    iconAnchor: active ? [23, 43] : [19, 35],
    popupAnchor: [0, -34],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:22px;
      height:22px;
      border-radius:999px;
      background:#2563EB;
      border:4px solid white;
      box-shadow:0 0 0 8px rgba(37,99,235,0.18), 0 10px 20px rgba(17,24,39,0.22);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapFocus({
  dealers,
  selectedId,
  userLocation,
}: {
  dealers: DealerResult[];
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 0.8 });
      return;
    }

    const selected = dealers.find((dealer) => dealer.id === selectedId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 10, { duration: 0.7 });
    }
  }, [dealers, map, selectedId, userLocation]);

  return null;
}

export default function DaiLyMap({
  dealers,
  hoveredId,
  selectedId,
  userLocation,
  onSelectDealer,
}: DaiLyMapProps) {
  return (
    <MapContainer
      center={[12.2, 107.2]}
      zoom={6}
      minZoom={5}
      scrollWheelZoom
      className="h-full w-full bg-white"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFocus dealers={dealers} selectedId={selectedId} userLocation={userLocation} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="min-w-[160px] bg-white text-gray-900">
              <p className="font-bold">Vị trí của tôi</p>
              <p className="text-sm text-gray-600">Đang dùng vị trí trình duyệt</p>
            </div>
          </Popup>
        </Marker>
      )}

      {dealers.map((dealer) => {
        const active = hoveredId === dealer.id || selectedId === dealer.id;
        return (
          <Marker
            key={dealer.id}
            position={[dealer.lat, dealer.lng]}
            icon={createDealerIcon(dealer, active)}
            eventHandlers={{
              click: () => onSelectDealer(dealer.id),
            }}
          >
            <Popup>
              <div className="min-w-[230px] bg-white text-gray-900">
                <p className="text-base font-bold leading-snug text-gray-900">{dealer.name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#2E7D32]">{dealer.region}</p>
                <p className="mt-2 text-sm text-gray-600">{dealer.phone}</p>
                <p className="mt-1 text-sm text-gray-600">{dealer.time}</p>
                {typeof dealer.distanceKm === "number" ? (
                  <p className="mt-2 inline-flex rounded-full bg-[#4CAF50]/10 px-2.5 py-1 text-xs font-bold text-[#2E7D32]">
                    📍 Cách {dealer.distanceKm < 10 ? dealer.distanceKm.toFixed(1) : Math.round(dealer.distanceKm)} km
                  </p>
                ) : null}
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/dai-ly/${dealer.slug}`}
                    className="inline-flex rounded-md bg-[#4CAF50] px-3 py-2 text-sm font-bold text-white hover:bg-[#43A047]"
                  >
                    Xem chi tiết
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chỉ đường đến ${dealer.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900 hover:border-[#4CAF50] hover:text-[#2E7D32]"
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
