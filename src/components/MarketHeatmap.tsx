import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dealers, commodityPrices } from '@/data/mock';
import { PROVINCES, findProvince } from '@/lib/provinceGeo';
import { getEventLog } from '@/lib/tracking';
import { useHomepageConfig } from '@/contexts/HomepageConfigContext';
import { addSovereigntyOverlay } from '@/lib/sovereigntyOverlay';
import { Flame, Store, TrendingUp, Layers, Pin } from 'lucide-react';

export type HeatLayer = 'demand' | 'supply' | 'price';

interface HeatPoint { lat: number; lng: number; intensity: number; province: string; meta?: string; }

/**
 * Build demand points from tracking events: weight calculator + call_click higher.
 * Distributes events across provinces by hashing event index — gives a reproducible
 * but realistic "field" of demand for the demo.
 */
function buildDemandPoints(): HeatPoint[] {
  const log = getEventLog();
  const buckets = new Map<string, number>();
  log.forEach((ev, i) => {
    let weight = 0;
    if (ev.event === 'calculator_used' || ev.event === 'calculator_lead_submit') weight = 1;
    else if (ev.event === 'call_click' || ev.event === 'zalo_click') weight = 1.5;
    else if (ev.event === 'product_view') weight = 0.3;
    if (weight === 0) return;
    const province = (ev.customerProvince as string) || PROVINCES[i % PROVINCES.length].name;
    buckets.set(province, (buckets.get(province) ?? 0) + weight);
  });
  // Add baseline noise so map isn't empty on a fresh device
  PROVINCES.forEach((p, i) => {
    const base = ((i * 7919) % 18) / 10; // 0..1.7 deterministic
    buckets.set(p.name, (buckets.get(p.name) ?? 0) + base);
  });
  const max = Math.max(...Array.from(buckets.values()), 1);
  return Array.from(buckets.entries()).map(([province, val]) => {
    const c = findProvince(province) ?? PROVINCES[0];
    return { lat: c.lat, lng: c.lng, intensity: val / max, province, meta: `${val.toFixed(1)} điểm nhu cầu` };
  });
}

/** Compare demand vs supply per province → returns category for marker coloring. */
function buildSupplyVsDemand() {
  const demand = new Map<string, number>();
  buildDemandPoints().forEach(p => demand.set(p.province, p.intensity));
  const supply = new Map<string, number>();
  dealers.forEach(d => supply.set(d.province, (supply.get(d.province) ?? 0) + 1));
  return PROVINCES.map(p => {
    const d = demand.get(p.name) ?? 0;
    const s = supply.get(p.name) ?? 0;
    let kind: 'gap' | 'covered' | 'oversupply' | 'cold';
    if (d > 0.55 && s === 0) kind = 'gap';            // high demand, no dealer → orange alert
    else if (s > 0 && d > 0.4) kind = 'covered';      // healthy
    else if (s > 0 && d <= 0.4) kind = 'oversupply';  // dealer but quiet
    else kind = 'cold';
    return { ...p, demand: d, supply: s, kind };
  });
}

/** Map each province to its strongest commodity price change (%) — used by Price layer. */
function buildPriceGradient() {
  // Heuristic mapping: Tây Nguyên ↔ cà phê & sầu riêng, ĐBSCL ↔ lúa, Đông Nam Bộ ↔ tiêu/cao su
  const regionCommodity: Record<string, string> = {
    'Tây Nguyên': 'Cà phê',
    'Đông Nam Bộ': 'Cao su',
    'ĐBSCL': 'Lúa',
    'Trung': 'Sầu riêng',
    'Bắc': 'Hồ tiêu',
  };
  return PROVINCES.map(p => {
    const target = regionCommodity[p.region] ?? 'Cà phê';
    const c = commodityPrices.find(x => x.name.includes(target)) ?? commodityPrices[0];
    // Slight per-province variance for visual interest
    const variance = ((p.name.charCodeAt(0) % 7) - 3) * 0.4;
    const change = c.change + variance;
    return { ...p, commodity: c.name, change, price: c.currentPrice };
  });
}

export default function MarketHeatmap({
  layer, onLayerChange,
}: { layer: HeatLayer; onLayerChange: (l: HeatLayer) => void; }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const { config } = useHomepageConfig();

  const demand = useMemo(buildDemandPoints, []);
  const supplyVsDemand = useMemo(buildSupplyVsDemand, []);
  const priceGradient = useMemo(buildPriceGradient, []);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [14.5, 108.0], zoom: 5.4, minZoom: 4, maxZoom: 12,
      scrollWheelZoom: false, zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO · Bản đồ Việt Nam',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Sovereignty overlay: Hoàng Sa & Trường Sa (always visible across layer switches)
    addSovereigntyOverlay(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render data layer when layer/config changes
  useEffect(() => {
    const map = mapRef.current; const group = layerGroupRef.current;
    if (!map || !group) return;
    group.clearLayers();

    if (layer === 'demand') {
      const points: [number, number, number][] = demand.map(p => [p.lat, p.lng, p.intensity * config.heatmap.maxIntensity]);
      const heat = (L as unknown as { heatLayer: (pts: [number, number, number][], opts: Record<string, unknown>) => L.Layer }).heatLayer(points, {
        radius: config.heatmap.radius,
        blur: config.heatmap.blur,
        maxZoom: 10,
        gradient: { 0.2: '#22c55e', 0.4: '#eab308', 0.6: '#f97316', 0.85: '#ef4444' },
      });
      group.addLayer(heat);
      // Add tiny labels for top 5 provinces
      [...demand].sort((a, b) => b.intensity - a.intensity).slice(0, 5).forEach(p => {
        L.marker([p.lat, p.lng], { icon: chipIcon(`🔥 ${p.province}`, '#ef4444') }).addTo(group);
      });
    }

    if (layer === 'supply') {
      supplyVsDemand.forEach(p => {
        const color = p.kind === 'gap' ? '#f97316'
          : p.kind === 'covered' ? '#22c55e'
          : p.kind === 'oversupply' ? '#3b82f6'
          : '#94a3b8';
        const r = 8 + Math.min(p.supply, 6) * 2;
        const m = L.circleMarker([p.lat, p.lng], {
          radius: r, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.85,
        }).bindPopup(
          `<strong>${p.name}</strong><br/>` +
          `Đại lý: <b>${p.supply}</b> · Nhu cầu: <b>${(p.demand * 100).toFixed(0)}%</b><br/>` +
          `Trạng thái: <b style="color:${color}">${
            p.kind === 'gap' ? '⚠️ Vùng trống' : p.kind === 'covered' ? '✅ Phủ tốt' : p.kind === 'oversupply' ? '🔵 Yên tĩnh' : '— Lạnh'
          }</b>`
        );
        group.addLayer(m);
      });
    }

    if (layer === 'price') {
      const maxAbs = Math.max(...priceGradient.map(p => Math.abs(p.change)), 1);
      priceGradient.forEach(p => {
        const intensity = Math.min(Math.abs(p.change) / maxAbs, 1);
        const up = p.change >= 0;
        const color = up
          ? `rgba(220,38,38,${0.25 + intensity * 0.65})`  // red for price↑ (hot)
          : `rgba(59,130,246,${0.25 + intensity * 0.6})`; // blue for price↓
        const m = L.circleMarker([p.lat, p.lng], {
          radius: 12 + intensity * 18, fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.7,
        }).bindPopup(
          `<strong>${p.name}</strong><br/>${p.commodity}<br/>` +
          `Giá: <b>${p.price.toLocaleString('vi-VN')}đ</b><br/>` +
          `<span style="color:${up ? '#dc2626' : '#3b82f6'}">${up ? '▲' : '▼'} ${p.change.toFixed(1)}%</span>`
        );
        group.addLayer(m);
      });
    }

    // Pinned hotspot overlay (admin-managed)
    if (config.pinnedHotspot.enabled) {
      const c = findProvince(config.pinnedHotspot.province);
      if (c) {
        L.marker([c.lat, c.lng], { icon: pinIcon(config.pinnedHotspot.province), zIndexOffset: 900 })
          .bindPopup(`<strong>📌 Vùng trọng điểm</strong><br/>${config.pinnedHotspot.province}<br/><em>${config.pinnedHotspot.note}</em>`)
          .addTo(group);
      }
    }
  }, [layer, demand, supplyVsDemand, priceGradient, config.heatmap, config.pinnedHotspot]);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-sm">Bản đồ thị trường</span>
          <Badge variant="secondary" className="text-[10px] ml-1">Real-time</Badge>
        </div>
        <div className="flex gap-1 bg-muted rounded-md p-0.5">
          <LayerBtn active={layer === 'demand'} onClick={() => onLayerChange('demand')} icon={Flame} label="Nhu cầu" color="text-destructive" />
          <LayerBtn active={layer === 'supply'} onClick={() => onLayerChange('supply')} icon={Store} label="Mạng lưới" color="text-success" />
          <LayerBtn active={layer === 'price'} onClick={() => onLayerChange('price')} icon={TrendingUp} label="Giá" color="text-warning" />
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-[420px]" />
      <div className="flex items-center gap-3 px-3 py-2 border-t text-[11px] bg-muted/30 flex-wrap">
        {layer === 'demand' && (
          <>
            <Legend color="#22c55e" label="Thấp" />
            <Legend color="#eab308" label="TB" />
            <Legend color="#f97316" label="Cao" />
            <Legend color="#ef4444" label="Đỉnh" />
          </>
        )}
        {layer === 'supply' && (
          <>
            <Legend color="#22c55e" label="Phủ tốt" />
            <Legend color="#f97316" label="⚠️ Vùng trống (cần mở ĐL)" />
            <Legend color="#3b82f6" label="Yên tĩnh" />
            <Legend color="#94a3b8" label="Lạnh" />
          </>
        )}
        {layer === 'price' && (
          <>
            <Legend color="#dc2626" label="Giá tăng mạnh" />
            <Legend color="#3b82f6" label="Giá giảm" />
            <span className="text-muted-foreground">— kích thước = biên độ %</span>
          </>
        )}
        {config.pinnedHotspot.enabled && (
          <span className="ml-auto flex items-center gap-1 text-primary font-medium">
            <Pin className="w-3 h-3" /> Đã ghim: {config.pinnedHotspot.province}
          </span>
        )}
      </div>
    </Card>
  );
}

function LayerBtn({ active, onClick, icon: Icon, label, color }: {
  active: boolean; onClick: () => void; icon: typeof Flame; label: string; color: string;
}) {
  return (
    <Button size="sm" variant={active ? 'default' : 'ghost'} onClick={onClick}
      className={`h-7 px-2 text-[11px] ${active ? '' : color}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />{label}
    </Button>
  );
}

function Legend({ color, label }: { color: string; label: string; }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />{label}
    </span>
  );
}

function chipIcon(text: string, color: string) {
  return L.divIcon({
    html: `<div style="background:${color};color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.3)">${text}</div>`,
    className: '', iconSize: [60, 18], iconAnchor: [30, 9],
  });
}

function pinIcon(label: string) {
  return L.divIcon({
    html: `
      <div style="position:relative;">
        <div style="background:#dc2626;color:#fff;padding:3px 8px;border-radius:8px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff">📌 ${label}</div>
      </div>`,
    className: '', iconSize: [80, 22], iconAnchor: [40, 11],
  });
}

