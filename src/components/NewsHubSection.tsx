"use client";

import Link from 'next/link';
import { TrendingUp, TrendingDown, BookOpen, Camera, ArrowRight, Newspaper, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { commodityPrices, newsArticles } from '@/data/mock';
import { trackEvent } from '@/lib/tracking';

interface FieldPhoto {
  id: string;
  emoji: string;
  gradient: string;
  title: string;
  location: string;
  region: string; // hashtag without #
  daysAgo: number;
}

const FIELD_PHOTOS: FieldPhoto[] = [
  {
    id: 'fp-1',
    emoji: '🌳',
    gradient: 'from-emerald-500/40 via-primary/30 to-amber-400/20',
    title: 'Vừa nghiệm thu 3.5ha sầu riêng',
    location: 'Cư M\'gar, Đắk Lắk',
    region: 'DakLak',
    daysAgo: 1,
  },
  {
    id: 'fp-2',
    emoji: '☕',
    gradient: 'from-amber-700/40 via-orange-500/30 to-primary/20',
    title: 'Lắp tưới phun mưa 2ha cà phê',
    location: 'Bảo Lộc, Lâm Đồng',
    region: 'LamDong',
    daysAgo: 2,
  },
  {
    id: 'fp-3',
    emoji: '🥭',
    gradient: 'from-yellow-400/40 via-orange-400/25 to-primary/20',
    title: 'Bộ điều khiển AC-8 cho vườn xoài',
    location: 'Cao Lãnh, Đồng Tháp',
    region: 'DongThap',
    daysAgo: 3,
  },
  {
    id: 'fp-4',
    emoji: '🌶️',
    gradient: 'from-red-500/35 via-orange-400/25 to-primary/15',
    title: 'Cảm biến IoT cho vườn tiêu',
    location: 'Chư Sê, Gia Lai',
    region: 'GiaLai',
    daysAgo: 4,
  },
];

// Region tag mapping for market & technical articles
const PROVINCE_TAGS = ['DakLak', 'LamDong', 'GiaLai', 'DongNai', 'BinhPhuoc', 'TienGiang'];

/**
 * NewsHubSection — "Kiến thức nhà rẫy & Thị trường".
 * 3 cols: Tin vắn giá / Kỹ thuật / Thực địa (field photo feed).
 */
export default function NewsHubSection() {
  const technicalArticles = newsArticles
    .filter((a) => /kỹ thuật|hướng dẫn|chăm sóc|mẹo/i.test(a.category) || a.category === 'Kỹ thuật')
    .slice(0, 1);
  const featured =
    technicalArticles[0] ?? newsArticles[0] ?? {
      id: 'tech-default',
      title: 'Cách tự lắp hệ thống tưới tiết kiệm cho rẫy 1ha',
      summary:
        'Hướng dẫn chi tiết từ chọn bơm, ống, béc đến đi đường ống — chi phí tham khảo dưới 25 triệu/ha.',
      category: 'Kỹ thuật',
    } as { id: string; title: string; summary: string; category: string };

  return (
    <section
      aria-labelledby="news-hub-heading"
      className="container py-8 md:py-10"
    >
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5" /> Trung tâm tri thức
          </p>
          <h2
            id="news-hub-heading"
            className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight"
          >
            Kiến thức nhà rẫy & Thị trường
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Giá nông sản · Mẹo kỹ thuật · Hình ảnh thực địa từ các vùng trọng điểm.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
          <Link href="/tin-tuc">
            Xem tất cả <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* COL 1 — Tin vắn giá nông sản hôm nay */}
        <section aria-labelledby="market-col-heading">
          <Card className="h-full hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <h3
                id="market-col-heading"
                className="font-display font-bold text-base flex items-center gap-2 mb-1"
              >
                <TrendingUp className="w-4 h-4 text-primary" /> Tin vắn — Giá hôm nay
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                Cập nhật theo vùng trọng điểm
              </p>

              <ul className="divide-y divide-border/60">
                {commodityPrices.slice(0, 6).map((c, i) => {
                  const up = c.change >= 0;
                  const region = PROVINCE_TAGS[i % PROVINCE_TAGS.length];
                  return (
                    <li key={c.name}>
                      <Link
                        href="/thi-truong"
                        className="flex items-center justify-between gap-2 py-2.5 group hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                            {c.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {c.currentPrice.toLocaleString('vi-VN')} {c.unit}
                            </p>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              #{region}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-0.5 text-xs font-bold shrink-0 ${
                            up ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {up ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {up ? '+' : ''}
                          {c.change}%
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Button variant="outline" size="sm" asChild className="w-full mt-3">
                <Link href="/thi-truong">Xem chi tiết giá</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* COL 2 — Bài viết kỹ thuật featured */}
        <section aria-labelledby="tech-col-heading">
          <Card className="h-full overflow-hidden hover:border-primary/40 transition-colors">
            <Link
              href="/thu-vien"
              onClick={() => trackEvent('article_view', { source: 'news_hub_tech' })}
              className="block group"
            >
              <div
                aria-hidden
                className="aspect-[16/10] bg-gradient-to-br from-primary/30 via-info/15 to-accent/20 flex items-center justify-center text-7xl relative"
              >
                🛠️
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px] font-bold">
                  KỸ THUẬT
                </Badge>
                <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] backdrop-blur bg-background/80">
                  #DakLak · #LamDong
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3
                  id="tech-col-heading"
                  className="font-display font-bold text-base flex items-center gap-2 mb-2"
                >
                  <BookOpen className="w-4 h-4 text-info" /> Mẹo cho nhà rẫy
                </h3>
                <article>
                  <h4 className="font-display font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    Cách tự lắp hệ thống tưới tiết kiệm cho rẫy 1ha
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    Hướng dẫn chọn bơm, đường ống, béc tưới và sơ đồ đi đường — chi phí tham khảo
                    dưới 25 triệu/ha cho cây cà phê và sầu riêng.
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">5 phút đọc</Badge>
                    <Badge variant="outline" className="text-[10px]">Tự lắp đặt</Badge>
                  </div>
                </article>
              </CardContent>
            </Link>
            <div className="px-4 pb-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/thu-vien">Thư viện kỹ thuật <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* COL 3 — Thực địa: feed ảnh dự án vừa hoàn thành */}
        <section aria-labelledby="field-col-heading">
          <Card className="h-full hover:border-primary/40 transition-colors">
            <CardContent className="p-4">
              <h3
                id="field-col-heading"
                className="font-display font-bold text-base flex items-center gap-2 mb-1"
              >
                <Camera className="w-4 h-4 text-accent" /> Thực địa — Vừa hoàn thành
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                Ảnh dự án từ thợ kỹ thuật khắp các vùng
              </p>

              <div className="grid grid-cols-2 gap-2">
                {FIELD_PHOTOS.map((p) => (
                  <Link
                    key={p.id}
                    href="/case-studies"
                    onClick={() => trackEvent('case_study_view', { source: 'news_hub_field' })}
                    className="group block"
                  >
                    <div
                      className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${p.gradient} flex items-center justify-center text-4xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all`}
                      aria-label={p.title}
                    >
                      <span className="drop-shadow">{p.emoji}</span>
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-primary bg-background/85 backdrop-blur px-1.5 py-0.5 rounded-full">
                        #{p.region}
                      </span>
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-medium text-foreground bg-background/85 backdrop-blur px-1.5 py-0.5 rounded-full">
                        {p.daysAgo}d
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {p.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Button variant="outline" size="sm" asChild className="w-full mt-3">
                <Link href="/case-studies">Xem tất cả dự án <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </section>
  );
}
