import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dealers as allDealers } from '@/data/mock';

// Mock technicians around dealers (kept here so wrapper stays light)
const TECHNICIANS = [
  { id: 't-1', name: 'KTV Hùng', lat: 10.95, lng: 107.20, province: 'Đồng Nai', specialty: 'Tưới nhỏ giọt' },
  { id: 't-2', name: 'KTV Tâm', lat: 11.90, lng: 108.40, province: 'Lâm Đồng', specialty: 'Máy bơm' },
  { id: 't-3', name: 'KTV Phong', lat: 10.55, lng: 106.40, province: 'Long An', specialty: 'IoT' },
  { id: 't-4', name: 'KTV Quốc', lat: 11.55, lng: 106.95, province: 'Bình Phước', specialty: 'Điều khiển' },
];

// Lightweight inline-SVG markers — no PNG bundling.
function pinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="28" height="38">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="hsl(0 0% 100%)"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'nbagri-pin',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -34],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:9999px;
    background:hsl(217 91% 60%);border:3px solid hsl(0 0% 100%);
    box-shadow:0 0 0 4px hsl(217 91% 60% / 0.25);
  "></div>`,
  className: 'nbagri-user',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Props {
  userPos: [number, number];
  isMobile: boolean;
}

/**
 * LeafletInner — heavy map render isolated for code-splitting.
 * Mobile optimisations:
 *  - tap-to-activate (drag/zoom locked until user taps map)
 *  - no fade animations, no marker zoom-anim
 *  - lower max zoom + smaller tile cache
 */
export default function LeafletInner({ userPos, isMobile }: Props) {
  const [activated, setActivated] = useState(!isMobile);

  // Re-enable interactions once user taps on mobile.
  useEffect(() => {
    if (!isMobile) setActivated(true);
  }, [isMobile]);

  const dealerIcon = useMemo(() => pinIcon('hsl(142 56% 32%)'), []);
  const techIcon = useMemo(() => pinIcon('hsl(28 95% 48%)'), []);

  return (
    <div className="relative h-full w-full" onTouchStart={() => !activated && setActivated(true)}>
      <MapContainer
        center={userPos}
        zoom={isMobile ? 6 : 7}
        minZoom={5}
        maxZoom={isMobile ? 12 : 16}
        scrollWheelZoom={false}
        dragging={activated}
        touchZoom={activated}
        doubleClickZoom={activated}
        tap={activated}
        zoomControl={!isMobile}
        preferCanvas
        fadeAnimation={false}
        markerZoomAnimation={false}
        zoomAnimation={!isMobile}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenIdle={isMobile}
          updateWhenZooming={false}
          keepBuffer={isMobile ? 1 : 2}
          maxZoom={isMobile ? 12 : 16}
        />
        <Circle
          center={userPos}
          radius={50000}
          pathOptions={{
            color: 'hsl(217 91% 60%)',
            fillColor: 'hsl(217 91% 60%)',
            fillOpacity: 0.06,
            weight: 1,
          }}
        />
        <Marker position={userPos} icon={userIcon}>
          <Popup>📍 Vị trí của bạn</Popup>
        </Marker>

        {allDealers.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={dealerIcon}>
            <Popup>
              <div className="text-xs">
                <div className="font-bold mb-1">🏪 {d.name}</div>
                <div className="text-muted-foreground">{d.province}</div>
                <div className="mt-1">{d.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {TECHNICIANS.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={techIcon}>
            <Popup>
              <div className="text-xs">
                <div className="font-bold mb-1">🔧 {t.name}</div>
                <div className="text-muted-foreground">{t.province}</div>
                <div className="mt-1">Chuyên: {t.specialty}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Mobile tap-to-activate hint */}
      {isMobile && !activated && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-foreground/10 backdrop-blur-[1px] pointer-events-none">
          <span className="bg-background/95 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            Chạm để tương tác bản đồ
          </span>
        </div>
      )}
    </div>
  );
}
