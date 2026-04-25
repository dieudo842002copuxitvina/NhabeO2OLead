import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { addSovereigntyOverlay } from '@/lib/sovereigntyOverlay';

interface Dealer {
  id: string;
  name: string;
  lat: number;
  lng: number;
  province: string;
}

interface Props {
  dealers: Dealer[];
  center: [number, number] | null;
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
}

const PRIMARY = '#2D5A27'; // Nature Green

function dealerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:24px;height:24px;">
      <span style="position:absolute;inset:0;border-radius:50%;background:${PRIMARY};opacity:.4;animation:dealerPulse 1.5s ease-out infinite;"></span>
      <span style="position:absolute;left:4px;top:4px;width:16px;height:16px;border-radius:50%;background:${PRIMARY};box-shadow:0 0 8px ${PRIMARY};border:2px solid #fff;"></span>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;">
      <span style="position:absolute;left:4px;top:4px;width:12px;height:12px;border-radius:50%;background:#F57C00;border:2px solid #fff;box-shadow:0 0 6px #F57C00;"></span>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function GeoMap({ dealers, center, userLocation, onRequestLocation }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: center || [14.0583, 108.2772],
        zoom: center ? 11 : 5,
        zoomControl: false, // will position manually if needed
        attributionControl: false,
      });
      mapRef.current = map;

      // CartoDB Positron for clean UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      addSovereigntyOverlay(map);

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            className: '',
            html: `<div style="width:36px;height:36px;border-radius:50%;background:${PRIMARY};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid #fff;box-shadow:0 4px 10px rgba(45,90,39,.3);">${count}</div>`,
            iconSize: [36, 36],
          });
        },
      });
      clusterGroupRef.current = clusterGroup;
      map.addLayer(clusterGroup);
    }

    const map = mapRef.current;
    const cluster = clusterGroupRef.current!;
    
    // Clear old markers
    cluster.clearLayers();

    // Add new markers
    const bounds = L.latLngBounds([]);
    dealers.forEach(d => {
      const marker = L.marker([d.lat, d.lng], { icon: dealerIcon() });
      marker.bindPopup(`<strong>${d.name}</strong><br/>${d.province}`);
      cluster.addLayer(marker);
      bounds.extend([d.lat, d.lng]);
    });

    // Add user marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon(), zIndexOffset: 1000 })
        .bindPopup('Vị trí của bạn')
        .addTo(map);
    }

    // Auto fit bounds
    if (dealers.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (center) {
      map.setView(center, 12);
    }

  }, [dealers, center, userLocation]);

  return (
    <div className="relative w-full h-full z-0">
      <style>{`
        @keyframes dealerPulse {
          0% { transform: scale(.8); opacity: .5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-container { font-family: inherit; }
      `}</style>
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Floating GPS Button */}
      <div className="absolute top-4 right-4 z-[400]">
        <Button 
          onClick={onRequestLocation}
          className="bg-white text-gray-900 shadow-md hover:bg-gray-50 rounded-full h-12 px-5 font-bold border border-gray-200"
        >
          <Navigation className="w-4 h-4 mr-2 text-[#2D5A27]" /> Tìm Đại lý quanh tôi
        </Button>
      </div>
    </div>
  );
}
