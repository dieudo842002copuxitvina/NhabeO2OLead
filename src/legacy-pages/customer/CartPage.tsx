import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatVND } from '@/components/ProductCard';
import { Trash2, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mt-2">Hãy thêm sản phẩm vào giỏ hàng của bạn.</p>
        <Button asChild className="mt-4"><Link to="/products">Xem sản phẩm</Link></Button>
      </div>
    );
  }

  // Group cart items by dealer
  const dealerGroups = cart.reduce((acc, item) => {
    if (!acc[item.dealerId]) acc[item.dealerId] = { dealerName: item.dealerName, items: [] };
    acc[item.dealerId].items.push(item);
    return acc;
  }, {} as Record<string, { dealerName: string; items: typeof cart }>);

  const handleCheckout = () => {
    toast.success('Đặt hàng thành công! Đơn hàng đang được xử lý.');
    clearCart();
    navigate('/orders');
  };

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Giỏ hàng</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(dealerGroups).map(([dealerId, group]) => (
            <div key={dealerId}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">{group.dealerName}</h3>
              </div>
              <div className="space-y-3">
                {group.items.map(item => (
                  <Card key={`${item.product.id}-${item.dealerId}`} className="animate-fade-in">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xl opacity-30">🌱</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.product.category}</p>
                        <p className="font-display font-bold text-sm mt-1 text-primary">{formatVND(item.dealerPrice)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                          <button onClick={() => updateCartQuantity(item.product.id, item.dealerId, item.quantity - 1)} className="px-2 py-1 text-xs">-</button>
                          <span className="px-2 py-1 text-xs font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, item.dealerId, item.quantity + 1)} className="px-2 py-1 text-xs">+</button>
                        </div>
                        <p className="font-display font-bold text-sm w-28 text-right">{formatVND(item.dealerPrice * item.quantity)}</p>
                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id, item.dealerId)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sản phẩm ({cart.length})</span>
                  <span>{formatVND(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vận chuyển</span>
                  <span className="text-success">Miễn phí</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-display font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatVND(cartTotal)}</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="lg" onClick={handleCheckout}>
                Đặt hàng <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
