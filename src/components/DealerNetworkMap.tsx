import { useEffect, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { dealers } from '@/data/mock';
import { useApp } from '@/contexts/AppContext';
import { useHomepageConfig } from '@/contexts/HomepageConfigContext';
import { haversineDistance } from '@/lib/geo';
import { MapPin, Users } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { addSovereigntyOverlay } from '@/lib/sovereigntyOverlay';

/**
 * Real Leaflet map with OpenStreetMap tiles + marker clustering.
 * 50+ dealers spread across Vietnam — clusters auto-collapse on zoom out.
 */

interface DealerPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  province: string;
  isReal: boolean;
}

// Real seed dealers + 50+ network points across Vietnam
function generateDealers(): DealerPoint[] {
  const points: DealerPoint[] = (dealers || []).map(d => ({
    id: d.id, lat: d.lat, lng: d.lng, name: d.name, province: d.province, isReal: true,
  }));
  const clusters = [
    { lat: 21.03, lng: 105.85, n: 6, prov: 'Hà Nội' },
    { lat: 20.86, lng: 106.68, n: 3, prov: 'Hải Phòng' },
    { lat: 20.45, lng: 106.34, n: 2, prov: 'Nam Định' },
    { lat: 18.68, lng: 105.69, n: 2, prov: 'Nghệ An' },
    { lat: 16.46, lng: 107.59, n: 2, prov: 'Thừa Thiên Huế' },
    { lat: 16.05, lng: 108.22, n: 4, prov: 'Đà Nẵng' },
    { lat: 15.58, lng: 108.47, n: 2, prov: 'Quảng Nam' },
    { lat: 13.78, lng: 109.22, n: 2, prov: 'Bình Định' },
    { lat: 12.24, lng: 109.19, n: 3, prov: 'Khánh Hòa' },
    { lat: 11.94, lng: 108.44, n: 4, prov: 'Lâm Đồng' },
    { lat: 13.98, lng: 108.0, n: 5, prov: 'Gia Lai' },
    { lat: 12.67, lng: 108.05, n: 4, prov: 'Đắk Lắk' },
    { lat: 12.00, lng: 107.69, n: 3, prov: 'Đắk Nông' },
    { lat: 10.82, lng: 106.63, n: 7, prov: 'TP.HCM' },
    { lat: 10.93, lng: 107.24, n: 3, prov: 'Đồng Nai' },
    { lat: 11.0, lng: 106.65, n: 3, prov: 'Bình Dương' },
    { lat: 11.55, lng: 106.95, n: 2, prov: 'Bình Phước' },
    { lat: 10.54, lng: 106.41, n: 2, prov: 'Long An' },
    { lat: 10.36, lng: 106.36, n: 2, prov: 'Tiền Giang' },
    { lat: 10.03, lng: 105.77, n: 4, prov: 'Cần Thơ' },
    { lat: 9.6, lng: 105.96, n: 2, prov: 'Sóc Trăng' },
    { lat: 9.18, lng: 105.15, n: 2, prov: 'Cà Mau' },
  ];
  let counter = 0;
  for (const c of clusters) {
    for (let i = 0; i < c.n; i++) {
      const jx = (Math.sin(counter * 12.9898) * 43758.5453) % 1;
      const jy = (Math.cos(counter * 78.233) * 12345.6789) % 1;
      counter++;
      points.push({
        id: `dealer-${counter}`,
        lat: c.lat + (jy * 0.5 - 0.25),
        lng: c.lng + (jx * 0.5 - 0.25),
        name: `Đại lý NB-${1000 + counter}`,
        province: c.prov,
        isReal: false,
      });
    }
  }
  return points;
}

// Brand palette (forest green + navy info accent)
const PRIMARY = '#1A4D2E'; // Forest Green
const INFO = '#1E40AF';
const WARNING = '#D97706';

function realDealerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:18px;height:18px;">
      <span style="position:absolute;inset:0;border-radius:50%;background:${PRIMARY};opacity:.35;animation:dealerPulse 2s ease-out infinite;"></span>
      <span style="position:absolute;left:4px;top:4px;width:10px;height:10px;border-radius:50%;background:${PRIMARY};box-shadow:0 0 8px ${PRIMARY};border:2px solid #fff;"></span>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function networkDealerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${INFO};border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.3);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:22px;height:22px;">
      <span style="position:absolute;inset:0;border-radius:50%;background:${WARNING};opacity:.4;animation:dealerPulse 1.6s ease-out infinite;"></span>
      <span style="position:absolute;left:4px;top:4px;width:14px;height:14px;border-radius:50%;background:${WARNING};border:3px solid #fff;box-shadow:0 0 6px ${WARNING};"></span>
    </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function DealerNetworkMap() {
  const { userLocation } = useApp();
  const { config } = useHomepageConfig();
  const mapMode = config.map.mode;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const points = useMemo(() => generateDealers(), []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [14.5, 108.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 16,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    const tileConfig = {
      light: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', sub: 'abcd' },
      satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', sub: '' },
    }[mapMode === 'satellite' ? 'satellite' : 'light'];

    L.tileLayer(tileConfig.url, {
      attribution: '© OpenStreetMap © CARTO/Esri · Bản đồ Việt Nam (không công nhận đường lưỡi bò)',
      subdomains: tileConfig.sub,
      maxZoom: 19,
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 32 : count < 50 ? 40 : 48;
        return L.divIcon({
          className: '',
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${PRIMARY};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-weight:700;font-size:${count < 10 ? 12 : 13}px;
            border:3px solid #fff;box-shadow:0 4px 12px rgba(22,163,74,.4);
          ">${count}</div>`,
          iconSize: [size, size],
        });
      },
    });

    (points || []).forEach(p => {
      if (!p?.lat || !p?.lng) return;
      const marker = L.marker([p.lat, p.lng], {
        icon: p.isReal ? realDealerIcon() : networkDealerIcon(),
      });
      const distance = userLocation
        ? haversineDistance(userLocation, { lat: p.lat, lng: p.lng }).toFixed(0)
        : null;
      marker.bindPopup(`
        <div style="min-width:140px;font-family:inherit;">
          <strong style="font-size:13px;color:#0f172a;">${p?.name || 'Đại lý'}</strong><br/>
          <span style="font-size:11px;color:#64748b;">📍 ${p?.province || ''}</span>
          ${distance ? `<br/><span style="font-size:11px;color:${PRIMARY};font-weight:600;">≈ ${distance} km</span>` : ''}
        </div>
      `);
      marker.bindTooltip(`${p?.name || 'Đại lý'} · ${p?.province || ''}`, { direction: 'top', offset: [0, -8] });
      clusterGroup.addLayer(marker);
    });
    map.addLayer(clusterGroup);

    // Sovereignty overlay: Hoàng Sa & Trường Sa
    addSovereigntyOverlay(map);


    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon(), zIndexOffset: 1000 })
        .bindPopup('<strong>Vị trí của bạn</strong>')
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points, userLocation, mapMode]);

  const total = (points || []).length;
  const provinces = useMemo(() => new Set((points || []).map(p => p?.province)).size, [points]);

  return (
    <Card className="relative overflow-hidden h-full bg-card border-border">
      {/* Pulse keyframes — global injection (only once) */}
      <style>{`
        @keyframes dealerPulse {
          0% { transform: scale(.8); opacity: .6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-container { background: hsl(var(--muted)); font-family: inherit; border-radius: 12px; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 16px hsl(205 30% 15% / 0.12); }
        .leaflet-popup-content { margin: 10px 14px; }
      `}</style>

      <div className="p-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </span>
            Mạng lưới đại lý
          </h3>
          <p className="text-xs text-muted-foreground mt-1 ml-10">
            <span className="font-bold text-primary">{total}+</span> điểm bán · <span className="font-bold text-primary">{provinces}</span> tỉnh thành
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-success/10 text-success px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
        </div>
      </div>

      <div className="px-4 pb-4">
        <div
          ref={containerRef}
          className="w-full rounded-xl overflow-hidden border border-border"
          style={{ height: 560, zIndex: 0 }}
        />
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-3 border-t border-border pt-3 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Đại lý chính</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info" /> Điểm phân phối</span>
          {userLocation && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> Bạn</span>}
          <span className="ml-auto flex items-center gap-1"><Users className="w-3 h-3" /> {total}+ · zoom & cluster</span>
        </div>
      </div>
    </Card>
  );
}
