import StatCard from '@/components/StatCard';
import { orders, customers } from '@/data/mock';
import { formatVND } from '@/components/ProductCard';
import { ClipboardList, Users, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FieldSalesDashboard() {
  const myOrders = orders.slice(0, 4); // Mock: field sales created orders
  const todayOrders = myOrders.filter(o => o.createdAt === '2026-04-14');
  const totalValue = myOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Nhân viên thị trường</h1>
      <p className="text-muted-foreground mb-6">Nguyễn Văn An – Khu vực Đồng Nai</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Đơn hôm nay" value={todayOrders.length.toString()} icon={ClipboardList} />
        <StatCard title="Tổng đơn tháng" value={myOrders.length.toString()} change={15} icon={TrendingUp} />
        <StatCard title="Khách hàng" value={customers.length.toString()} icon={Users} />
        <StatCard title="Doanh số" value={formatVND(totalValue)} change={22} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Đơn hàng gần đây</CardTitle>
            <Button variant="default" size="sm" asChild>
              <Link to="/fieldsales/quick-order">+ Tạo đơn mới</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-sm">{formatVND(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Khách hàng</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/fieldsales/customers">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customers.map(cust => (
                <div key={cust.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{cust.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {cust.address}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{cust.phone}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
