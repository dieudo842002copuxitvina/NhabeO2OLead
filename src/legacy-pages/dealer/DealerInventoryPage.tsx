import { useState, useMemo } from 'react';
import { dealerProducts, products } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { formatVND } from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';

type StockMode = 'in_stock' | 'on_order';

/**
 * Smart Inventory — Zero-Learning-Curve.
 * Đại lý chỉ gạt 1 công tắc:  Có sẵn (xanh) ↔ Nhận đặt hàng (cam).
 * Không cần nhập số lượng thủ công.
 */
export default function DealerInventoryPage() {
  const dealerId = 'd-1';
  const myProducts = useMemo(
    () => dealerProducts.filter(dp => dp.dealerId === dealerId),
    [dealerId],
  );

  // Local toggle state — derived from mock stock; UX shows only in_stock vs on_order.
  const [modes, setModes] = useState<Record<string, StockMode>>(() =>
    Object.fromEntries(
      myProducts.map(dp => [dp.productId, dp.stock > 0 ? 'in_stock' : 'on_order']),
    ),
  );

  const [query, setQuery] = useState('');

  const handleToggle = (productId: string, productName: string, next: boolean) => {
    const mode: StockMode = next ? 'in_stock' : 'on_order';
    setModes(prev => ({ ...prev, [productId]: mode }));
    toast.success(
      mode === 'in_stock' ? `✓ ${productName} — Có sẵn hàng` : `⏳ ${productName} — Nhận đặt hàng`,
      { duration: 1800 },
    );
  };

  const inStockCount = Object.values(modes).filter(m => m === 'in_stock').length;
  const onOrderCount = Object.values(modes).filter(m => m === 'on_order').length;

  const filtered = myProducts.filter(dp => {
    const p = products.find(x => x.id === dp.productId);
    return p?.name.toLowerCase().includes(query.toLowerCase()) ?? false;
  });

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Tồn kho thông minh</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chỉ cần gạt công tắc. Khách hàng sẽ thấy ngay trạng thái sản phẩm trên web.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Có sẵn hàng</p>
              <p className="font-display font-bold text-2xl text-success leading-none mt-0.5">
                {inStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nhận đặt hàng</p>
              <p className="font-display font-bold text-2xl text-warning leading-none mt-0.5">
                {onOrderCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm…"
          className="pl-9 h-12"
        />
      </div>

      {/* Toggle list */}
      <div className="space-y-2">
        {filtered.map(dp => {
          const prod = products.find(p => p.id === dp.productId);
          if (!prod) return null;
          const mode = modes[dp.productId] ?? 'on_order';
          const isIn = mode === 'in_stock';

          return (
            <Card
              key={dp.productId}
              className={`transition-colors ${isIn ? 'border-success/40' : 'border-warning/40'}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                    isIn ? 'bg-success/10' : 'bg-warning/10'
                  }`}
                >
                  <Package className={`w-5 h-5 ${isIn ? 'text-success' : 'text-warning'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{prod.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{formatVND(dp.price)}</span>
                    <Badge
                      className={`text-[10px] border-0 ${
                        isIn ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                      }`}
                    >
                      {isIn ? '✓ Có sẵn' : '⏳ Đặt hàng'}
                    </Badge>
                  </div>
                </div>

                {/* The ONLY interaction: a toggle */}
                <Switch
                  checked={isIn}
                  onCheckedChange={v => handleToggle(dp.productId, prod.name, v)}
                  className="data-[state=checked]:bg-success data-[state=unchecked]:bg-warning scale-125 ml-2"
                  aria-label={`Trạng thái ${prod.name}`}
                />
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            Không tìm thấy sản phẩm nào.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        💡 Gạt sang phải = Có sẵn (khách thấy huy hiệu xanh) · Gạt sang trái = Nhận đặt hàng (huy hiệu cam)
      </p>
    </div>
  );
}
