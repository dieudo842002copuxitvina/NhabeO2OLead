import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Sprout, User, Hammer, Phone, MessageCircle, Package, X } from 'lucide-react';
import type { CmsCaseStudy } from '@/lib/cms';
import type { PimProduct } from '@/lib/pim';
import { fetchProducts } from '@/lib/pim';
import SeoMeta from '@/components/SeoMeta';
import NotFound from '@/legacy-pages/NotFound';
import { trackEvent } from '@/lib/tracking';

export default function CaseStudyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cs, setCs] = useState<CmsCaseStudy | null>(null);
  const [related, setRelated] = useState<PimProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('cms_case_studies')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      const c = data as CmsCaseStudy;
      setCs(c);
      if (c.related_product_ids?.length > 0) {
        try {
          const all = await fetchProducts();
          const matched = all.filter(p => c.related_product_ids.includes(p.id));
          if (!cancelled) setRelated(matched);
        } catch { /* noop */ }
      }
      setLoading(false);
      trackEvent('case_study_view', { slug: c.slug, province: c.province, crop: c.crop });
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) return <NotFound />;

  if (loading || !cs) {
    return (
      <div className="container py-10 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SeoMeta
        title={`${cs.title} — Bằng chứng thép AgriFlow`}
        description={cs.summary ?? `Dự án tưới ${cs.crop ?? ''} tại ${cs.province ?? 'Việt Nam'}`}
        canonical={`https://farm-supply-chain.lovable.app/case-studies/${cs.slug}`}
      />

      <div className="container py-6">
        <Link to="/case-studies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Bằng chứng thép
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main */}
          <article>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {cs.featured && <Badge className="bg-accent text-accent-foreground">⭐ Nổi bật</Badge>}
              {cs.crop && <Badge variant="secondary">🌱 {cs.crop}</Badge>}
              {cs.province && <Badge variant="outline">{cs.province}</Badge>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{cs.title}</h1>
            {cs.summary && <p className="text-lg text-muted-foreground mt-3">{cs.summary}</p>}

            {/* Metadata strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pb-6 border-b">
              {cs.customer_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Khách hàng</div>
                    <div className="text-sm font-semibold">{cs.customer_name}</div>
                  </div>
                </div>
              )}
              {cs.province && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Địa điểm</div>
                    <div className="text-sm font-semibold">{[cs.district, cs.province].filter(Boolean).join(', ')}</div>
                  </div>
                </div>
              )}
              {cs.area_ha && (
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Quy mô</div>
                    <div className="text-sm font-semibold">{cs.area_ha} ha</div>
                  </div>
                </div>
              )}
              {cs.installer_name && (
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Đội thi công</div>
                    <div className="text-sm font-semibold">{cs.installer_name}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Cover */}
            {cs.cover_image && (
              <img src={cs.cover_image} alt={cs.title}
                className="w-full rounded-lg my-6 aspect-video object-cover cursor-pointer"
                onClick={() => setLightbox(cs.cover_image!)} />
            )}

            {/* Body */}
            <div
              className="prose prose-stone max-w-none mt-6
                prose-headings:font-display prose-headings:text-foreground
                prose-img:rounded-lg prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: cs.body || '<p class="text-muted-foreground">(Chưa có mô tả chi tiết)</p>' }}
            />

            {/* Gallery */}
            {cs.gallery && cs.gallery.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-bold mb-4">📷 Hình ảnh thi công</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cs.gallery.map((url, i) => (
                    <button key={i} onClick={() => setLightbox(url)}
                      className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity">
                      <img src={url} alt={`${cs.title} - ảnh ${i + 1}`} loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">
            {related.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-sm">Sản phẩm dự án này dùng</h3>
                  </div>
                  <div className="space-y-3">
                    {related.map(p => (
                      <Link key={p.id} to={`/products/${p.slug}`}
                        onClick={() => trackEvent('case_study_product_click', { case_slug: cs.slug, product_id: p.id })}
                        className="flex gap-3 p-2 -mx-2 rounded-md hover:bg-muted transition-colors group">
                        <div className="w-14 h-14 rounded bg-muted shrink-0 overflow-hidden">
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary">{p.name}</p>
                          <p className="text-xs text-primary font-bold mt-0.5">
                            {p.price > 0 ? `${p.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
              <CardContent className="p-5">
                <h3 className="font-display font-bold">Muốn dự án giống vậy?</h3>
                <p className="text-xs opacity-90 mt-1">Khảo sát miễn phí, báo giá trong 24h.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button asChild variant="secondary" size="sm">
                    <a href="tel:1900xxxx" onClick={() => trackEvent('call_click', { source: 'case_study', slug: cs.slug })}>
                      <Phone className="w-4 h-4 mr-1" /> Gọi
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                    <a href="https://zalo.me/" target="_blank" rel="noreferrer"
                      onClick={() => trackEvent('zalo_click', { source: 'case_study', slug: cs.slug })}>
                      <MessageCircle className="w-4 h-4 mr-1" /> Zalo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-background p-2 hover:bg-background/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
