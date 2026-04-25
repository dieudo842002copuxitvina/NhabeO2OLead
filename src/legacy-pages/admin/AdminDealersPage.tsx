import { dealers, orders } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { maskPhone, maskRevenue, canViewSensitive } from '@/lib/dataMasking';

export default function AdminDealersPage() {
  const { roles } = useAuth();
  const sensitive = canViewSensitive(roles);
  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Quản lý Đại lý</h1>
      <p className="text-muted-foreground mb-6">
        {dealers.length} đại lý trong hệ thống
        {!sensitive && <span className="ml-2 inline-flex items-center gap-1 text-xs"><Lock className="w-3 h-3" /> Doanh thu & SĐT đã ẩn theo quyền của bạn</span>}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dealers.map(dealer => {
          const dealerOrderCount = orders.filter(o => o.dealerId === dealer.id).length;
          return (
            <Card key={dealer.id} className="animate-fade-in">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold">{dealer.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" /> {dealer.address}
                    </div>
                  </div>
                  <Badge variant={dealer.status === 'active' ? 'secondary' : 'destructive'} className="text-[10px]">
                    {dealer.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center bg-muted/50 rounded-lg p-3 mb-3">
                  <div>
                    <p className="font-display font-bold text-sm">{dealer.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Đơn hàng</p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">{maskRevenue(dealer.revenue, roles)}</p>
                    <p className="text-[10px] text-muted-foreground">Doanh thu</p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 text-accent" /> {dealer.rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Đánh giá</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {maskPhone(dealer.phone, roles)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
