import { weatherData } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { CloudRain, Wind, Droplets, Thermometer, Sun } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

/**
 * Weather Radar — chỉ số nông vụ: lượng mưa, gió, ET0
 * ET0 (Evapotranspiration) ≈ 0.0023 * (Tmean+17.8) * sqrt(Tmax-Tmin) * Ra
 * Simplified estimate from temp + humidity + wind for demo.
 */
function estimateET0(temp: number, humidity: number, wind: number): number {
  // Hargreaves-style simplified: higher temp + lower humidity + more wind = higher ET0 (mm/day)
  const base = (temp - 5) * 0.18;
  const humidityFactor = (100 - humidity) / 100;
  const windFactor = 1 + wind / 50;
  return Math.max(0, +(base * humidityFactor * windFactor).toFixed(1));
}

function et0Level(et0: number): { label: string; color: string } {
  if (et0 < 3) return { label: 'Thấp', color: 'text-success' };
  if (et0 < 5) return { label: 'Trung bình', color: 'text-info' };
  if (et0 < 7) return { label: 'Cao', color: 'text-warning' };
  return { label: 'Rất cao', color: 'text-destructive' };
}

export default function WeatherRadar() {
  const { current, forecast, location } = weatherData;
  const et0 = estimateET0(current.temp, current.humidity, current.wind);
  const level = et0Level(et0);

  // Radar metrics (normalized 0–100 for visualization)
  const radarData = [
    { metric: 'Nhiệt độ', value: Math.min(100, (current.temp / 45) * 100), raw: `${current.temp}°C` },
    { metric: 'Độ ẩm', value: current.humidity, raw: `${current.humidity}%` },
    { metric: 'Mưa', value: Math.min(100, (current.rainfall / 50) * 100), raw: `${current.rainfall}mm` },
    { metric: 'Gió', value: Math.min(100, (current.wind / 30) * 100), raw: `${current.wind} m/s` },
    { metric: 'ET0', value: Math.min(100, (et0 / 10) * 100), raw: `${et0} mm/d` },
  ];

  const indicators = [
    { icon: CloudRain, label: 'Lượng mưa', value: `${current.rainfall} mm`, sub: 'Hôm nay', color: 'text-info', bg: 'bg-info/10' },
    { icon: Wind, label: 'Tốc độ gió', value: `${current.wind} m/s`, sub: current.wind > 15 ? 'Gió mạnh' : 'Bình thường', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Sun, label: 'ET0 — Bốc hơi', value: `${et0} mm/d`, sub: level.label, color: level.color, bg: 'bg-warning/10' },
  ];

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base flex items-center gap-2">🌦️ Radar nông vụ</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{location} · {current.condition}</p>
          </div>
          <div className="flex items-center gap-2 bg-info/10 px-3 py-1.5 rounded-lg">
            <Thermometer className="w-4 h-4 text-info" />
            <span className="font-display font-bold text-base">{current.temp}°C</span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Droplets className="w-3 h-3" />{current.humidity}%
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Radar chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Indicators */}
          <div className="space-y-2">
            {indicators.map(ind => (
              <div key={ind.label} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
                <div className={`w-9 h-9 rounded-lg ${ind.bg} flex items-center justify-center shrink-0`}>
                  <ind.icon className={`w-4 h-4 ${ind.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">{ind.label}</p>
                  <p className="font-semibold text-sm">{ind.value}</p>
                </div>
                <span className={`text-[10px] font-medium ${ind.color}`}>{ind.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Dự báo 7 ngày</p>
          <div className="flex gap-2 overflow-x-auto">
            {forecast.slice(0, 7).map(f => (
              <div key={f.day} className="text-center min-w-[52px] p-2 rounded-lg bg-muted/40">
                <p className="text-[10px] text-muted-foreground font-medium">{f.day}</p>
                <p className="text-lg my-0.5">{f.condition}</p>
                <p className="text-xs font-bold">{f.temp}°</p>
                <p className="text-[9px] text-info mt-0.5">{f.rainfall}mm</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
