import { useState } from 'react';
import { products, dealers, dealerProducts, customers } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatVND } from '@/components/ProductCard';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface QuickOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function QuickOrderPage() {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDealer, setSelectedDealer] = useState('');
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const activeDealers = dealers.filter(d => d.status === 'active');

  const availableProducts = selectedDealer
    ? dealerProducts.filter(dp => dp.dealerId === selectedDealer).map(dp => {
        const prod = products.find(p => p.id === dp.productId)!;
        return { ...prod, dealerPrice: dp.price, dealerStock: dp.stock };
      })
    : [];

  const addItem = (productId: string) => {
    const dp = dealerProducts.find(d => d.dealerId === selectedDealer && d.productId === productId);
    const prod = products.find(p => p.id === productId);
    if (!dp || !prod) return;
    if (items.find(i => i.productId === productId)) return;
    setItems([...items, { productId, productName: prod.name, quantity: 1, unitPrice: dp.price }]);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const handleSubmit = () => {
    if (!selectedCustomer || !selectedDealer || items.length === 0) {
      toast.error('Vui lòng chọn khách hàng, đại lý và thêm sản phẩm');
      return;
    }
    setSubmitted(true);
    toast.success('Đã tạo đơn hàng thành công!');
  };

  if (submitted) {
    return (
      <div className="container py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold">Đơn hàng đã được tạo!</h2>
        <p className="text-muted-foreground mt-2">Tổng giá trị: {formatVND(total)}</p>
        <Button className="mt-6" onClick={() => { setSubmitted(false); setItems([]); setSelectedCustomer(''); }}>
          Tạo đơn mới
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Tạo đơn hàng nhanh</h1>
      <p className="text-muted-foreground mb-6">Tạo đơn hàng trực tiếp cho khách hàng</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer + Dealer selection */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Khách hàng</label>
                <select
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Chọn khách hàng...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} – {c.region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Đại lý</label>
                <select
                  value={selectedDealer}
                  onChange={e => { setSelectedDealer(e.target.value); setItems([]); }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Chọn đại lý...</option>
                  {activeDealers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} – {d.region}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Product selection */}
          {selectedDealer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">Chọn sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableProducts.map(prod => {
                    const inOrder = items.find(i => i.productId === prod.id);
                    return (
                      <div key={prod.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{prod.name}</p>
                          <p className="text-xs text-muted-foreground">{formatVND(prod.dealerPrice)} · Còn {prod.dealerStock}</p>
                        </div>
                        {inOrder ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md">
                              <button onClick={() => updateQty(prod.id, inOrder.quantity - 1)} className="px-2 py-1 text-xs">-</button>
                              <span className="px-2 py-1 text-xs font-medium">{inOrder.quantity}</span>
                              <button onClick={() => updateQty(prod.id, inOrder.quantity + 1)} className="px-2 py-1 text-xs">+</button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(prod.id)} className="text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => addItem(prod.id)}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có sản phẩm nào</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {items.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate flex-1 mr-2">{item.productName} × {item.quantity}</span>
                        <span className="font-medium">{formatVND(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 flex justify-between font-display font-bold">
                    <span>Tổng</span>
                    <span className="text-primary">{formatVND(total)}</span>
                  </div>
                </>
              )}
              <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={items.length === 0}>
                Tạo đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
