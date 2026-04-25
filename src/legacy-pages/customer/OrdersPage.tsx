import { orders } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/components/ProductCard';
import { CheckCircle2, Circle, Truck, Clock, Package, XCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-warning/10 text-warning', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-info/10 text-info', icon: CheckCircle2 },
  processing: { label: 'Đang xử lý', color: 'bg-primary/10 text-primary', icon: Package },
  shipping: { label: 'Đang giao', color: 'bg-accent/10 text-accent', icon: Truck },
  delivered: { label: 'Hoàn thành', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const allStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];

export default function CustomerOrdersPage() {
  // Mock: show all orders as if for customer c-1
  const myOrders = orders.filter(o => o.customerId === 'c-1');

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
      <p className="text-muted-foreground mb-6">Theo dõi trạng thái đơn hàng</p>

      {myOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map(order => {
            const config = statusConfig[order.status];
            return (
              <Card key={order.id} className="animate-fade-in">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold">{order.id}</h3>
                        <Badge className={`${config.color} border-0 text-xs`}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.dealerName} · {order.createdAt}
                      </p>
                    </div>
                    <p className="font-display font-bold text-lg text-primary">{formatVND(order.total)}</p>
                  </div>

                  {/* Items */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span>{item.productName} × {item.quantity}</span>
                        <span className="font-medium">{formatVND(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <h4 className="text-sm font-semibold mb-3">Tiến trình đơn hàng</h4>
                    <div className="flex items-center gap-0">
                      {allStatuses.map((status, i) => {
                        const timelineEntry = order.timeline.find(t => t.status === status);
                        const isCompleted = !!timelineEntry;
                        const isCurrent = order.status === status;
                        return (
                          <div key={status} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </div>
                              <p className={`text-[10px] mt-1 text-center ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {statusConfig[status].label}
                              </p>
                              {timelineEntry && (
                                <p className="text-[9px] text-muted-foreground">{timelineEntry.time.split(' ')[1]}</p>
                              )}
                            </div>
                            {i < allStatuses.length - 1 && (
                              <div className={`h-0.5 flex-1 mx-1 ${
                                order.timeline.find(t => t.status === allStatuses[i + 1])
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
