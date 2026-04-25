"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, MapPin, ArrowRight, Sprout } from 'lucide-react';
import type { CmsCaseStudy } from '@/lib/cms';

/**
 * "Bằng chứng thép" — Social proof widget showcasing 3 featured case studies.
 * Falls back to most recent published case studies if no featured ones exist.
 */
export default function SteelProofWidget() {
  const [items, setItems] = useState<CmsCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Try featured first, then fallback
      const { data: featured } = await (supabase as any)
        .from('cms_case_studies')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);

      let result = (featured ?? []) as CmsCaseStudy[];
      if (result.length < 3) {
        const { data: more } = await (supabase as any)
          .from('cms_case_studies')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);
        const existing = new Set(result.map(x => x.id));
        for (const c of (more ?? []) as CmsCaseStudy[]) {
          if (result.length >= 3) break;
          if (!existing.has(c.id)) result.push(c);
        }
      }
      if (!cancelled) {
        setItems(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Bằng chứng thép
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">Dự án thực tế · Khách hàng thật · Kết quả đo được</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/case-studies" className="text-xs">Tất cả <ArrowRight className="ml-1 w-3 h-3" /></Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c, i) => (
            <Link key={c.id} href={`/case-studies/${c.slug}`} className="group animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt={c.title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                      <Sprout className="w-10 h-10 text-primary/50" />
                    </div>
                  )}
                  {c.featured && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px]">⭐</Badge>
                  )}
                  {c.area_ha && (
                    <Badge className="absolute bottom-2 left-2 bg-foreground/70 text-background text-[10px] backdrop-blur">
                      {c.area_ha} ha
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5 flex-wrap">
                    {c.customer_name && <span className="truncate">👤 {c.customer_name}</span>}
                    {c.province && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{c.province}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
