/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER MAP COMPONENT (Leaflet)                                           ║
 * ║  Interactive map showing dealer locations in Tây Nguyên region              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * FEATURES:
 * ─────────
 * - OpenStreetMap tiles (no API key required)
 * - Custom marker icons with active state
 * - Hover highlighting (via activeId prop)
 * - Fly-to animation on dealer selection
 * - Click to navigate to dealer profile
 */

"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

export interface DealerLocation {
  id: number;
  name: string;
  slug?: string;
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
  activeId?: number | null;
  onMarkerClick?: (dealer: DealerLocation) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MARKER ICON CONFIGURATION
 * ───────────────────────────────────────────────────────────────────────────── */

function createDealerIcon(isOpen: boolean, isActive: boolean = false) {
  const color = isActive 
    ? "#F59E0B" // amber-500 for active
    : isOpen 
      ? "#10B981" // emerald-500
      : "#9CA3AF"; // gray-400
  
  const shadowColor = isActive
    ? "#D97706" // amber-600
    : isOpen 
      ? "#059669" // emerald-600
      : "#6B7280"; // gray-500
  
  const scale = isActive ? "scale(1.2)" : "scale(1)";
  const zIndex = isActive ? "999" : "1";
  
  return L.divIcon({
    className: `custom-marker ${isActive ? 'active-marker' : ''}`,
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 44px;
        transform: ${scale};
        transition: transform 0.2s ease-out;
        z-index: ${zIndex};
      ">
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 16.2 25.2 16.92 25.74a1.08 1.08 0 0 0 2.16 0c.72-.54 16.92-12.24 16.92-25.74C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="17" r="8" fill="white"/>
          <circle cx="18" cy="17" r="${isActive ? '5' : '4'}" fill="${color}"/>
          ${isActive ? `<circle cx="18" cy="17" r="8" fill="none" stroke="white" stroke-width="2"/>` : ''}
        </svg>
        <div style="
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          width: ${isActive ? '12px' : '8px'};
          height: ${isActive ? '12px' : '8px'};
          border-radius: 50%;
          background: ${shadowColor};
          animation: ${isActive ? 'none' : 'pulse 2s ease-in-out infinite'};
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
  .active-marker {
    filter: drop-shadow(0 4px 6px rgba(245, 158, 11, 0.4));
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
 * MAP CONTROLLER - Handles fly-to animation
 * ───────────────────────────────────────────────────────────────────────────── */

function MapController({ 
  activeDealer, 
  zoom 
}: { 
  activeDealer: DealerLocation | null;
  zoom: number;
}) {
  const map = useMap();
  const lastFlyRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (activeDealer) {
      const now = Date.now();
      // Debounce fly-to to prevent rapid animations
      if (lastFlyRef.current && now - lastFlyRef.current < 500) {
        return;
      }
      lastFlyRef.current = now;
      
      map.flyTo([activeDealer.lat, activeDealer.lng], zoom, {
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [activeDealer, map, zoom]);
  
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

export default function DealerMap({ 
  dealers, 
  center = [12.6667, 108.0383],
  zoom = 8,
  activeId,
  onMarkerClick,
}: DealerMapProps) {
  const router = useRouter();
  
  // Find the active dealer for fly-to animation
  const activeDealer = activeId 
    ? dealers.find(d => d.id === activeId) || null 
    : null;
  
  // Inject pulse animation styles
  useEffect(() => {
    const styleId = "leaflet-pulse-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = pulseStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  const handleMarkerClick = (dealer: DealerLocation) => {
    // Navigate to dealer profile
    const slug = dealer.slug || `dealer-${dealer.id}`;
    router.push(`/dai-ly/${slug}`);
  };

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
      {/* Map controller for fly-to animation */}
      <MapController activeDealer={activeDealer} zoom={zoom} />
      
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
          icon={createDealerIcon(dealer.isOpen, activeId === dealer.id)}
          eventHandlers={{
            click: () => handleMarkerClick(dealer),
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-1 cursor-pointer" onClick={() => handleMarkerClick(dealer)}>
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
                onClick={(e) => e.stopPropagation()}
              >
                {dealer.phone}
              </a>
              <p className="mt-1 text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                → Xem chi tiết
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
