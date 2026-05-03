/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER MAP COMPONENT (Leaflet)                                           ║
 * ║  Interactive map showing dealer locations in Tây Nguyên region              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * FEATURES:
 * ─────────
 * - OpenStreetMap tiles (no API key required)
 * - Custom marker icons
 * - Popup info on marker click
 * - SSR-safe with dynamic import
 */

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

export interface DealerLocation {
  id: number;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
}

interface DealerMapProps {
  dealers: DealerLocation[];
  center?: [number, number];
  zoom?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MARKER ICON CONFIGURATION
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Fix Leaflet default marker icon paths in React/Vite environment
 * By default, Webpack/Next.js doesn't handle the image paths correctly
 */
function createDealerIcon(isOpen: boolean) {
  const color = isOpen ? "#10B981" : "#9CA3AF"; // emerald-500 or gray-400
  const shadowColor = isOpen ? "#059669" : "#6B7280";
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 44px;
      ">
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 16.2 25.2 16.92 25.74a1.08 1.08 0 0 0 2.16 0c.72-.54 16.92-12.24 16.92-25.74C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="17" r="8" fill="white"/>
          <circle cx="18" cy="17" r="4" fill="${color}"/>
        </svg>
        <div style="
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${shadowColor};
          animation: pulse 2s ease-in-out infinite;
        "></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

// Pulse animation CSS
const pulseStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 0.3; transform: translateX(-50%) scale(1.5); }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

export default function DealerMap({ 
  dealers, 
  center = [12.6667, 108.0383], // Buôn Ma Thuột - center of Tây Nguyên
  zoom = 8 
}: DealerMapProps) {
  
  // Inject pulse animation styles
  useEffect(() => {
    const styleId = "leaflet-pulse-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = pulseStyles;
      document.head.appendChild(styleEl);
    }
    return () => {
      // Cleanup on unmount (optional)
    };
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ 
        height: "100%", 
        width: "100%", 
        borderRadius: "0.75rem",
        zIndex: 0,
      }}
      scrollWheelZoom={true}
      className="z-0"
    >
      {/* OpenStreetMap Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      {/* Render dealer markers */}
      {dealers.map((dealer) => (
        <Marker
          key={dealer.id}
          position={[dealer.lat, dealer.lng]}
          icon={createDealerIcon(dealer.isOpen)}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {dealer.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {dealer.address}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-white ${dealer.isOpen ? "bg-emerald-500" : "bg-slate-400"}`}>
                  {dealer.isOpen ? "Đang mở" : "Đóng cửa"}
                </span>
              </div>
              <a 
                href={`tel:${dealer.phone.replace(/\s/g, "")}`}
                className="block mt-2 text-xs text-emerald-600 font-medium hover:underline"
              >
                {dealer.phone}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
