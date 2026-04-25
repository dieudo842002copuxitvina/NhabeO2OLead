import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, DatabaseZap, RadioTower, ShieldCheck, TrendingUp } from "lucide-react";
import { CategoryTabs } from "./_components/CategoryTabs";
import { FilterBar } from "./_components/FilterBar";
import { PriceTable } from "./_components/PriceTable";
import { PriceTicker } from "./_components/PriceTicker";
import { getPriceSnapshot, getTopMovers } from "./_lib/queries";
import { parsePriceFilters } from "./_lib/schemas";

export const revalidate = 60;

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parsePriceFilters(searchParams);
  const topMovers = await getTopMovers(1);
  const headline = topMovers[0];

  return {
    title:
      filters.cat === "all"
        ? `Giá nông sản hôm nay | ${headline?.cropLabel ?? "Bảng giá live"} ${headline?.priceVnd?.toLocaleString("vi-VN")}đ`
        : `Giá ${filters.cat} hôm nay | Nhà Bè Agri`,
    description:
      "Bảng giá nông sản SSR trên Next.js App Router, có SEO metadata, SSE realtime, cache nhiều tầng và HTML indexable.",
    alternates: {
      canonical: "/gia-nong-san",
    },
    openGraph: {
      title: "Giá nông sản hôm nay",
      description: "Bảng giá nông sản realtime, render trực tiếp từ server.",
      images: ["/gia-nong-san/opengraph-image"],
    },
  };
}

export default async function GiaNongSanPage({ searchParams }: Props) {
  const filters = parsePriceFilters(searchParams);
  const snapshot = await getPriceSnapshot(filters);
  const qs = new URLSearchParams();

  if (filters.cat !== "all") qs.set("cat", filters.cat);
  if (filters.region) qs.set("region", filters.region);
  if (filters.sort !== "change") qs.set("sort", filters.sort);
  if (filters.q) qs.set("q", filters.q);

  const feedUrl = `/api/prices/stream${qs.toString() ? `?${qs.toString()}` : ""}`;
  const jsonLd = buildJsonLd(snapshot.items);

  return (
    <div className="min-h-screen bg-[#07111a] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_24%),linear-gradient(180deg,_rgba(7,17,26,0.94),_#07111a)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:px-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            <RadioTower className="h-3.5 w-3.5" />
            SSR + ISR + SSE
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
                Giá nông sản live
                <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  render ngay trong HTML
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Trang này được tái kiến trúc theo hướng server-first cho Next.js App Router: bảng giá SSR/ISR, cập nhật qua SSE,
                cache nhiều tầng và metadata tối ưu cho SEO.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/api/prices"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  JSON feed
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dai-ly"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Tìm đại lý gần vùng giá cao
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <MetricCard
                icon={Clock3}
                label="Lần cập nhật"
                value={new Date(snapshot.lastUpdatedAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
                tone="emerald"
              />
              <MetricCard icon={TrendingUp} label="Mặt hàng live" value={`${snapshot.totalItems}`} tone="cyan" />
              <MetricCard icon={DatabaseZap} label="Cache strategy" value="Hot cache + ISR + CDN" tone="amber" />
            </div>
          </div>

          <PriceTicker initialItems={snapshot.topMovers} feedUrl={feedUrl} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 lg:px-6">
        <CategoryTabs current={filters.cat} categories={snapshot.categories} />
        <FilterBar
          currentRegion={filters.region}
          currentSort={filters.sort}
          initialQuery={filters.q}
          regions={snapshot.regions}
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Market Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {snapshot.totalItems} dòng giá hiển thị sẵn trong HTML
                </h2>
              </div>
              <p className="max-w-sm text-right text-sm text-slate-400">
                Googlebot và người dùng đều thấy cùng một bảng giá ngay từ response đầu tiên.
              </p>
            </div>
            <PriceTable items={snapshot.items} feedUrl={feedUrl} />
          </div>

          <div className="space-y-4">
            <AsideCard
              eyebrow="Top movers"
              title="Biến động mạnh nhất"
              body="Phần này lấy cùng snapshot server với bảng giá chính để tránh waterfall request."
            >
              <div className="space-y-3">
                {snapshot.topMovers.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{item.cropLabel}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {item.province} • {item.source ?? "Nguồn tổng hợp"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{item.priceVnd.toLocaleString("vi-VN")}đ</div>
                        <div className={(item.changePct ?? 0) >= 0 ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>
                          {(item.changePct ?? 0) >= 0 ? "+" : ""}
                          {(item.changePct ?? 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AsideCard>

            <AsideCard
              eyebrow="SEO payload"
              title="Metadata và structured data"
              body="Title, description, OG image và Product/Offer JSON-LD đều được sinh phía server từ cùng data source."
            >
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Canonical: `/gia-nong-san`</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">OG image: top 5 biến động hôm nay</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">JSON-LD: danh sách sản phẩm và offer theo vùng</div>
              </div>
            </AsideCard>

            <AsideCard
              eyebrow="Reliability"
              title="Cache nhiều tầng"
              body="Hot cache 30 giây trên server process, `unstable_cache` 60 giây theo tag, và API header cho CDN cache."
            >
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Webhook `/api/revalidate` có thể gọi `revalidateTag('prices')` khi pipeline ingest ghi giá mới.
              </div>
            </AsideCard>

            <AsideCard
              eyebrow="Realtime"
              title="SSE thay đổi từng hàng"
              body="Client chỉ patch lại row nhận được update thay vì re-render toàn bảng, giữ hydration nhẹ và ổn định."
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                EventSource `/api/prices/stream`
              </div>
            </AsideCard>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  tone: "emerald" | "cyan" | "amber";
}) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "cyan"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      : "border-amber-400/20 bg-amber-400/10 text-amber-100";

  return (
    <div className={`rounded-[2rem] border p-5 ${toneClasses}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-75">{label}</p>
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function AsideCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function buildJsonLd(
  items: Awaited<ReturnType<typeof getPriceSnapshot>>["items"]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bảng giá nông sản hôm nay",
    itemListElement: items.slice(0, 12).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `${item.cropLabel} ${item.province}`,
        category: item.category,
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: item.priceVnd,
          availability: "https://schema.org/InStock",
          url: "https://nhabeagri.vn/gia-nong-san",
          seller: {
            "@type": "Organization",
            name: item.source ?? "Nhà Bè Agri",
          },
        },
      },
    })),
  };
}
