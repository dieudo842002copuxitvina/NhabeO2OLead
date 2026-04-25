import { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, TrendingDown, Phone, MessageCircle, CheckCircle2, ArrowRight, Calculator, Droplets, Sparkles, Wrench } from 'lucide-react';
import SeoMeta from '@/components/SeoMeta';
import AIRuleBanner from '@/components/AIRuleBanner';
import { getCrop, getProvince, getCommodityPriceForCrop, getDealersInProvince, getLocalProjects, CROPS, PROVINCES, buildSeoUrl } from '@/lib/seoLanding';
import { getActiveWeatherBanner } from '@/lib/aiRules';
import { trackEvent } from '@/lib/tracking';

export default function SeoLandingPage() {
  const { crop: cropSlug = '', province: provinceSlug = '' } = useParams();

  const crop = getCrop(cropSlug);
  const province = getProvince(provinceSlug);

  const price = useMemo(() => crop ? getCommodityPriceForCrop(crop) : undefined, [crop?.slug]);
  const localDealers = useMemo(() => province ? getDealersInProvince(provinceSlug, 3) : [], [provinceSlug, province]);
  const projects = useMemo(() => (crop && province) ? getLocalProjects(cropSlug, provinceSlug, 3) : [], [cropSlug, provinceSlug, crop, province]);

  if (!crop || !province) return <Navigate to="/giai-phap-tuoi" replace />;

  const title = `Giải pháp tưới ${crop.name} tại ${province.name} | Nhà Bè Agri`;
  const description = `Hệ thống tưới ${crop.name.toLowerCase()} cho nông dân ${province.name}: tư vấn miễn phí, ${localDealers.length} đại lý gần bạn, dự án thực tế đã triển khai. ${crop.benefits[0]}.`;
  const canonical = `https://nhabeagri.com${buildSeoUrl(cropSlug, provinceSlug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Giải pháp tưới ${crop.name} tại ${province.name}`,
    description,
    provider: {
      '@type': 'Organization',
      name: 'Nhà Bè Agri',
      url: 'https://nhabeagri.com',
    },
    areaServed: { '@type': 'AdministrativeArea', name: province.name },
    serviceType: crop.irrigationType,
    offers: localDealers.map(d => ({
      '@type': 'Offer',
      seller: { '@type': 'LocalBusiness', name: d.name, telephone: d.phone, address: d.address },
    })),
  };

  return (
    <div className="min-h-screen">
      <SeoMeta title={title} description={description} canonical={canonical} jsonLd={jsonLd} />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container py-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Trang chủ</Link> ›{' '}
          <Link to="/giai-phap-tuoi" className="hover:text-foreground">Giải pháp tưới</Link> ›{' '}
          <Link to={`/giai-phap-tuoi/${crop.slug}`} className="hover:text-foreground">{crop.name}</Link> ›{' '}
          <span className="text-foreground font-medium">{province.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-10">
        <div className="container">
          <div className="max-w-3xl animate-slide-up">
            <Badge variant="outline" className="mb-3 gap-1.5 bg-background"><MapPin className="w-3 h-3" /> {province.region} · {province.name}</Badge>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
              Giải pháp tưới {crop.emoji} <span className="text-primary">{crop.name}</span><br />
              <span className="text-foreground">tại {province.name}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{crop.description}</p>
            <p className="mt-2 text-sm italic text-muted-foreground">📍 {province.climateNote}</p>

            <div className="mt-6 flex gap-3 flex-wrap">
              <Button size="lg" asChild className="bg-primary">
                <Link to="/cong-cu/tinh-toan-tuoi" onClick={() => trackEvent('category_click', { category: `seo_calc_${cropSlug}_${provinceSlug}`, source: 'seo_landing' })}>
                  <Calculator className="mr-2 w-4 h-4" /> Tính toán hệ thống miễn phí
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:1900636737" onClick={() => trackEvent('call_click', { source: 'seo_landing_hero' })}>
                  <Phone className="mr-2 w-4 h-4" /> 1900 636 737
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 space-y-10">

        {/* AI Rule Banner — only when active weather rule matches this province's region */}
        {(() => {
          const wb = getActiveWeatherBanner();
          if (wb && wb.region === province.region) return <AIRuleBanner />;
          return null;
        })()}

        {/* Commodity Price */}
        {price && (
          <section className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Giá {crop.name} hôm nay</div>
                <div className="font-display text-3xl font-bold">{price.currentPrice.toLocaleString('vi-VN')}</div>
                <div className="text-sm text-muted-foreground">{price.unit}</div>
                <div className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${price.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {price.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {price.change >= 0 ? '+' : ''}{price.change}%
                </div>
                <p className="text-xs text-muted-foreground mt-3">📈 Cập nhật từ thị trường {province.region} hôm nay</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-5">
                <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Vì sao đầu tư tưới cho {crop.name} tại {province.name}?
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {crop.benefits.map(b => (
                    <div key={b} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Kiểu tưới đề xuất:</span><br /><strong>{crop.irrigationType}</strong></div>
                  <div><span className="text-muted-foreground">Nhu cầu nước:</span><br /><strong>{crop.waterNeed}</strong></div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Local Dealers */}
        <section>
          <h2 className="font-display font-bold text-2xl mb-1 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" /> 3 đại lý gần bạn tại {province.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Liên hệ trực tiếp để nhận tư vấn và báo giá hệ thống tưới {crop.name.toLowerCase()}.</p>
          <div className="grid md:grid-cols-3 gap-3">
            {localDealers.map((d, i) => (
              <Card key={d.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{d.name}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        ⭐ {d.rating} · {d.totalOrders} đơn
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button size="sm" asChild className="bg-primary">
                      <a href={`tel:${d.phone}`} onClick={() => trackEvent('call_click', { dealerId: d.id, dealerName: d.name, source: 'seo_landing' })}>
                        <Phone className="w-3.5 h-3.5 mr-1" /> Gọi
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://zalo.me/${d.zalo}`} target="_blank" rel="noopener" onClick={() => trackEvent('zalo_click', { dealerId: d.id, dealerName: d.name, source: 'seo_landing' })}>
                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Zalo
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Local Projects */}
        <section>
          <h2 className="font-display font-bold text-2xl mb-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> Dự án thực tế tại {province.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Hình ảnh và phản hồi từ nông dân địa phương đã lắp đặt hệ thống tưới {crop.name.toLowerCase()}.</p>
          <div className="grid md:grid-cols-3 gap-3">
            {projects.map(p => (
              <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/15 to-secondary/40 flex items-center justify-center text-7xl">
                  {p.imageEmoji}
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] mb-2">{p.resultMetric}</Badge>
                  <h3 className="font-bold text-sm leading-snug">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Diện tích: {p.area} · Hoàn thành {p.completedAt}</p>
                  <p className="text-sm italic text-muted-foreground mt-2 leading-relaxed border-l-2 border-primary/30 pl-2">"{p.testimonial}"</p>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">📷 Đội thợ: <strong className="text-foreground">{p.installer}</strong></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-warning/5 rounded-2xl p-8 text-center">
          <Droplets className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl">Sẵn sàng đầu tư hệ thống tưới {crop.name}?</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Sử dụng máy tính ROI miễn phí — nhập diện tích vườn, hệ thống tự gợi ý gói tưới phù hợp nhất cho bạn tại {province.name}.
          </p>
          <Button size="lg" asChild className="mt-4 bg-primary">
            <Link to="/cong-cu/tinh-toan-tuoi"><Calculator className="mr-2 w-4 h-4" /> Tính toán miễn phí</Link>
          </Button>
        </section>

        {/* Internal links — SEO juice */}
        <section className="border-t pt-6">
          <h3 className="font-bold text-base mb-3">Giải pháp tưới khác tại {province.name}</h3>
          <div className="flex flex-wrap gap-2">
            {province.topCrops.filter(s => s !== crop.slug).map(s => {
              const c = getCrop(s);
              if (!c) return null;
              return (
                <Link key={s} to={buildSeoUrl(s, province.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                  {c.emoji} Tưới {c.name} tại {province.name} <ArrowRight className="w-3 h-3" />
                </Link>
              );
            })}
          </div>

          <h3 className="font-bold text-base mt-6 mb-3">Giải pháp tưới {crop.name} tại tỉnh khác</h3>
          <div className="flex flex-wrap gap-2">
            {PROVINCES.filter(p => p.slug !== province.slug && p.topCrops.includes(crop.slug)).slice(0, 8).map(p => (
              <Link key={p.slug} to={buildSeoUrl(crop.slug, p.slug)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                <MapPin className="w-3 h-3" /> {crop.name} tại {p.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
