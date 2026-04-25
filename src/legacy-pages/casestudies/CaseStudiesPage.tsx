import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprout, MapPin, Search, Award, ArrowRight } from 'lucide-react';
import type { CmsCaseStudy } from '@/lib/cms';
import SeoMeta from '@/components/SeoMeta';

export default function CaseStudiesPage() {
  const [items, setItems] = useState<CmsCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCrop, setActiveCrop] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from('cms_case_studies')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (!cancelled) {
        setItems((data ?? []) as CmsCaseStudy[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const crops = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.crop) set.add(i.crop); });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(c => {
      if (activeCrop !== 'all' && c.crop !== activeCrop) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) &&
            !(c.customer_name ?? '').toLowerCase().includes(q) &&
            !(c.province ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCrop, search]);

  return (
    <div className="min-h-screen bg-muted/20">
      <SeoMeta
        title="Bằng chứng thép — Khách hàng đã sử dụng AgriFlow"
        description="Hơn 500 dự án tưới thực tế tại Việt Nam: ảnh thi công, sản lượng tăng, tiết kiệm nước. Bằng chứng thép từ nông dân thật."
        canonical="https://farm-supply-chain.lovable.app/case-studies"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/15 via-primary/5 to-transparent border-b">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Bằng chứng thép</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Khách hàng thật, dự án thật, kết quả thật
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Tổng hợp các dự án tưới tiêu thi công thực tế tại trang trại Việt Nam — kèm hình ảnh, sản lượng và chia sẻ từ chính nông dân.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 max-w-md">
            <div>
              <div className="font-display text-2xl font-bold text-primary">{items.length}+</div>
              <div className="text-xs text-muted-foreground">Dự án</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-primary">
                {items.reduce((s, c) => s + (c.area_ha ?? 0), 0).toFixed(0)}+
              </div>
              <div className="text-xs text-muted-foreground">Hecta</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-primary">{crops.length}+</div>
              <div className="text-xs text-muted-foreground">Loại cây</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container py-5 space-y-3">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo khách, tỉnh, dự án..." className="pl-9 bg-background" />
        </div>
        {crops.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant={activeCrop === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCrop('all')}>
              Tất cả
            </Button>
            {crops.map(c => (
              <Button key={c} variant={activeCrop === c ? 'default' : 'outline'} size="sm"
                onClick={() => setActiveCrop(c)} className="whitespace-nowrap">
                🌱 {c}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="container pb-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Sprout className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Chưa có dự án phù hợp</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <Link key={c.id} to={`/case-studies/${c.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {c.cover_image ? (
                      <img src={c.cover_image} alt={c.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                        <Sprout className="w-12 h-12 text-primary/50" />
                      </div>
                    )}
                    {c.featured && (
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px]">⭐ Nổi bật</Badge>
                    )}
                    {c.gallery && c.gallery.length > 0 && (
                      <Badge className="absolute bottom-2 right-2 bg-foreground/70 text-background text-[10px] backdrop-blur">
                        📷 {c.gallery.length} ảnh
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap">
                      {c.customer_name && <span>👤 {c.customer_name}</span>}
                      {c.province && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{c.province}
                        </span>
                      )}
                      {c.crop && <span>🌱 {c.crop}</span>}
                      {c.area_ha && <span className="font-semibold text-primary">{c.area_ha} ha</span>}
                    </div>
                    {c.summary && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{c.summary}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-3">
                      Xem chi tiết <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
