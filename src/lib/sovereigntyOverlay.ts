import L from 'leaflet';

/**
 * Sovereignty overlay for Hoàng Sa & Trường Sa archipelagos.
 * Shared between DealerNetworkMap and MarketHeatmap to avoid duplication.
 *
 * Usage:
 *   addSovereigntyOverlay(map);            // adds to map directly (persistent)
 *   addSovereigntyOverlay(map, group);     // adds into a LayerGroup
 */

const FLAG_RED = '#da251d';
const KEYFRAMES_ID = 'sov-overlay-keyframes';
const ANIMATION_NAME = 'sovOverlayPulse';

export interface Archipelago {
  name: string;
  en: string;
  center: [number, number];
  district: string;
  bounds: [[number, number], [number, number]];
}

export const ARCHIPELAGOS: Archipelago[] = [
  {
    name: 'Quần đảo Hoàng Sa',
    en: 'Paracel Islands',
    center: [16.5, 112.0],
    district: 'Huyện Hoàng Sa, TP. Đà Nẵng',
    bounds: [[15.7, 111.0], [17.2, 113.0]],
  },
  {
    name: 'Quần đảo Trường Sa',
    en: 'Spratly Islands',
    center: [9.5, 114.0],
    district: 'Huyện Trường Sa, tỉnh Khánh Hòa',
    bounds: [[7.5, 111.5], [12.0, 117.5]],
  },
];

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `@keyframes ${ANIMATION_NAME} { 0%{transform:scale(.8);opacity:.6} 100%{transform:scale(2.2);opacity:0} }`;
  document.head.appendChild(style);
}

export function sovereigntyIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;">
      <div style="position:relative;width:28px;height:28px;">
        <span style="position:absolute;inset:0;border-radius:50%;background:${FLAG_RED};opacity:.35;animation:${ANIMATION_NAME} 2.2s ease-out infinite;"></span>
        <span style="position:absolute;left:4px;top:4px;width:20px;height:20px;border-radius:50%;background:${FLAG_RED};border:2px solid #fff;box-shadow:0 2px 8px rgba(218,37,29,.5);display:flex;align-items:center;justify-content:center;color:#ffcd00;font-size:13px;line-height:1;font-weight:700;">★</span>
      </div>
      <div style="margin-top:4px;background:${FLAG_RED};color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;border:1.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);letter-spacing:.2px;">🇻🇳 ${label}</div>
    </div>`,
    iconSize: [110, 50],
    iconAnchor: [55, 14],
  });
}

function popupHtml(a: Archipelago): string {
  return `
    <div style="min-width:180px;font-family:inherit;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="font-size:16px;">🇻🇳</span>
        <strong style="font-size:13px;color:${FLAG_RED};">${a.name}</strong>
      </div>
      <div style="font-size:11px;color:#64748b;line-height:1.5;">
        <div><em>${a.en}</em></div>
        <div style="margin-top:3px;">📍 ${a.district}</div>
        <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb;font-weight:600;color:#0f172a;">
          Thuộc chủ quyền không thể tranh cãi của Việt Nam
        </div>
      </div>
    </div>`;
}

/**
 * Add the sovereignty overlay (rectangle bounds + flag markers) to a map.
 * @param map  Target Leaflet map
 * @param target Optional LayerGroup to attach into (defaults to the map itself)
 */
export function addSovereigntyOverlay(
  map: L.Map,
  target?: L.LayerGroup,
): L.Layer[] {
  injectKeyframes();
  const host: L.Map | L.LayerGroup = target ?? map;
  const layers: L.Layer[] = [];

  ARCHIPELAGOS.forEach(a => {
    const rect = L.rectangle(a.bounds, {
      color: FLAG_RED,
      weight: 1.5,
      dashArray: '6 4',
      fillColor: FLAG_RED,
      fillOpacity: 0.06,
      interactive: false,
    });
    rect.addTo(host as L.Map);
    layers.push(rect);

    const marker = L.marker(a.center, {
      icon: sovereigntyIcon(a.name.replace('Quần đảo ', '')),
      zIndexOffset: 800,
    }).bindPopup(popupHtml(a));
    marker.addTo(host as L.Map);
    layers.push(marker);
  });

  return layers;
}
