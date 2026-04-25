import { CROPS, type CropKey } from '@/lib/calculatorV2';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface Props {
  value: CropKey | null;
  onSelect: (crop: CropKey) => void;
}

export default function CropStep({ value, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">Bước 1: Chọn loại cây trồng</h2>
        <p className="text-sm text-muted-foreground">Mỗi loại cây có nhu cầu nước & béc tưới khác nhau.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CROPS.map(crop => {
          const active = value === crop.key;
          return (
            <button
              key={crop.key}
              type="button"
              onClick={() => onSelect(crop.key)}
              className={`group relative text-left transition-all ${active ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
            >
              <Card className={`p-4 h-full border-2 transition-all ${
                active
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}>
                {active && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="text-5xl mb-2">{crop.emoji}</div>
                <div className="font-display font-semibold text-base">{crop.name}</div>
                {crop.commodityName && (
                  <div className="text-[10px] text-muted-foreground mt-1">Cây chủ lực • giá thị trường</div>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
