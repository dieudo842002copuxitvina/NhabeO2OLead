import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { SLOPES, type SlopeKey } from '@/lib/calculatorV2';
import { Ruler, Mountain } from 'lucide-react';

interface Props {
  area: number;
  spacing: number;
  slope: SlopeKey | null;
  onChange: (patch: { area?: number; spacing?: number; slope?: SlopeKey }) => void;
}

export default function LandStep({ area, spacing, slope, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">Bước 2: Thông số thửa đất</h2>
        <p className="text-sm text-muted-foreground">Diện tích, khoảng cách trồng và độ dốc.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area" className="text-sm font-medium flex items-center gap-1.5 mb-2">
            <Ruler className="w-4 h-4 text-primary" /> Diện tích (m²)
          </Label>
          <Input
            id="area"
            type="number"
            min={50}
            max={500000}
            value={area || ''}
            onChange={e => onChange({ area: Math.max(0, Number(e.target.value)) })}
            placeholder="Ví dụ: 5000"
            className="h-12 text-base"
          />
          <p className="text-[11px] text-muted-foreground mt-1">1 ha = 10.000 m²</p>
        </div>

        <div>
          <Label htmlFor="spacing" className="text-sm font-medium mb-2 block">
            Khoảng cách trồng (m × m)
          </Label>
          <Input
            id="spacing"
            type="number"
            min={1}
            max={20}
            step={0.5}
            value={spacing || ''}
            onChange={e => onChange({ spacing: Math.max(0, Number(e.target.value)) })}
            placeholder="Ví dụ: 6"
            className="h-12 text-base"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Nhập 6 nghĩa là trồng 6×6m → 36 m²/cây
          </p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5 mb-2">
          <Mountain className="w-4 h-4 text-primary" /> Độ dốc địa hình
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {SLOPES.map(s => {
            const active = slope === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onChange({ slope: s.key })}
                className="text-left"
              >
                <Card className={`p-4 border-2 transition-all ${
                  active
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}>
                  <div className="text-3xl mb-1">{s.emoji}</div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {s.key === 'flat' ? 'Đất bằng, dễ lắp đặt' : 'Cần thêm ống & bơm khoẻ'}
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
