"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, MapPin, Sprout, Wrench, GitCompare, Trophy, ArrowRight } from 'lucide-react';
import type { CmsArticle, CmsCaseStudy } from '@/lib/cms';

interface Props {
  productId: string;
  productName?: string;
  productCategory?: string;
  productCropTags?: string[];
}

type Bucket = 'install' | 'compare' | 'case' | 'general';

interface RankedArticle extends CmsArticle {
  bucket: Bucket;
  score: number;
  matchedSeasons: Season[];
}

/** Keyword sets used to classify article intent from title/excerpt/tags. */
const INSTALL_KEYWORDS = ['lắp đặt', 'lap dat', 'hướng dẫn', 'huong dan', 'cài đặt', 'install', 'thi công', 'thi cong'];
const COMPARE_KEYWORDS = ['so sánh', 'so sanh', 'vs ', ' vs', 'khác nhau', 'khac nhau', 'compare', 'nên chọn', 'nen chon'];

/** Vietnam agricultural seasons. Same Tay Nguyen / Nam Bo calendar used by farmers. */
type Season = 'dry' | 'rainy' | 'pre_dry' | 'pre_rainy';

const SEASON_KEYWORDS: Record<Season, string[]> = {
  // Active dry season — water shortage, high irrigation demand
  dry: ['mùa khô', 'mua kho', 'thiếu nước', 'thieu nuoc', 'hạn hán', 'han han', 'tiết kiệm nước', 'tiet kiem nuoc', 'tưới tiết kiệm'],
  // Active rainy season — flooding, drainage, fungal pressure
  rainy: ['mùa mưa', 'mua mua', 'ngập úng', 'ngap ung', 'thoát nước', 'thoat nuoc', 'thối rễ', 'thoi re'],
  // Transition — preparing for dry season (Oct–Nov)
  pre_dry: ['chuẩn bị mùa khô', 'chuan bi mua kho', 'trước mùa khô', 'truoc mua kho', 'sắp vào mùa khô', 'sap vao mua kho', 'đầu mùa khô', 'dau mua kho'],
  // Transition — preparing for rainy season (Apr–May)
  pre_rainy: ['chuẩn bị mùa mưa', 'chuan bi mua mua', 'trước mùa mưa', 'truoc mua mua', 'đầu mùa mưa', 'dau mua mua'],
};

const SEASON_LABEL: Record<Season, string> = {
  dry: 'Mùa khô',
  rainy: 'Mùa mưa',
  pre_dry: 'Sắp vào mùa khô',
  pre_rainy: 'Sắp vào mùa mưa',
};

/**
 * Detect the current Vietnam agricultural season from the system clock.
 * Calendar (Central Highlands / South):
 *   Dec–Mar: dry • Apr: pre_rainy • May–Sep: rainy • Oct–Nov: pre_dry
 */
function getCurrentSeason(now: Date = new Date()): Season {
  const m = now.getMonth() + 1; // 1..12
  if (m >= 12 || m <= 3) return 'dry';
  if (m === 4) return 'pre_rainy';
  if (m >= 5 && m <= 9) return 'rainy';
  return 'pre_dry'; // Oct, Nov
}

/** Detect which season(s) an article targets, scanning title/excerpt/tags. */
function detectArticleSeasons(a: CmsArticle): Season[] {
  const hay = `${a.title} ${a.excerpt ?? ''} ${(a.tags ?? []).join(' ')}`.toLowerCase();
  const found: Season[] = [];
  (Object.keys(SEASON_KEYWORDS) as Season[]).forEach(s => {
    if (SEASON_KEYWORDS[s].some(k => hay.includes(k))) found.push(s);
  });
  return found;
}

function detectBucket(a: CmsArticle): Bucket {
  const hay = `${a.title} ${a.excerpt ?? ''} ${a.tags.join(' ')}`.toLowerCase();
  if (INSTALL_KEYWORDS.some(k => hay.includes(k))) return 'install';
  if (COMPARE_KEYWORDS.some(k => hay.includes(k))) return 'compare';
  return 'general';
}

function tagOverlap(a: string[], b: string[]): number {
  if (!a?.length || !b?.length) return 0;
  const set = new Set(a);
  return b.filter(x => set.has(x)).length;
}

/**
 * Compute a relevance score given the current product context + current season.
 * Season boost design:
 *   +25 if article matches the *current* active season (dry/rainy)
 *   +30 if article matches the *upcoming* transition season (pre_dry/pre_rainy)
 *       — slightly higher because farmers act on prep guides before the season hits
 *   +10 if article matches the *adjacent* season (e.g. dry article during pre_dry)
 */
function scoreArticle(
  a: CmsArticle,
  productId: string,
  productCropTags: string[],
  nameKeywords: string[],
  currentSeason: Season,
): number {
  let s = 0;
  if (a.related_product_ids?.includes(productId)) s += 100;
  s += tagOverlap(a.crop_tags ?? [], productCropTags) * 10;
  const hay = `${a.title} ${a.excerpt ?? ''}`.toLowerCase();
  for (const kw of nameKeywords) if (hay.includes(kw)) s += 5;
  if (a.featured) s += 2;

  // Seasonal boost
  const seasons = detectArticleSeasons(a);
  if (seasons.length) {
    if (seasons.includes(currentSeason)) {
      s += currentSeason === 'pre_dry' || currentSeason === 'pre_rainy' ? 30 : 25;
    } else if (
      // Adjacent season relevance (e.g. "dry season tips" still useful during pre_dry prep)
      (currentSeason === 'pre_dry' && seasons.includes('dry')) ||
      (currentSeason === 'pre_rainy' && seasons.includes('rainy')) ||
      (currentSeason === 'dry' && seasons.includes('pre_dry')) ||
      (currentSeason === 'rainy' && seasons.includes('pre_rainy'))
    ) {
      s += 10;
    }
  }
  return s;
}

const BUCKET_META: Record<Bucket, { label: string; cta: string; Icon: typeof Wrench; tone: string }> = {
  install: { label: 'Hướng dẫn lắp đặt', cta: 'Xem từng bước lắp đặt', Icon: Wrench, tone: 'bg-primary/10 text-primary' },
  compare: { label: 'So sánh sản phẩm', cta: 'Đối chiếu chi tiết', Icon: GitCompare, tone: 'bg-accent/15 text-accent-foreground' },
  case: { label: 'Câu chuyện thực tế', cta: 'Đọc kết quả thực tế', Icon: Trophy, tone: 'bg-success/10 text-success' },
  general: { label: 'Bài viết liên quan', cta: 'Đọc thêm', Icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
};

export default function RelatedContent({ productId, productName = '', productCategory = '', productCropTags = [] }: Props) {
  const [articles, setArticles] = useState<RankedArticle[]>([]);
  const [cases, setCases] = useState<CmsCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);

      // Build keyword set from product name & category for fallback matching
      const nameKeywords = [
        ...productName.toLowerCase().split(/\s+/).filter(w => w.length >= 4),
        ...productCategory.toLowerCase().split(/\s+/).filter(w => w.length >= 4),
      ].slice(0, 6);

      try {
        const [artRes, csRes] = await Promise.all([
          // Pull a wider pool then rank client-side. Limit kept tight to avoid payload bloat.
          (supabase as any)
            .from('cms_articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(60),
          (supabase as any)
            .from('cms_case_studies')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20),
        ]);
        if (cancelled) return;

        const currentSeason = getCurrentSeason();
        const allArticles = (artRes.data ?? []) as CmsArticle[];
        const ranked: RankedArticle[] = allArticles
          .map(a => ({
            ...a,
            bucket: detectBucket(a),
            matchedSeasons: detectArticleSeasons(a),
            score: scoreArticle(a, productId, productCropTags, nameKeywords, currentSeason),
          }))
          .filter(a => a.score > 0);

        // Pick best in each priority bucket: install → compare → general
        const pickByBucket = (b: Bucket) =>
          ranked.filter(a => a.bucket === b).sort((x, y) => y.score - x.score)[0];

        const top: RankedArticle[] = [];
        const install = pickByBucket('install');
        if (install) top.push(install);
        const compare = pickByBucket('compare');
        if (compare) top.push(compare);
        // Fill remaining slots with highest-scoring leftover articles
        const used = new Set(top.map(a => a.id));
        const fillers = ranked.filter(a => !used.has(a.id)).sort((x, y) => y.score - x.score);
        while (top.length < 3 && fillers.length) top.push(fillers.shift()!);

        setArticles(top);

        // Filter case studies by crop overlap or related_product_ids
        const allCases = (csRes.data ?? []) as CmsCaseStudy[];
        const matchedCases = allCases
          .filter(c =>
            c.related_product_ids?.includes(productId) ||
            (c.crop && productCropTags.some(t => c.crop?.toLowerCase().includes(t.toLowerCase()))) ||
            allCases.length <= 3, // if very few cases, show them all as inspiration
          )
          .slice(0, 3);
        setCases(matchedCases);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [productId, productName, productCategory, productCropTags]);

  if (loading) {
    return (
      <div className="mt-12 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (articles.length === 0 && cases.length === 0) return null;

  return (
    <div className="mt-12 space-y-10">
      {articles.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Kiến thức cho sản phẩm này</h2>
            <Badge variant="secondary" className="text-[10px]">{articles.length} bài</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => {
              const meta = BUCKET_META[a.bucket];
              const Icon = meta.Icon;
              return (
                <Link key={a.id} href={`/thu-vien/${a.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {a.cover_image ? (
                        <img src={a.cover_image} alt={a.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                          <Icon className="w-10 h-10 text-primary/50" />
                        </div>
                      )}
                      <Badge className={`absolute top-2 left-2 text-[10px] gap-1 ${meta.tone} border-0`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </Badge>
                      {a.matchedSeasons.length > 0 && (
                        <Badge className="absolute top-2 right-2 text-[10px] gap-1 bg-warning/90 text-warning-foreground border-0">
                          ☀️ {SEASON_LABEL[a.matchedSeasons[0]]}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        {meta.cta}
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {cases.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold">Khách hàng đã dùng</h2>
            <Badge variant="secondary" className="text-[10px]">Bằng chứng thực tế</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => (
              <Link key={c.id} href={`/case-studies/${c.slug}`} className="group">
                <Card className="h-full overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {c.cover_image ? (
                      <img src={c.cover_image} alt={c.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/30 flex items-center justify-center">
                        <Sprout className="w-10 h-10 text-primary/50" />
                      </div>
                    )}
                    {c.featured && (
                      <Badge className="absolute top-2 right-2 text-[10px] bg-accent text-accent-foreground">⭐ Nổi bật</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary">
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
                      {c.area_ha && <span>{c.area_ha} ha</span>}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      Đọc câu chuyện đầy đủ
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
