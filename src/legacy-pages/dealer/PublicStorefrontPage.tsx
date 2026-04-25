import { useParams, Link } from 'react-router-dom';
import { findDealerBySlug, dealerSlug } from '@/lib/dealerSlug';
import { dealerProducts, products } from '@/data/mock';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DealerCTA from '@/components/DealerCTA';
import { formatVND } from '@/components/ProductCard';
import {
  MapPin, Star, Phone, Navigation, Sprout, CheckCircle2, Clock, Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Public Storefront — Landing page tự động cho mỗi đại lý.
 * URL: /diem-ban/{ten-dai-ly}
 * Bao gồm: hero, danh sách SP với badge tồn kho, bản đồ Google Maps embed.
 */
export default function PublicStorefrontPage() {
  const { slug = '' } = useParams();
  const dealer = findDealerBySlug(slug);
  const [query, setQuery] = useState('');

  const dealerSKUs = useMemo(
    () => (dealer ? dealerProducts.filter(dp => dp.dealerId === dealer.id) : []),
    [dealer],
  );

  if (!dealer) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Không tìm thấy điểm bán</h1>
        <p className="text-muted-foreground mb-6">Đại lý "{slug}" chưa có trên hệ thống.</p>
        <Button asChild><Link to="/dai-ly">Xem danh sách đại lý</Link></Button>
      </div>
    );
  }

  const inStockCount = dealerSKUs.filter(dp => dp.stock > 0).length;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`;
  const mapEmbed = `https://www.google.com/maps?q=${dealer.lat},${dealer.lng}&hl=vi&z=15&output=embed`;

  const filtered = dealerSKUs.filter(dp => {
    const p = products.find(x => x.id === dp.productId);
    return p?.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container py-8 md:py-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center shrink-0">
              <Sprout className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 mb-2">
                Điểm bán chính hãng · Nhà Bè Agri
              </Badge>
              <h1 className="font-display font-bold text-2xl md:text-4xl">{dealer.name}</h1>
              <p className="text-primary-foreground/85 mt-1.5 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4" /> {dealer.address}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> {dealer.rating}
                </span>
                <span>{dealer.totalOrders} đơn đã giao</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {inStockCount} SP có sẵn
                </span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 max-w-md">
            <DealerCTA
              phone={dealer.phone}
              zalo={dealer.zalo}
              dealerId={dealer.id}
              dealerName={dealer.name}
              size="lg"
            />
          </div>
        </div>
      </section>

      <div className="container py-6 grid lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Sản phẩm tại điểm bán</h2>
            <Badge variant="outline">{dealerSKUs.length} SKU</Badge>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm tại đại lý này…"
              className="pl-9 h-11 bg-background"
            />
          </div>

          <div className="space-y-3">
            {filtered.map(dp => {
              const prod = products.find(p => p.id === dp.productId);
              if (!prod) return null;
              const isIn = dp.stock > 0;
              return (
                <Card key={dp.productId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Sprout className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${prod.slug}`}
                          className="font-semibold text-sm hover:text-primary line-clamp-2"
                        >
                          {prod.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{prod.category}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="font-display font-bold text-primary">{formatVND(dp.price)}</span>
                          <Badge
                            className={`text-[10px] border-0 ${
                              isIn ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {isIn ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Có sẵn</>
                                  : <><Clock className="w-3 h-3 mr-1 inline" /> Đặt hàng</>}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            )}
          </div>
        </div>

        {/* Map + contact */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="aspect-square w-full bg-muted">
              <iframe
                title={`Bản đồ ${dealer.name}`}
                src={mapEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Địa chỉ</p>
                <p className="text-sm font-medium">{dealer.address}</p>
              </div>
              <Button asChild className="w-full" variant="outline">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-4 h-4 mr-2" /> Chỉ đường Google Maps
                </a>
              </Button>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <a href={`tel:${dealer.phone}`}>
                  <Phone className="w-4 h-4 mr-2" /> Gọi {dealer.phone}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">🛡 Cam kết Nhà Bè Agri</p>
              Sản phẩm chính hãng · Bảo hành đầy đủ · Hỗ trợ lắp đặt tận nơi.
            </CardContent>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center">
            URL: /diem-ban/{dealerSlug(dealer.name)}
          </p>
        </aside>
      </div>
    </div>
  );
}
