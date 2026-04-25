/**
 * CropPicker.tsx
 * Visual crop selection: Grid cards với icon lớn.
 * Thay thế hoàn toàn dropdown text — tối ưu cho thao tác chạm ngoài trời.
 */
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface CropOption {
  key: string;
  name: string;
  emoji: string;
  hint: string;
}

// ─── Master crop list (mở rộng từ calculatorV2 CROPS) ────────────────────────
export const CROP_OPTIONS: CropOption[] = [
  { key: 'saurieng',  name: 'Sầu riêng',    emoji: '🌳', hint: 'Tây Nguyên · Đông Nam Bộ' },
  { key: 'caphe',     name: 'Cà phê',        emoji: '☕', hint: 'Đắk Lắk · Lâm Đồng' },
  { key: 'tieu',      name: 'Hồ tiêu',       emoji: '🌶️', hint: 'Gia Lai · Đắk Nông' },
  { key: 'xoai',      name: 'Xoài',          emoji: '🥭', hint: 'Đồng Tháp · Tiền Giang' },
  { key: 'mit',       name: 'Mít Thái',      emoji: '🍈', hint: 'Đông Nam Bộ' },
  { key: 'buoi',      name: 'Bưởi',          emoji: '🍊', hint: 'Miền Tây · Miền Đông' },
  { key: 'dua',       name: 'Dừa',           emoji: '🥥', hint: 'Bến Tre · Tiền Giang' },
  { key: 'lua',       name: 'Lúa',           emoji: '🌾', hint: 'Đồng Bằng SCL' },
  { key: 'rau',       name: 'Rau màu',       emoji: '🥬', hint: 'Lâm Đồng · Tây Nguyên' },
  { key: 'thanlong',  name: 'Thanh long',    emoji: '🟥', hint: 'Bình Thuận · Long An' },
  { key: 'cacaothom', name: 'Ca cao / Thơm', emoji: '🍫', hint: 'Đông Nam Bộ' },
  { key: 'khac',      name: 'Cây khác',      emoji: '🌿', hint: 'Nhập loại cây thủ công' },
];

interface Props {
  value: string;
  onChange: (key: string, name: string) => void;
  error?: string;
  /** Số cột grid trên mobile: 2 (default) hoặc 3 */
  mobileCols?: 2 | 3;
}

export default function CropPicker({ value, onChange, error, mobileCols = 2 }: Props) {
  const gridCls = mobileCols === 3
    ? 'grid grid-cols-3 sm:grid-cols-4 gap-2.5'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';

  return (
    <div>
      <div className={gridCls}>
        {CROP_OPTIONS.map((crop, i) => {
          const active = value === crop.key;
          return (
            <motion.button
              key={crop.key}
              type="button"
              onClick={() => onChange(crop.key, crop.name)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className={`
                relative text-left p-3 rounded-xl border-2 transition-all duration-200
                active:scale-95 select-none
                ${active
                  ? 'border-[#2D5A27] bg-[#2D5A27]/8 shadow-md shadow-[#2D5A27]/15'
                  : 'border-border bg-card hover:border-[#2D5A27]/50 hover:bg-[#2D5A27]/3'
                }
              `}
              aria-pressed={active}
              aria-label={crop.name}
            >
              {/* Check badge */}
              {active && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#2D5A27] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}

              {/* Icon */}
              <div className="text-3xl mb-1.5 leading-none">{crop.emoji}</div>

              {/* Name */}
              <p className={`text-xs font-bold leading-tight ${active ? 'text-[#2D5A27]' : 'text-foreground'}`}>
                {crop.name}
              </p>

              {/* Hint */}
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">
                {crop.hint}
              </p>
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-destructive inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
