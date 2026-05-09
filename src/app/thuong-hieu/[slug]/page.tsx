import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Globe,
  MapPin,
  ChevronRight,
  Package,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBrandBySlug } from "@/lib/brands";

// ─── Visual Defaults ───────────────────────────────────────────────────────────
// Hardcoded CSS for brands not yet in DB — color/gradient can't come from DB.

const ORIGIN_COLORS: Record<string, string> = {
  Israel:      "from-yellow-400 to-amber-400",
  Turkey:       "from-red-500 to-red-600",
  Spain:        "from-yellow-600 to-red-500",
  Australia:    "from-blue-400 to-yellow-400",
  Vietnam:      "from-red-500 to-yellow-500",
  "Việt Nam":   "from-red-500 to-yellow-500",
  Taiwan:       "from-blue-500 to-red-500",
  USA:          "from-blue-600 to-red-500",
};

const ORIGIN_FLAGS: Record<string, string> = {
  Israel:    "🇮🇱",
  Turkey:    "🇹🇷",
  Spain:     "🇪🇸",
  Australia: "🇦🇺",
  Vietnam:   "🇻🇳",
  "Việt Nam": "🇻🇳",
  Taiwan:    "🇹🇼",
  USA:       "🇺🇸",
};

const DEFAULT_HIGHLIGHTS = [
  "Công nghệ hàng đầu thế giới",
  "Bảo hành chính hãng",
  "Được phân phối tại Nhà Bè Agri",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).toLowerCase();
  } catch {
    return slug.toLowerCase();
  }
}

type Props = { params: { slug: string } };

function getSpecValue(specs: unknown, keys: string[]): string {
  if (!specs || typeof specs !== "object") return "";
  const obj = specs as Record<string, unknown>;
  for (const k of keys) {
    const v = obj[k];
    if (v != null) return String(v);
  }
  return "";
}

function groupByCategory<T extends { categories?: { name: string } }>(items: T[]) {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const cat = item.categories?.name ?? "Sản phẩm";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return groups;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeSlug(params.slug);
  const brand = await getBrandBySlug(slug).catch(() => null);

  if (!brand) return { title: "Thương hiệu" };

  const description = brand.description ?? `${brand.name} — thương hiệu thiết bị tưới chính hãng tại Nhà Bè Agri.`;
  const logoUrl = brand.logo_url ?? "/images/brands/placeholder.png";

  return {
    title: `${brand.name} | Nhà Bè Agri`,
    description: description.substring(0, 160),
    alternates: { canonical: `/thuong-hieu/${slug}` },
    openGraph: {
      title: brand.name,
      description: description.substring(0, 120),
      images: [{ url: logoUrl, alt: brand.name }],
    },
  };
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { getAllBrands } = await import("@/lib/brands");
  const brands = await getAllBrands().catch(() => []);
  return brands.map((b) => ({ slug: b.slug }));
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function BrandPage({ params }: Props) {
  const slug = normalizeSlug(params.slug);

  // Single query: brand + its active products
  const brand = await getBrandBySlug(slug).catch(() => null);

  if (!brand) notFound();

  const products = (brand as unknown as { products?: unknown[] }).products ?? [];
  const dbProducts = products as Array<{
    id: string;
    slug: string;
    name: string;
    image_url: string | null;
    base_price: number | null;
    specifications: unknown;
    categories?: { name: string };
  }>;

  const groupedProducts = groupByCategory(dbProducts);

  const origin = brand.origin_country ?? "";
  const originGradient = ORIGIN_COLORS[origin] || "from-slate-400 to-slate-500";
  const originFlag = ORIGIN_FLAGS[origin] ?? "🌍";

  const brandFeatures = brand.description
    ? null
    : null;

  // Extract highlights from brand.features JSON if available
  let highlights: string[] | null = null;
  try {
    const feat = (brand as unknown as { features?: string }).features;
    if (feat) highlights = JSON.parse(feat) as string[];
  } catch { /* no highlights in DB */ }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/thuong-hieu" className="hover:text-emerald-600 transition-colors">Thương hiệu</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-slate-900">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Brand Hero ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left: info */}
            <div className="flex-1">
              {/* Origin + Website */}
              <div className="flex items-center gap-3 mb-4">
                {origin && (
                  <Badge className={cn("text-sm px-4 py-1.5 font-bold bg-gradient-to-r text-white", originGradient)}>
                    {originFlag} {origin}
                  </Badge>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {brand.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {brand.name}
              </h1>

              {/* Description */}
              {brand.description && (
                <p className="text-base text-slate-700 leading-relaxed mb-6 max-w-3xl">
                  {brand.description}
                </p>
              )}

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/dai-ly">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 h-12 px-8">
                    <MapPin className="w-5 h-5 mr-2" />
                    Tìm đại lý phân phối
                  </Button>
                </Link>
                <Link href="/tinh-toan">
                  <Button size="lg" variant="outline" className="h-12 px-6 border-2 font-semibold">
                    <Package className="w-5 h-5 mr-2" />
                    Tính vật tư
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Specs card */}
            <div className="w-full lg:w-80 shrink-0">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Thông tin thương hiệu</h3>
                  <div className="space-y-3">
                    {origin && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm text-slate-500">Xuất xứ</span>
                        <span className="text-sm font-semibold text-slate-900 text-right">{originFlag} {origin}</span>
                      </div>
                    )}
                    {brand.website && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm text-slate-500">Website</span>
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-emerald-600 hover:underline text-right"
                        >
                          {brand.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-500">Sản phẩm</span>
                      <span className="text-sm font-semibold text-slate-900">{dbProducts.length}</span>
                    </div>
                  </div>

                  {origin && (
                    <div className="pt-4 border-t border-slate-100">
                      <div className={cn("rounded-xl p-4 bg-gradient-to-br text-white", originGradient)}>
                        <div className="text-3xl mb-1">{originFlag}</div>
                        <div className="text-sm font-bold">{origin}</div>
                        <div className="text-xs text-white/80 mt-0.5">Xuất xứ chính hãng</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      {dbProducts.length > 0 ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Sản phẩm {brand.name}
                </h2>
                <p className="text-sm text-slate-500">{dbProducts.length} sản phẩm</p>
              </div>
            </div>

            {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
              <div key={categoryName} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-lg font-bold text-slate-800">{categoryName}</h3>
                  <Badge variant="outline" className="text-xs">{categoryProducts.length} sản phẩm</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {categoryProducts.map((product) => {
                    const specs = product.specifications as Record<string, unknown> | null;
                    const flowRate = getSpecValue(specs, ["flow_rate", "flow_rate_lh", "luu_luong"]);
                    const pressure = getSpecValue(specs, ["working_pressure", "pressure", "ap_suat"]);

                    return (
                      <Link key={product.id} href={`/san-pham/${product.slug}`}>
                        <Card className="h-full overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                <Package className="w-12 h-12 text-emerald-200" />
                              </div>
                            )}
                            {flowRate && (
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                  🔥 Bán chạy
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <CardContent className="p-3 md:p-4">
                            <span className="inline-block px-2 py-0.5 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 rounded-md">
                              {product.categories?.name ?? categoryName}
                            </span>
                            <h4 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {product.name}
                            </h4>
                            {(flowRate || pressure) && (
                              <div className="space-y-0.5 mb-3">
                                {flowRate && (
                                  <p className="text-[11px] text-slate-500">
                                    Lưu lượng: <span className="font-medium text-slate-700">{flowRate}</span>
                                  </p>
                                )}
                                {pressure && (
                                  <p className="text-[11px] text-slate-500">
                                    Áp suất: <span className="font-medium text-slate-700">{pressure}</span>
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="text-sm font-bold text-emerald-600">
                              {product.base_price && product.base_price > 0
                                ? `${new Intl.NumberFormat("vi-VN").format(product.base_price)}đ`
                                : "Liên hệ báo giá"}
                              {product.base_price && product.base_price > 0 && (
                                <span className="text-xs font-normal text-muted-foreground ml-1">/sản phẩm</span>
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2 font-medium">
                Sản phẩm {brand.name} đang được cập nhật vào hệ thống.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Dữ liệu sẽ được đồng bộ trong phiên scrape tiếp theo.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/thuong-hieu">
                  <Button variant="outline">Xem tất cả thương hiệu</Button>
                </Link>
                <Link href="/dai-ly">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold">
                    <MapPin className="w-4 h-4 mr-2" />
                    Tìm đại lý phân phối
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">
              Tìm đại lý phân phối {brand.name}
            </p>
            <p className="text-xs text-slate-500">gần rẫy của bạn</p>
          </div>
          <Link href="/dai-ly">
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-bold shrink-0">
              <MapPin className="w-4 h-4 mr-1" />
              Tìm ngay
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Desktop Bottom CTA ── */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 py-10 mt-8 mb-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Tìm đại lý phân phối {brand.name} gần rẫy của bạn
              </h2>
              <p className="text-emerald-100 text-sm">
                Hệ thống 500+ đại lý ủy quyền toàn quốc • Giao hàng nhanh 48h
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/dai-ly">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-xl h-12 px-8">
                  <MapPin className="w-5 h-5 mr-2" />
                  Tìm đại lý
                </Button>
              </Link>
              <Link href="/tinh-toan">
                <Button size="lg" variant="outline" className="h-12 px-6 border-2 border-white/40 text-white hover:bg-white/10 font-semibold">
                  <Package className="w-5 h-5 mr-2" />
                  Tính vật tư
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
