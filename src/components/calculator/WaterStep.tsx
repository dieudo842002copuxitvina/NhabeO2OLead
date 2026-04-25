import { Card } from '@/components/ui/card';
import { WATER_SOURCES, type WaterSourceKey } from '@/lib/calculatorV2';

interface Props {
  value: WaterSourceKey | null;
  onSelect: (s: WaterSourceKey) => void;
}

export default function WaterStep({ value, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">Bước 3: Nguồn nước</h2>
        <p className="text-sm text-muted-foreground">
          Nguồn nước ảnh hưởng trực tiếp đến công suất bơm và phụ kiện đi kèm.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {WATER_SOURCES.map(w => {
          const active = value === w.key;
          return (
            <button key={w.key} type="button" onClick={() => onSelect(w.key)} className="text-left">
              <Card className={`p-6 border-2 transition-all ${
                active
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:scale-[1.02]'
              }`}>
                <div className="text-5xl mb-3">{w.emoji}</div>
                <div className="font-display font-bold text-lg">{w.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {w.key === 'well'
                    ? 'Cần bơm chìm + ống hút sâu (+10% chi phí)'
                    : 'Bơm mặt tiêu chuẩn, dễ lắp đặt'}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
