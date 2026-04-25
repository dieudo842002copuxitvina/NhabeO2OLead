import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Sparkles, ArrowRight } from 'lucide-react';
import { ARTICLE_CATEGORIES, type CmsArticle } from '@/lib/cms';
import SeoMeta from '@/components/SeoMeta';

export default function LibraryPage() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from('cms_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (!cancelled) {
        setArticles((data ?? []) as CmsArticle[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (activeCat !== 'all' && a.category !== activeCat) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
          !(a.excerpt ?? '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [articles, activeCat, search]);

  const featured = filtered.find(a => a.featured) ?? filtered[0];
  const rest = featured ? filtered.filter(a => a.id !== featured.id) : filtered;

  return (
    <div className="min-h-screen bg-muted/20">
      <SeoMeta
        title="Thư viện kỹ thuật nông nghiệp — Hướng dẫn, mẹo, giải pháp tưới"
        description="Tổng hợp bài viết kỹ thuật, hướng dẫn lắp đặt, mẹo nhà nông và giải pháp tưới tiêu hiện đại từ chuyên gia AgriFlow."
        canonical="https://farm-supply-chain.lovable.app/thu-vien"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Thư viện</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Kiến thức nông nghiệp & kỹ thuật tưới
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Hướng dẫn chi tiết, mẹo thực chiến và giải pháp được kiểm chứng từ kỹ sư của AgriFlow.
          </p>

          <div className="relative max-w-xl mt-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết, mẹo, hướng dẫn..."
              className="pl-9 bg-background"
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="container py-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <Button
            variant={activeCat === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCat('all')}
          >
            Tất cả
          </Button>
          {ARTICLE_CATEGORIES.map(c => (
            <Button
              key={c.key}
              variant={activeCat === c.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCat(c.key)}
              className="whitespace-nowrap"
            >
              {c.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="container pb-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Chưa có bài viết</p>
            <p className="text-sm text-muted-foreground mt-1">Thử bộ lọc khác hoặc quay lại sau.</p>
          </Card>
        ) : (
          <>
            {/* Featured hero card */}
            {featured && (
              <Link to={`/thu-vien/${featured.slug}`} className="block mb-8 group">
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-video md:aspect-auto bg-muted relative">
                      {featured.cover_image ? (
                        <img src={featured.cover_image} alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary/60" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">⭐ Nổi bật</Badge>
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <Badge variant="secondary" className="self-start text-[10px] mb-3">{featured.category}</Badge>
                      <h2 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-muted-foreground mt-3 line-clamp-3">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-primary font-semibold mt-4">
                        Đọc bài viết <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map(a => (
                <Link key={a.id} to={`/thu-vien/${a.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {a.cover_image ? (
                        <img src={a.cover_image} alt={a.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 text-[10px]" variant="secondary">{a.category}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                      {a.published_at && (
                        <p className="text-[10px] text-muted-foreground mt-3">
                          {new Date(a.published_at).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
