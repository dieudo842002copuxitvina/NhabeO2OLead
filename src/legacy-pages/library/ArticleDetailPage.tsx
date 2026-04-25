import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calendar, Phone, MessageCircle, Package } from 'lucide-react';
import type { CmsArticle } from '@/lib/cms';
import type { PimProduct } from '@/lib/pim';
import { fetchProducts } from '@/lib/pim';
import SeoMeta from '@/components/SeoMeta';
import NotFound from '@/legacy-pages/NotFound';
import { trackEvent } from '@/lib/tracking';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<CmsArticle | null>(null);
  const [related, setRelated] = useState<PimProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('cms_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      const art = data as CmsArticle;
      setArticle(art);

      // Fetch related products
      if (art.related_product_ids?.length > 0) {
        try {
          const all = await fetchProducts();
          const matched = all.filter(p => art.related_product_ids.includes(p.id));
          if (!cancelled) setRelated(matched);
        } catch { /* noop */ }
      }
      setLoading(false);
      trackEvent('article_view', { slug: art.slug, title: art.title, category: art.category });
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) return <NotFound />;

  if (loading || !article) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-3" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SeoMeta
        title={`${article.title} — Thư viện AgriFlow`}
        description={article.excerpt ?? article.title}
        canonical={`https://farm-supply-chain.lovable.app/thu-vien/${article.slug}`}
      />

      <div className="container py-6">
        <Link to="/thu-vien" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Thư viện
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main */}
          <article>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="secondary">{article.category}</Badge>
              {article.tags.slice(0, 3).map(t => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
            {article.excerpt && (
              <p className="text-lg text-muted-foreground mt-3">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pb-6 border-b">
              {article.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.published_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {Math.ceil(article.body.length / 1500)} phút đọc
              </span>
            </div>

            {article.cover_image && (
              <img src={article.cover_image} alt={article.title}
                className="w-full rounded-lg my-6 aspect-video object-cover" />
            )}

            {/* Tiptap HTML body */}
            <div
              className="prose prose-stone max-w-none mt-6
                prose-headings:font-display prose-headings:text-foreground
                prose-p:text-foreground/90 prose-a:text-primary prose-img:rounded-lg
                prose-strong:text-foreground prose-li:marker:text-primary"
              dangerouslySetInnerHTML={{ __html: article.body || '<p class="text-muted-foreground">(Bài viết chưa có nội dung)</p>' }}
            />
          </article>

          {/* Sidebar — related products → O2O */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">
            {related.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-sm">Sản phẩm trong bài</h3>
                  </div>
                  <div className="space-y-3">
                    {related.map(p => (
                      <Link key={p.id} to={`/products/${p.slug}`}
                        onClick={() => trackEvent('article_product_click', { article_slug: article.slug, product_id: p.id })}
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
                  <Button asChild className="w-full mt-4" size="sm">
                    <Link to={`/products/${related[0].slug}`}>
                      <Phone className="w-4 h-4 mr-1" /> Tư vấn ngay
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Always-on CTA */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
              <CardContent className="p-5">
                <h3 className="font-display font-bold">Cần tư vấn kỹ thuật?</h3>
                <p className="text-xs opacity-90 mt-1">Gọi ngay đại lý gần nhất hoặc nhắn Zalo, miễn phí khảo sát.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button asChild variant="secondary" size="sm">
                    <a href="tel:1900xxxx" onClick={() => trackEvent('call_click', { source: 'article', slug: article.slug })}>
                      <Phone className="w-4 h-4 mr-1" /> Gọi
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                    <a href="https://zalo.me/" target="_blank" rel="noreferrer"
                      onClick={() => trackEvent('zalo_click', { source: 'article', slug: article.slug })}>
                      <MessageCircle className="w-4 h-4 mr-1" /> Zalo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
