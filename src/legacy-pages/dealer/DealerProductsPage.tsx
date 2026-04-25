import { dealerProducts, products } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatVND } from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';

export default function DealerProductsPage() {
  const dealerId = 'd-1';
  const myProducts = dealerProducts.filter(dp => dp.dealerId === dealerId);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Quản lý sản phẩm</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Sản phẩm đang phân phối</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4">Sản phẩm</th>
                  <th className="py-3 pr-4">Danh mục</th>
                  <th className="py-3 pr-4">Giá nền tảng</th>
                  <th className="py-3 pr-4">Giá bán</th>
                  <th className="py-3 pr-4">Tồn kho</th>
                  <th className="py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map(dp => {
                  const prod = products.find(p => p.id === dp.productId);
                  if (!prod) return null;
                  return (
                    <tr key={dp.productId} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{prod.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{prod.category}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatVND(prod.price)}</td>
                      <td className="py-3 pr-4 font-display font-semibold">{formatVND(dp.price)}</td>
                      <td className="py-3 pr-4">{dp.stock} {prod.unit}</td>
                      <td className="py-3">
                        <Badge variant={dp.stock < 20 ? "destructive" : "secondary"} className="text-[10px]">
                          {dp.stock < 20 ? 'Sắp hết' : 'Còn hàng'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
