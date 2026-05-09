import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Globe, MapPin, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllBrands } from "@/lib/brands";
import { BRAND_LABELS, BRAND_FLAGS } from "@/data/brand-slugs";

export const metadata: Metadata = {
  title: "Thương hiệu thiết bị tưới | Nhà Bè Agri",
  description:
    "Khám phá các thương hiệu thiết bị tưới tiêu hàng đầu: Rivulis (Israel), Ducar (Turkey), Azud (Spain), Bermad (Australia), Netafim, Driptec. Ủy quyền chính hãng tại Nhà Bè Agri.",
};

/**
 * Visual config per brand slug — kept as static data because:
 * - Color/gradient/CSS classes can't come from DB
 * - SEO metadata runs at build time
 * When a new brand is added → add entry here + in brand-slugs.ts
 */
const BRAND_VISUAL: Record<string, {
  color: string;
  bgGradient: string;
  borderColor: string;
  accent: string;
  tagline: string;
  category: string;
  featured: boolean;
}> = {
  rivulis:   { color: "emerald",  bgGradient: "from-emerald-50 to-teal-50",   borderColor: "hover:border-emerald-300", accent: "bg-emerald-100 text-emerald-700", tagline: "Tiên phong tưới tiết kiệm nước toàn cầu",   category: "Béc tưới, Ống nhỏ giọt",        featured: true  },
  ducar:     { color: "blue",     bgGradient: "from-blue-50 to-cyan-50",       borderColor: "hover:border-blue-300",     accent: "bg-blue-100 text-blue-700",       tagline: "Súng tưới bán kính lớn chuyên nghiệp",       category: "Súng tưới bán kính lớn",         featured: true  },
  azud:      { color: "orange",   bgGradient: "from-orange-50 to-amber-50",    borderColor: "hover:border-orange-300",   accent: "bg-orange-100 text-orange-700",    tagline: "Chuyên gia bộ lọc cho tưới nhỏ giọt",          category: "Bộ lọc đĩa",                    featured: true  },
  bermad:    { color: "violet",   bgGradient: "from-violet-50 to-purple-50",  borderColor: "hover:border-violet-300",   accent: "bg-violet-100 text-violet-700",   tagline: "Van điều khiển thủy lực chuyên nghiệp",         category: "Van điện từ",                    featured: false },
  netafim:   { color: "teal",     bgGradient: "from-teal-50 to-cyan-50",      borderColor: "hover:border-teal-300",     accent: "bg-teal-100 text-teal-700",       tagline: "Phát minh tưới nhỏ giọt — hơn 60 năm",          category: "Hệ thống tưới nhỏ giọt",         featured: false },
  driptec:   { color: "cyan",     bgGradient: "from-cyan-50 to-teal-50",       borderColor: "hover:border-cyan-300",     accent: "bg-cyan-100 text-cyan-700",       tagline: "Chất lượng cao — sản xuất tại Việt Nam",         category: "Ống PE, Béc tưới",               featured: false },
  arka:      { color: "sky",      bgGradient: "from-sky-50 to-blue-50",         borderColor: "hover:border-sky-300",      accent: "bg-sky-100 text-sky-700",        tagline: "Chất lượng Israel — giá tối ưu",                  category: "Bộ lọc, Van điện từ",            featured: false },
  "rain-bird": { color: "indigo", bgGradient: "from-indigo-50 to-blue-50",      borderColor: "hover:border-indigo-300",   accent: "bg-indigo-100 text-indigo-700",   tagline: "Hệ thống tưới cảnh quan chuyên nghiệp",          category: "Controller, Rotor",               featured: false },
  hunter:    { color: "blue",     bgGradient: "from-blue-50 to-indigo-50",      borderColor: "hover:border-blue-300",     accent: "bg-blue-100 text-blue-700",       tagline: "Điều khiển tưới thông minh từ smartphone",       category: "Smart Controller",                 featured: false },
  dekko:     { color: "slate",   bgGradient: "from-slate-50 to-zinc-50",      borderColor: "hover:border-slate-300",   accent: "bg-slate-100 text-slate-700",     tagline: "Phụ kiện giá rẻ — phổ biến toàn quốc",           category: "Phụ kiện đường ống",             featured: false },
  "nha-be-agri": { color: "emerald", bgGradient: "from-green-50 to-emerald-50", borderColor: "hover:border-green-300", accent: "bg-green-100 text-green-700", tagline: "Nhà phân phối hàng đầu Việt Nam",       category: "Phân phối & Nhập khẩu",         featured: false },
};

type BrandDisplay = {
  slug: string;
  name: string;
  flag: string;
  country: string;
  logo_url?: string | null;
  category: string;
  tagline: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  accent: string;
  featured: boolean;
};

function buildDisplayBrand(dbBrand: { slug: string; name: string; origin_country?: string | null; logo_url?: string | null }): BrandDisplay {
  const visual = BRAND_VISUAL[dbBrand.slug] ?? {
    color: "slate",
    bgGradient: "from-slate-50 to-zinc-50",
    borderColor: "hover:border-slate-300",
    accent: "bg-slate-100 text-slate-700",
    tagline: dbBrand.name,
    category: "Thiết bị nông nghiệp",
    featured: false,
  };
  return {
    slug: dbBrand.slug,
    name: dbBrand.name,
    logo_url: dbBrand.logo_url,
    flag: BRAND_FLAGS[dbBrand.slug as keyof typeof BRAND_FLAGS] ?? "🌐",
    country: dbBrand.origin_country ?? "",
    category: visual.category,
    tagline: visual.tagline,
    color: visual.color,
    bgGradient: visual.bgGradient,
    borderColor: visual.borderColor,
    accent: visual.accent,
    featured: visual.featured,
  };
}

export default async function BrandListingPage() {
  const dbBrands = await getAllBrands();
  const brands: BrandDisplay[] = dbBrands.map(buildDisplayBrand);

  const featured = brands.filter((b) => b.featured);
  const others = brands.filter((b) => !b.featured);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Star className="w-3 h-3 mr-1" />
              Nhà phân phối ủy quyền chính hãng
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Thương hiệu thiết bị tưới tiêu
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Nhà Bè Agri là nhà phân phối và nhập khẩu ủy quyền các thương hiệu thiết bị tưới hàng đầu thế giới.
              Tất cả sản phẩm được bảo hành chính hãng.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14 space-y-12">
        {/* Featured Brands */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm">🔥</span>
              Thương hiệu nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((brand) => (
                <BrandCard key={brand.slug} brand={brand} large />
              ))}
            </div>
          </section>
        )}

        {/* All Brands */}
        {others.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🏷️</span>
              Tất cả thương hiệu
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {others.map((brand) => (
                <BrandCard key={brand.slug} brand={brand} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function BrandCard({ brand, large = false }: { brand: BrandDisplay; large?: boolean }) {
  return (
    <Link href={`/thuong-hieu/${brand.slug}`}>
      <Card
        className={`h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 group cursor-pointer ${brand.borderColor}`}
      >
        <div className={`p-5 md:p-6 bg-gradient-to-br ${brand.bgGradient}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">{brand.flag}</span>
            {brand.country && (
              <Badge className={cn("text-[10px] font-semibold", brand.accent)}>
                {brand.country}
              </Badge>
            )}
          </div>

          <h3 className={cn(
            "font-extrabold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors",
            large ? "text-2xl" : "text-lg"
          )}>
            {brand.name}
          </h3>

          <p className="text-xs text-slate-500 mb-3">{brand.category}</p>

          {large && (
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {brand.tagline}
            </p>
          )}

          {brand.logo_url && (
            <div className="mt-4">
              <Image
                src={brand.logo_url}
                alt={brand.name}
                width={80}
                height={40}
                className="object-contain h-10 w-auto"
              />
            </div>
          )}
        </div>

        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">{brand.tagline}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
