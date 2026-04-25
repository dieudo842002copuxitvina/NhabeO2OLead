import { orders } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatVND } from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  processing: 'bg-primary/10 text-primary',
  shipping: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
};


export default function DealerOrdersPage() {
  const dealerId = 'd-1';
  const dealerOrders = orders.filter(o => o.dealerId === dealerId);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Đơn hàng</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4">Mã đơn</th>
                  <th className="py-3 pr-4">Khách hàng</th>
                  <th className="py-3 pr-4">Sản phẩm</th>
                  <th className="py-3 pr-4">Tổng</th>
                  <th className="py-3 pr-4">Ngày</th>
                  <th className="py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dealerOrders.map(order => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{order.id}</td>
                    <td className="py-3 pr-4">{order.customerName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{order.items.map(i => i.productName).join(', ')}</td>
                    <td className="py-3 pr-4 font-display font-semibold">{formatVND(order.total)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{order.createdAt}</td>
                    <td className="py-3">
                      <Badge className={`${statusColors[order.status]} text-[10px] border-0`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
