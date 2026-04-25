import { weatherData } from '@/data/mock';
import { Card } from '@/components/ui/card';
import { Thermometer, Droplets, CloudRain, Wind, AlertTriangle } from 'lucide-react';
import { getActiveWeatherBanner } from '@/lib/aiRules';
import { useEffect, useState } from 'react';
import { subscribeRules } from '@/lib/aiRules';

/**
 * Compact hyper-local weather widget: temp, humidity, rainfall, wind.
 * Shows drought alert when an active AI weather rule is triggered.
 */
export default function MiniWeatherWidget() {
  const { current, location } = weatherData;
  const [drought, setDrought] = useState(() => getActiveWeatherBanner());

  useEffect(() => {
    const unsub = subscribeRules(() => setDrought(getActiveWeatherBanner()));
    return unsub;
  }, []);

  const stats = [
    { icon: Thermometer, label: 'Nhiệt', value: `${current.temp}°`, color: 'text-warning' },
    { icon: Droplets, label: 'Ẩm', value: `${current.humidity}%`, color: 'text-info' },
    { icon: CloudRain, label: 'Mưa', value: `${current.rainfall}mm`, color: 'text-info' },
    { icon: Wind, label: 'Gió', value: `${current.wind} m/s`, color: 'text-primary' },
  ];

  return (
    <Card className="p-3 h-full bg-gradient-to-br from-card to-info/5 border-info/20">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Thời tiết</p>
          <p className="text-xs font-bold truncate">{location}</p>
        </div>
        <div className="text-2xl">{current.condition.includes('nóng') ? '☀️' : '⛅'}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map(s => (
          <div key={s.label} className="text-center px-1 py-1.5 rounded-md bg-background/60 border">
            <s.icon className={`w-3.5 h-3.5 mx-auto ${s.color}`} />
            <p className="text-[10px] font-bold mt-0.5">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {drought && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/30">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate">Cảnh báo hạn — {drought.region}</span>
        </div>
      )}
    </Card>
  );
}
