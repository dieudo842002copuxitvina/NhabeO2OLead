'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MapPin,
  Layers,
  AlertTriangle,
  TrendingUp,
  Eye,
  Store,
  Target,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Mock Data ───────────────────────────────────────────────────────
interface DealerPoint {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  active: boolean;
  leadCount: number;
}

interface HeatPoint {
  lat: number;
  lng: number;
  district: string;
  province: string;
  intensity: number; // 0-100
}

interface WhiteZone {
  district: string;
  province: string;
  leadDensity: number;
  nearestDealer: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

const DEALERS: DealerPoint[] = [
  { id: 'd1', name: 'Đại lý Nông Phát', province: 'Đồng Nai', lat: 10.93, lng: 107.24, active: true, leadCount: 48 },
  { id: 'd2', name: 'Đại lý Xanh Việt', province: 'Bình Dương', lat: 11.0, lng: 106.65, active: true, leadCount: 35 },
  { id: 'd3', name: 'HTX Miền Đông', province: 'Tây Ninh', lat: 11.31, lng: 106.10, active: true, leadCount: 29 },
  { id: 'd4', name: 'Đại lý Bình Minh', province: 'Long An', lat: 10.54, lng: 106.41, active: true, leadCount: 24 },
  { id: 'd5', name: 'Đại lý Phú Lộc', province: 'Đắk Lắk', lat: 12.67, lng: 108.05, active: true, leadCount: 21 },
  { id: 'd6', name: 'Đại lý Tân Phú', province: 'TP.HCM', lat: 10.82, lng: 106.63, active: true, leadCount: 42 },
  { id: 'd7', name: 'Đại lý Minh An', province: 'Bà Rịa - Vũng Tàu', lat: 10.50, lng: 107.17, active: true, leadCount: 15 },
  { id: 'd8', name: 'Đại lý Cao Nguyên', province: 'Lâm Đồng', lat: 11.94, lng: 108.44, active: true, leadCount: 18 },
];

const HEAT_POINTS: HeatPoint[] = [
  { lat: 12.80, lng: 108.20, district: 'Krông Năng', province: 'Đắk Lắk', intensity: 92 },
  { lat: 12.50, lng: 107.90, district: 'Ea H\'leo', province: 'Đắk Lắk', intensity: 85 },
  { lat: 11.80, lng: 108.50, district: 'Bảo Lâm', province: 'Lâm Đồng', intensity: 78 },
  { lat: 11.20, lng: 107.10, district: 'Xuân Lộc', province: 'Đồng Nai', intensity: 70 },
  { lat: 10.80, lng: 106.50, district: 'Củ Chi', province: 'TP.HCM', intensity: 65 },
  { lat: 12.00, lng: 107.60, district: 'Gia Nghĩa', province: 'Đắk Nông', intensity: 88 },
  { lat: 13.50, lng: 108.10, district: 'An Khê', province: 'Gia Lai', intensity: 82 },
  { lat: 14.00, lng: 108.20, district: 'Pleiku', province: 'Gia Lai', intensity: 75 },
  { lat: 10.30, lng: 106.30, district: 'Cai Lậy', province: 'Tiền Giang', intensity: 68 },
  { lat: 11.55, lng: 106.95, district: 'Đồng Xoài', province: 'Bình Phước', intensity: 90 },
  { lat: 10.10, lng: 105.80, district: 'Ô Môn', province: 'Cần Thơ', intensity: 60 },
  { lat: 13.80, lng: 109.10, district: 'An Nhơn', province: 'Bình Định', intensity: 55 },
];

const WHITE_ZONES: WhiteZone[] = [
  { district: 'Đồng Xoài', province: 'Bình Phước', leadDensity: 90, nearestDealer: 'Đại lý Nông Phát', distanceKm: 65, lat: 11.55, lng: 106.95 },
  { district: 'Gia Nghĩa', province: 'Đắk Nông', leadDensity: 88, nearestDealer: 'Đại lý Phú Lộc', distanceKm: 78, lat: 12.00, lng: 107.60 },
  { district: 'Krông Năng', province: 'Đắk Lắk', leadDensity: 92, nearestDealer: 'Đại lý Phú Lộc', distanceKm: 32, lat: 12.80, lng: 108.20 },
  { district: 'An Khê', province: 'Gia Lai', leadDensity: 82, nearestDealer: 'Đại lý Phú Lộc', distanceKm: 120, lat: 13.50, lng: 108.10 },
  { district: 'Cai Lậy', province: 'Tiền Giang', leadDensity: 68, nearestDealer: 'Đại lý Bình Minh', distanceKm: 45, lat: 10.30, lng: 106.30 },
];

// ─── Map Component (Leaflet) ────────────────────────────────────────
function DealerMapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [layerVisibility, setLayerVisibility] = useState({ heatmap: true, dealers: true, territory: true });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current!, {
        center: [12.0, 107.5],
        zoom: 6,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 18,
      }).addTo(map);

      // Dealer Markers (Green Pins)
      if (layerVisibility.dealers) {
        DEALERS.forEach((dealer) => {
          const markerIcon = L.divIcon({
            className: 'custom-dealer-marker',
            html: `<div style="
              width: 28px; height: 28px; 
              background: #2E7D32; 
              border-radius: 50%; 
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 8px rgba(46,125,50,0.5);
              border: 2px solid #fff;
              font-size: 12px; font-weight: bold; color: white;
            ">${dealer.name[0]}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([dealer.lat, dealer.lng], { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 160px;">
                <p style="font-weight: 700; margin: 0 0 4px;">${dealer.name}</p>
                <p style="font-size: 11px; color: #666; margin: 0;">${dealer.province} · ${dealer.leadCount} leads</p>
              </div>
            `);

          // Territory circle (20km radius)
          if (layerVisibility.territory) {
            L.circle([dealer.lat, dealer.lng], {
              radius: 20000,
              color: '#2E7D32',
              fillColor: '#2E7D32',
              fillOpacity: 0.06,
              weight: 1,
              dashArray: '4 4',
            }).addTo(map);
          }
        });
      }

      // Heatmap (using circle markers as approximation since leaflet.heat may not be bundled)
      if (layerVisibility.heatmap) {
        HEAT_POINTS.forEach((point) => {
          const radius = 15000 + (point.intensity / 100) * 20000;
          const opacity = 0.15 + (point.intensity / 100) * 0.35;

          L.circle([point.lat, point.lng], {
            radius,
            color: 'transparent',
            fillColor: '#FF1744',
            fillOpacity: opacity,
            weight: 0,
          }).addTo(map);

          // Intensity dot
          L.circleMarker([point.lat, point.lng], {
            radius: 4 + (point.intensity / 100) * 4,
            color: '#FF1744',
            fillColor: '#FF1744',
            fillOpacity: 0.8,
            weight: 1,
          })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif; min-width: 140px;">
                <p style="font-weight: 700; margin: 0 0 4px; color: #FF1744;">🔥 ${point.district}</p>
                <p style="font-size: 11px; color: #666; margin: 0;">${point.province}</p>
                <p style="font-size: 11px; margin: 4px 0 0;">Mật độ Lead: <strong>${point.intensity}%</strong></p>
              </div>
            `);
        });
      }

      // White zone markers
      WHITE_ZONES.forEach((zone) => {
        const markerIcon = L.divIcon({
          className: 'white-zone-marker',
          html: `<div style="
            width: 24px; height: 24px;
            background: #FF9800;
            border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(255,152,0,0.5);
            font-size: 10px; font-weight: bold; color: white;
            transform: rotate(45deg);
          "><span style="transform: rotate(-45deg);">!</span></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([zone.lat, zone.lng], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px;">
              <p style="font-weight: 700; margin: 0 0 4px; color: #FF9800;">⚠ Vùng trắng</p>
              <p style="font-size: 12px; font-weight: 600; margin: 0;">${zone.district}, ${zone.province}</p>
              <p style="font-size: 11px; color: #666; margin: 4px 0 0;">Lead: ${zone.leadDensity}% · Đại lý gần: ${zone.distanceKm}km</p>
            </div>
          `);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border/50">
      <div ref={mapRef} className="h-full w-full" />

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[999] rounded-xl border border-border/50 bg-background/90 p-3 backdrop-blur-xl">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chú thích</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#FF1744]" />
            <span className="text-[11px] text-foreground">Mật độ Lead (Demand)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2E7D32] border border-white" />
            <span className="text-[11px] text-foreground">Đại lý (Supply)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-dashed border-[#2E7D32] bg-[#2E7D32]/10" />
            <span className="text-[11px] text-foreground">Vùng phủ 20km</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-[#FF9800]" />
            <span className="text-[11px] text-foreground">Vùng trắng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DealerMapPage() {
  return (
    <AdminShell title="Bản đồ Đại lý" subtitle="Supply-Demand Heatmap & Territory Gap Analysis">
      <div className="grid h-[calc(100vh-180px)] grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Map */}
        <div className="xl:col-span-8">
          <DealerMapView />
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6 xl:col-span-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Store className="mb-2 h-5 w-5 text-emerald-400" />
                <p className="text-2xl font-bold text-foreground">{DEALERS.length}</p>
                <p className="text-[10px] text-muted-foreground">Đại lý hoạt động</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Target className="mb-2 h-5 w-5 text-red-400" />
                <p className="text-2xl font-bold text-foreground">{HEAT_POINTS.length}</p>
                <p className="text-[10px] text-muted-foreground">Vùng nhu cầu cao</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <AlertTriangle className="mb-2 h-5 w-5 text-amber-400" />
                <p className="text-2xl font-bold text-foreground">{WHITE_ZONES.length}</p>
                <p className="text-[10px] text-muted-foreground">Vùng trắng</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <Circle className="mb-2 h-5 w-5 text-blue-400" />
                <p className="text-2xl font-bold text-foreground">20km</p>
                <p className="text-[10px] text-muted-foreground">Bán kính phủ</p>
              </CardContent>
            </Card>
          </div>

          {/* White Zones Table */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Top 5 Vùng Trắng
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Huyện có nhu cầu cao nhưng chưa có đại lý ủy quyền
              </p>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {WHITE_ZONES.sort((a, b) => b.leadDensity - a.leadDensity).map((zone, i) => (
                <div
                  key={zone.district}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400">
                    #{i + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                      {zone.district}, {zone.province}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Gần nhất: {zone.nearestDealer} ({zone.distanceKm}km)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{zone.leadDensity}%</p>
                    <p className="text-[9px] text-muted-foreground">Mật độ</p>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="mt-2 w-full rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Đề xuất mở rộng mạng lưới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
