"use client";

/**
 * SmartLocationPicker.tsx
 * Offline-first location selector: Tỉnh → Huyện → Xã
 * + nút [📍 Tìm vị trí tự động] dùng navigator.geolocation (không dùng Google Maps API)
 */
import { useState, useCallback } from 'react';
import { MapPin, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { VN_PROVINCES } from '@/data/vnAdministrative';

// Nearest province lookup by lat/lng (simple bounding-box mapping for offline)
const PROVINCE_BOUNDS: { code: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { code: 'daklak',    minLat: 12.0, maxLat: 13.2, minLng: 107.5, maxLng: 108.9 },
  { code: 'lamdong',   minLat: 11.2, maxLat: 12.3, minLng: 107.2, maxLng: 108.6 },
  { code: 'gialai',    minLat: 13.0, maxLat: 14.6, minLng: 107.4, maxLng: 108.9 },
  { code: 'daknong',   minLat: 11.6, maxLat: 12.5, minLng: 107.2, maxLng: 108.0 },
  { code: 'dongnai',   minLat: 10.5, maxLat: 11.4, minLng: 106.7, maxLng: 107.9 },
  { code: 'binhphuoc', minLat: 11.3, maxLat: 12.2, minLng: 106.4, maxLng: 107.5 },
  { code: 'tiengiang', minLat: 10.0, maxLat: 10.7, minLng: 105.8, maxLng: 106.9 },
  { code: 'dongthap',  minLat: 10.1, maxLat: 10.9, minLng: 105.2, maxLng: 106.0 },
  { code: 'khanhhoa',  minLat: 11.8, maxLat: 12.9, minLng: 108.3, maxLng: 109.5 },
  { code: 'binhthuan', minLat: 10.6, maxLat: 12.0, minLng: 107.3, maxLng: 108.6 },
];

function guessProvinceFromCoords(lat: number, lng: number): string | null {
  for (const b of PROVINCE_BOUNDS) {
    if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) {
      return b.code;
    }
  }
  return null;
}

// ─── Shared select styles ─────────────────────────────────────────────────────
const SELECT_CLS =
  'w-full h-12 pl-3 pr-8 rounded-xl border-2 border-border bg-background ' +
  'text-sm font-medium appearance-none focus:outline-none focus:border-[#2D5A27] ' +
  'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ' +
  'text-foreground';

interface Props {
  /** react-hook-form register-style: controlled values */
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  onProvinceChange: (code: string, name: string) => void;
  onDistrictChange: (code: string, name: string) => void;
  onWardChange: (code: string, name: string) => void;
  onGeoSuccess?: (lat: number, lng: number) => void;
  /** Validation errors from react-hook-form */
  provinceError?: string;
  districtError?: string;
  /** Show ward selector? */
  showWard?: boolean;
  /** Field label size */
  compact?: boolean;
}

type GeoState = 'idle' | 'loading' | 'success' | 'error';

export default function SmartLocationPicker({
  provinceCode,
  districtCode,
  wardCode,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onGeoSuccess,
  provinceError,
  districtError,
  showWard = true,
  compact = false,
}: Props) {
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [geoMsg, setGeoMsg] = useState('');

  const selectedProvince = VN_PROVINCES.find((p) => p.code === provinceCode) ?? null;
  const selectedDistrict = selectedProvince?.districts.find((d) => d.code === districtCode) ?? null;

  // ── Auto-detect location ───────────────────────────────────────────────────
  const handleGeoLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState('error');
      setGeoMsg('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setGeoState('loading');
    setGeoMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const guessedCode = guessProvinceFromCoords(latitude, longitude);
        if (guessedCode) {
          const prov = VN_PROVINCES.find((p) => p.code === guessedCode);
          if (prov) {
            onProvinceChange(prov.code, prov.name);
            onDistrictChange('', '');
            onWardChange('', '');
          }
          setGeoMsg(`📍 Phát hiện: ${guessedCode === 'daklak' ? 'Đắk Lắk' : VN_PROVINCES.find(p => p.code === guessedCode)?.name ?? guessedCode}`);
        } else {
          setGeoMsg('Không nhận dạng được tỉnh. Vui lòng chọn thủ công.');
        }
        onGeoSuccess?.(latitude, longitude);
        setGeoState('success');
      },
      (err) => {
        setGeoState('error');
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMsg('Bạn đã từ chối cho phép định vị. Vui lòng chọn thủ công.');
        } else {
          setGeoMsg('Không thể xác định vị trí. Vui lòng chọn thủ công.');
        }
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, [onProvinceChange, onDistrictChange, onWardChange, onGeoSuccess]);

  const labelCls = compact
    ? 'text-xs font-semibold text-muted-foreground mb-1 block'
    : 'text-sm font-semibold text-foreground mb-1.5 block';

  return (
    <div className="space-y-4">
      {/* Geo-locate button */}
      <button
        type="button"
        onClick={handleGeoLocate}
        disabled={geoState === 'loading'}
        className={`
          flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 text-sm font-semibold
          transition-all duration-200
          ${geoState === 'success'
            ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27]'
            : geoState === 'error'
            ? 'border-destructive/40 bg-destructive/5 text-destructive'
            : 'border-dashed border-border hover:border-[#2D5A27]/60 hover:bg-[#2D5A27]/5 text-muted-foreground hover:text-[#2D5A27]'
          }
        `}
      >
        {geoState === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : geoState === 'success' ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <MapPin className="w-4 h-4 shrink-0" />
        )}
        <span className="flex-1 text-left">
          {geoState === 'loading'
            ? 'Đang xác định vị trí...'
            : geoState === 'success' && geoMsg
            ? geoMsg
            : geoState === 'error' && geoMsg
            ? geoMsg
            : '📍 Tìm vị trí tự động'}
        </span>
      </button>

      {/* Province selector */}
      <div>
        <label className={labelCls}>
          Tỉnh / Thành phố <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <select
            className={`${SELECT_CLS} ${provinceError ? 'border-destructive' : ''}`}
            value={provinceCode}
            onChange={(e) => {
              const prov = VN_PROVINCES.find((p) => p.code === e.target.value);
              onProvinceChange(e.target.value, prov?.name ?? '');
              onDistrictChange('', '');
              onWardChange('', '');
            }}
          >
            <option value="">-- Chọn tỉnh / thành phố --</option>
            {VN_PROVINCES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name} ({p.region})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {provinceError && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
            {provinceError}
          </p>
        )}
      </div>

      {/* District selector */}
      <div>
        <label className={labelCls}>
          Quận / Huyện <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <select
            className={`${SELECT_CLS} ${districtError ? 'border-destructive' : ''}`}
            value={districtCode}
            disabled={!selectedProvince}
            onChange={(e) => {
              const dist = selectedProvince?.districts.find((d) => d.code === e.target.value);
              onDistrictChange(e.target.value, dist?.name ?? '');
              onWardChange('', '');
            }}
          >
            <option value="">
              {selectedProvince ? '-- Chọn quận / huyện --' : '-- Chọn tỉnh trước --'}
            </option>
            {selectedProvince?.districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {districtError && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
            {districtError}
          </p>
        )}
      </div>

      {/* Ward selector */}
      {showWard && (
        <div>
          <label className={labelCls}>Phường / Xã</label>
          <div className="relative">
            <select
              className={SELECT_CLS}
              value={wardCode}
              disabled={!selectedDistrict}
              onChange={(e) => {
                const ward = selectedDistrict?.wards.find((w) => w.code === e.target.value);
                onWardChange(e.target.value, ward?.name ?? '');
              }}
            >
              <option value="">
                {selectedDistrict ? '-- Chọn phường / xã (tuỳ chọn) --' : '-- Chọn huyện trước --'}
              </option>
              {selectedDistrict?.wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}
