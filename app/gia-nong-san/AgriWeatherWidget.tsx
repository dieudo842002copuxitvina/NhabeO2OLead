'use client';

import Link from 'next/link';
import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  CloudSun,
  Droplets,
  MapPin,
  RefreshCcw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WeatherContextKey = 'ideal' | 'extreme';

type WeatherContext = {
  key: WeatherContextKey;
  label: string;
  location: string;
  temperatureC: number;
  rainfallMm: number;
  windMs: number;
  et0MmDay: number;
  condition: string;
  fieldNote: string;
  advisory: {
    tone: 'good' | 'warning';
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

const PRIMARY_GREEN = '#2E7D32';
const ACTION_ORANGE = '#EF6C00';

const MOCK_WEATHER_CONTEXT: Record<WeatherContextKey, WeatherContext> = {
  ideal: {
    key: 'ideal',
    label: 'Thời tiết đẹp',
    location: 'Xã Đak Nhau, Bù Đăng, Bình Phước',
    temperatureC: 28,
    rainfallMm: 0,
    windMs: 2.1,
    et0MmDay: 4.2,
    condition: 'Không mưa, gió thấp',
    fieldNote: 'Lá khô ráo, độ gió thấp và nền ẩm ổn định. Đây là cửa sổ rất tốt để xử lý thuốc rầy hoặc phun sinh học cần bám lá đều.',
    advisory: {
      tone: 'good',
      title: 'Thời tiết lý tưởng.',
      description:
        'Độ gió thấp, không mưa. Rất thích hợp để triển khai xịt thuốc rầy, hạt sương sẽ bám lá tốt nhất.',
      ctaLabel: 'Gọi Đội Bay Drone Xịt Thuốc',
      ctaHref: '/giai-phap',
    },
  },
  extreme: {
    key: 'extreme',
    label: 'Hạn khô cực đoan',
    location: 'Xã Đak Nhau, Bù Đăng, Bình Phước',
    temperatureC: 35,
    rainfallMm: 0,
    windMs: 6,
    et0MmDay: 7.5,
    condition: 'Gió mạnh, khô hạn',
    fieldNote: 'Nền ẩm rút rất nhanh trong ngày. Nếu chậm bù ẩm, cây dễ mất nước, rụng hoa hoặc rụng trái non ở những lô đang nuôi trái.',
    advisory: {
      tone: 'warning',
      title: 'Cảnh báo bốc thoát hơi nước (ET0) cực cao.',
      description:
        'Cây đang mất nước nghiêm trọng. Cần tăng cường tưới bù ẩm lập tức để tránh rụng hoa/trái non.',
      ctaLabel: 'Xem Béc Tưới Bù Áp Tiết Kiệm Nước',
      ctaHref: '/san-pham/dau-tuoi-nho-giot-rivulis-supertif',
    },
  },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  iconTone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  iconTone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={cn('rounded-2xl p-2.5', iconTone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}

export default function AgriWeatherWidget() {
  const [scenarioKey, setScenarioKey] = useState<WeatherContextKey>('ideal');
  const [lastSyncedLabel, setLastSyncedLabel] = useState('vừa cập nhật');

  const scenario = MOCK_WEATHER_CONTEXT[scenarioKey];
  const isWarning = scenario.advisory.tone === 'warning';
  const nextScenarioKey: WeatherContextKey = scenarioKey === 'ideal' ? 'extreme' : 'ideal';

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]">
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
              <CloudSun className="h-4 w-4" style={{ color: PRIMARY_GREEN }} />
              Radar vi khí hậu
            </div>

            <button
              type="button"
              onClick={() => setScenarioKey(nextScenarioKey)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Chuyển sang {MOCK_WEATHER_CONTEXT[nextScenarioKey].label}
            </button>
          </div>

          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">AgriWeatherWidget</h3>
            <p className="mt-1 text-base leading-7 text-slate-500">
              Dữ liệu thời tiết siêu địa phương cho quyết định bay drone, tưới bù ẩm và chốt sale thiết bị theo đúng bối cảnh nông vụ.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Vị trí hiện tại</p>
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${PRIMARY_GREEN}14`, color: PRIMARY_GREEN }}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-slate-900">📍 {scenario.location}</p>
                  <p className="mt-1 text-sm text-slate-500">Lần làm mới: {lastSyncedLabel}</p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full border-slate-200 px-3 text-slate-700"
              onClick={() => setLastSyncedLabel('vừa làm mới dữ liệu mock')}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            icon={Thermometer}
            label="Nhiệt độ"
            value={`${scenario.temperatureC}°C`}
            hint={scenario.condition}
            iconTone={isWarning ? 'bg-orange-50 text-orange-600' : 'bg-amber-50 text-amber-600'}
          />
          <MetricCard
            icon={Droplets}
            label="Lượng mưa"
            value={`${scenario.rainfallMm} mm`}
            hint={scenario.rainfallMm === 0 ? 'Không có mưa cản trở thao tác ngoài đồng.' : 'Theo dõi sát khả năng ngập úng cục bộ.'}
            iconTone="bg-sky-50 text-sky-600"
          />
          <MetricCard
            icon={Wind}
            label="Tốc độ gió"
            value={`${scenario.windMs} m/s`}
            hint={scenario.windMs < 3 ? 'Mức gió an toàn cho bay drone phun hạt mịn.' : 'Gió mạnh, không phù hợp cho tác vụ phun chính xác.'}
            iconTone="bg-slate-100 text-slate-700"
          />
          <MetricCard
            icon={Sun}
            label="Chỉ số ET0"
            value={`${scenario.et0MmDay} mm`}
            hint={scenario.et0MmDay >= 7 ? 'ET0 rất cao, cần tính ngay lượng nước tưới bù.' : 'ET0 ở ngưỡng kiểm soát được nếu giữ lịch tưới đều.'}
            iconTone="bg-emerald-50 text-emerald-600"
          />
        </div>

        <div
          className={cn(
            'rounded-[24px] border p-5 shadow-sm',
            isWarning ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                isWarning ? 'bg-orange-100 text-orange-700' : 'bg-white text-emerald-700'
              )}
            >
              {isWarning ? <AlertTriangle className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>

            <div className="min-w-0 space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Khối lời khuyên AI</p>
                <h4 className="mt-1 text-xl font-black leading-8 text-slate-900">
                  <strong>{scenario.advisory.title}</strong>
                </h4>
              </div>

              <p className="text-base italic leading-7 text-slate-700">
                <strong>{scenario.advisory.description}</strong>
              </p>

              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-900">Nhận định ruộng vườn:</span> {scenario.fieldNote}
              </div>

              <Button
                asChild
                className="h-12 w-full rounded-2xl text-base font-bold text-white shadow-[0_14px_28px_-16px_rgba(15,23,42,0.45)]"
                style={{ backgroundColor: isWarning ? ACTION_ORANGE : PRIMARY_GREEN }}
              >
                <Link href={scenario.advisory.ctaHref}>{scenario.advisory.ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Kịch bản đang mô phỏng</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{scenario.label}</p>
          <p className="mt-2 text-base leading-7 text-slate-500">
            Dùng nút toggle phía trên để chuyển nhanh giữa kịch bản thời tiết đẹp và kịch bản khô hạn ET0 cao, từ đó test logic chốt sale phần cứng theo bối cảnh.
          </p>
        </div>
      </div>
    </section>
  );
}
