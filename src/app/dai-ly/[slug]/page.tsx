/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER PUBLIC PROFILE PAGE - Server Component                     ║
 * ║  SEO-optimized public profile page for individual dealers             ║
 * ║  Route: /dai-ly/[slug]                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import DealerProductShowcase from "./_components/DealerProductShowcase";
import { getDealerProducts } from "@/lib/dealers";
import {
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  Star,
  CheckCircle2,
  Droplets,
  Shield,
  MessageCircle,
  Calendar,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DealerProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image: string | null;
  zalo_number: string | null;
  about_us: string | null;
  opening_hours: string | null;
  is_active: boolean;
  created_at: Date;
  _count: {
    calculator_leads: number;
  };
}

interface ProductWithInventory {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image_url: string | null;
  base_price: number | null;
  brand: string | null;
  stock_quantity: number | null;
  is_active: boolean;
  in_stock: boolean;
  dealer_in_stock: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GENERATE METADATA (SEO - Local SEO optimized)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const dealer = await prisma.dealer.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    select: {
      name: true,
      province: true,
      district: true,
      meta_title: true,
      meta_description: true,
      slug: true,
      cover_image: true,
      zalo_number: true,
      about_us: true,
      phone: true,
    },
  });

  if (!dealer) {
    return {
      title: "Đại lý không tìm thấy",
      description: "Trang đại lý không tồn tại hoặc đã bị xóa.",
    };
  }

  // Local SEO optimized title
  const title = dealer.meta_title ||
    `${dealer.name} - Phân phối vật tư nông nghiệp & ống tưới tại ${dealer.district ? `${dealer.district}, ` : ""}${dealer.province || "Việt Nam"}`;

  // Local SEO optimized description
  const description = dealer.meta_description ||
    `Đại lý ${dealer.name} chuyên cung cấp thiết bị tưới, máy bơm, vật tư nông nghiệp chính hãng tại ${dealer.district ? `${dealer.district}, ` : ""}${dealer.province || "Việt Nam"}. Xem ngay bảng giá và tồn kho tại đây.`;

  const url = dealer.slug
    ? `/dai-ly/${dealer.slug}`
    : `/dai-ly/${dealer.id}`;

  // Base URL for Open Graph image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nhabeagri.vn";

  return {
    title,
    description,
    keywords: [
      dealer.name,
      "vật tư nông nghiệp",
      "ống tưới",
      "thiết bị tưới",
      "máy bơm nước",
      dealer.district,
      dealer.province,
      "Nhà Bè Agri",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url,
      siteName: "Nhà Bè Agri",
      locale: "vi_VN",
      type: "website",
      // Use dealer's cover image or default
      images: dealer.cover_image
        ? [
            {
              url: dealer.cover_image,
              width: 1200,
              height: 630,
              alt: `${dealer.name} - Đại lý Nhà Bè Agri tại ${dealer.district || dealer.province || "Việt Nam"}`,
            },
          ]
        : [
            {
              url: `${baseUrl}/og-default-dealer.jpg`,
              width: 1200,
              height: 630,
              alt: `${dealer.name} - Nhà Bè Agri`,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: dealer.cover_image ? [dealer.cover_image] : [`${baseUrl}/og-default-dealer.jpg`],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FETCH DEALER DATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDealerBySlug(slug: string): Promise<DealerProfile | null> {
  return await prisma.dealer.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      province: true,
      district: true,
      latitude: true,
      longitude: true,
      slug: true,
      meta_title: true,
      meta_description: true,
      cover_image: true,
      zalo_number: true,
      about_us: true,
      opening_hours: true,
      is_active: true,
      created_at: true,
      _count: {
        select: { calculator_leads: true },
      },
    },
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatJoinDate(date: Date): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

function buildCtaUrl(dealerId: string, utmSource: string): string {
  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: "dealer_profile",
    utm_campaign: "o2o_lead",
    utm_content: dealerId,
    assigned_dealer: dealerId,
  });
  return `/tinh-toan?${params.toString()}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Cover header with dealer branding
 */
function DealerHeader({ dealer }: { dealer: DealerProfile }) {
  const coverStyle = dealer.cover_image
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${dealer.cover_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div
      className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-16 px-4 sm:px-6 lg:px-8"
      style={coverStyle}
    >
      {/* Dark overlay fallback if no image */}
      {!dealer.cover_image && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800" />
      )}

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-white" />
        <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-white" />
        <Droplets className="absolute right-10 top-10 h-32 w-32 text-white opacity-20" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/dai-ly"
          className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đại lý
        </Link>

        {/* Dealer info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl">
              {dealer.cover_image ? (
                <img
                  src={dealer.cover_image}
                  alt={dealer.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-3xl">🌾</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {dealer.name}
              </h1>
              {dealer.is_active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                  <CheckCircle2 className="h-3 w-3" />
                  Đại lý chính thức
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
              {dealer.district && dealer.province && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {dealer.district}, {dealer.province}
                </span>
              )}
              {dealer.province && !dealer.district && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {dealer.province}
                </span>
              )}
              {dealer.opening_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-emerald-300" />
                  {dealer.opening_hours}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-emerald-300" />
                Tham gia {formatJoinDate(dealer.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-lg font-bold text-white">{dealer._count.calculator_leads}</p>
              <p className="text-xs text-white/70">Lead đã xử lý</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2">
            <Shield className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-lg font-bold text-white">Nhà Bè Agri</p>
              <p className="text-xs text-white/70">Đối tác chính thức</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CTA BOX COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function DealerCTABox({ dealer }: { dealer: DealerProfile }) {
  const ctaUrl = buildCtaUrl(dealer.id, `dealer_profile_${dealer.slug || dealer.id}`);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 shadow-2xl shadow-emerald-900/20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white" />
        <div className="absolute -left-24 -bottom-12 h-40 w-40 rounded-full bg-white" />
      </div>

      {/* Decorative icon */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
        <Droplets className="h-40 w-40 text-white" />
      </div>

      <div className="relative p-6 sm:p-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white mb-4">
          <Star className="h-3.5 w-3.5 text-amber-300" />
          Đại lý Nhà Bè Agri
        </div>

        {/* Copy */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Nhận dự toán vật tư và tư vấn trực tiếp từ {dealer.name}
        </h2>
        <p className="text-emerald-100 text-sm sm:text-base mb-6 max-w-xl">
          Đội ngũ kỹ thuật của {dealer.name} sẽ hỗ trợ bạn thiết kế hệ thống tưới
          phù hợp với cây trồng, địa hình và ngân sách. Báo giá chi tiết trong 24h.
        </p>

        {/* Benefits */}
        <ul className="flex flex-col gap-2 mb-6">
          {[
            "Tư vấn miễn phí từ kỹ thuật viên",
            "Dự toán BOM tự động theo cây trồng",
            "Hỗ trợ lắp đặt tại site",
            "Báo giá chi tiết trong 24h",
          ].map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-emerald-50">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-4 text-base font-bold text-emerald-900 shadow-lg transition-all hover:from-yellow-300 hover:to-amber-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Tính toán vật tư &amp; Nhận báo giá</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        {/* Trust */}
        <p className="mt-4 text-xs text-emerald-200">
          Nhấn vào nút trên → Dữ liệu sẽ được gửi trực tiếp đến {dealer.name}.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONTACT INFO COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function DealerContact({ dealer }: { dealer: DealerProfile }) {
  const ctaUrl = buildCtaUrl(dealer.id, `dealer_contact_${dealer.slug || dealer.id}`);

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-muted to-muted/50 px-6 py-4 border-b">
        <h3 className="font-semibold text-foreground">Liên hệ {dealer.name}</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Contact details */}
        {dealer.phone && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Điện thoại</p>
              <a
                href={`tel:${dealer.phone}`}
                className="font-medium text-foreground hover:text-emerald-600 transition-colors"
              >
                {dealer.phone}
              </a>
            </div>
          </div>
        )}

        {dealer.email && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a
                href={`mailto:${dealer.email}`}
                className="font-medium text-foreground hover:text-emerald-600 transition-colors text-sm"
              >
                {dealer.email}
              </a>
            </div>
          </div>
        )}

        {dealer.address && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Địa chỉ</p>
              <p className="text-sm text-foreground">
                {[dealer.address, dealer.district, dealer.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

        {dealer.zalo_number && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0068FF]/10 text-[#0068FF]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Zalo</p>
              <a
                href={`https://zalo.me/${dealer.zalo_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0068FF] hover:text-[#0052CC] transition-colors text-sm"
              >
                {dealer.zalo_number}
              </a>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link
            href={ctaUrl}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Droplets className="h-4 w-4" />
            Nhận tư vấn từ đại lý này
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function DealerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch dealer
  const dealer = await getDealerBySlug(slug);

  // 404 if not found or inactive
  if (!dealer || !dealer.is_active) {
    notFound();
  }

  // Fetch products with inventory
  const { inStockProducts, preOrderProducts } = await getDealerProducts(dealer.id);

  return (
    <div className="min-h-screen bg-background">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: dealer.name,
            description: dealer.meta_description || `Đại lý Nhà Bè Agri tại ${dealer.province || "Việt Nam"}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: dealer.district || undefined,
              addressRegion: dealer.province || undefined,
              addressCountry: "VN",
            },
            telephone: dealer.phone || undefined,
            email: dealer.email || undefined,
            geo: dealer.latitude && dealer.longitude
              ? {
                  "@type": "GeoCoordinates",
                  latitude: dealer.latitude,
                  longitude: dealer.longitude,
                }
              : undefined,
            url: dealer.slug
              ? `/dai-ly/${dealer.slug}`
              : `/dai-ly/${dealer.id}`,
          }),
        }}
      />

      {/* Header */}
      <DealerHeader dealer={dealer} />

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-8">
        {/* Primary CTA */}
        <DealerCTABox dealer={dealer} />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact card */}
          <div className="lg:col-span-1">
            <DealerContact dealer={dealer} />
          </div>

          {/* About / Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* About card */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-muted to-muted/50 px-6 py-4 border-b">
                <h3 className="font-semibold text-foreground">Về {dealer.name}</h3>
              </div>
              <div className="p-6 space-y-4">
                {dealer.about_us ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {dealer.about_us}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dealer.name} là đại lý chính thức của Nhà Bè Agri, chuyên cung cấp các giải pháp tưới tiêu hiện đại cho nông dân tại khu vực {dealer.district ? `${dealer.district}, ` : ""}{dealer.province || "Việt Nam"}. Với đội ngũ kỹ thuật viên giàu kinh nghiệm, chúng tôi hỗ trợ từ khâu tư vấn, thiết kế đến lắp đặt hệ thống tưới tự động.
                  </p>
                )}

                {/* Opening hours */}
                {dealer.opening_hours && (
                  <div className="flex items-center gap-2 text-sm bg-emerald-50 rounded-lg px-3 py-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-800">
                      Giờ mở cửa: <strong>{dealer.opening_hours}</strong>
                    </span>
                  </div>
                )}

                {/* Services */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "💧", label: "Hệ thống tưới tự động" },
                    { icon: "📋", label: "Dự toán vật tư (BOM)" },
                    { icon: "🛠️", label: "Lắp đặt tại site" },
                    { icon: "📞", label: "Hỗ trợ kỹ thuật 24/7" },
                  ].map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span>{service.icon}</span>
                      <span className="text-foreground/80">{service.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Google Maps */}
            {dealer.latitude && dealer.longitude && (
              <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-muted to-muted/50 px-6 py-4 border-b">
                    <h3 className="font-semibold text-foreground">Bản đồ</h3>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://maps.google.com/maps?q=${dealer.latitude},${dealer.longitude}&hl=vi&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${dealer.name}`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="rounded-2xl border bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
              <h3 className="font-semibold text-foreground mb-4">Cam kết từ Nhà Bè Agri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Shield, label: "Sản phẩm chính hãng", sub: "100% authentic" },
                  { icon: CheckCircle2, label: "Bảo hành 24 tháng", sub: "Official warranty" },
                  { icon: Droplets, label: "Hỗ trợ kỹ thuật", sub: "Technical support" },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Showcase */}
        {(inStockProducts.length > 0 || preOrderProducts.length > 0) && (
          <DealerProductShowcase
            dealerId={dealer.id}
            dealerName={dealer.name}
            inStockProducts={inStockProducts}
            preOrderProducts={preOrderProducts}
          />
        )}

        {/* Footer CTA repeat */}
        <div className="border-t pt-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Sẵn sàng bắt đầu với {dealer.name}?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nhận dự toán vật tư miễn phí và tư vấn từ đội ngũ kỹ thuật viên của{" "}
              {dealer.name} ngay hôm nay.
            </p>
            <Link
              href={buildCtaUrl(dealer.id, `dealer_footer_${dealer.slug || dealer.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Droplets className="h-5 w-5" />
              Tính toán vật tư &amp; Nhận báo giá
            </Link>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar - Mobile Only */}
      {(dealer.phone || dealer.zalo_number) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex items-center gap-2 p-3 max-w-4xl mx-auto">
            {dealer.phone && (
              <a
                href={`tel:${dealer.phone}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Phone className="h-4 w-4" />
                <span>Gọi điện ngay</span>
              </a>
            )}
            {dealer.zalo_number && (
              <a
                href={`https://zalo.me/${dealer.zalo_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0068FF] py-3 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0052CC]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat Zalo</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
