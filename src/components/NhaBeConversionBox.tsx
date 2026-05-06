/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  NHA BE CONVERSION BOX - Branded CTA Component                    ║
 * ║  Professional agricultural branding with trust-building design        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * - Brand colors: Green (#2E7D32, #4CAF50) as primary
 * - Square, reliable design aesthetic
 * - O2O Lead tracking integration
 * - Multiple crop-aware CTAs
 */

"use client";

import Link from "next/link";
import { 
  Calculator, 
  TrendingUp, 
  Droplets, 
  Shield, 
  Award, 
  ArrowRight, 
  Phone,
  MapPin,
  CheckCircle2
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES & VARIANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

type Variant = "banner" | "inline" | "sidebar" | "floating";
type Size = "sm" | "md" | "lg";

interface NhaBeConversionBoxProps {
  variant?: Variant;
  size?: Size;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  showBenefits?: boolean;
  showTrust?: boolean;
  className?: string;
  trackingParams?: {
    source?: string;
    campaign?: string;
    content?: string;
    medium?: string;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DEFAULT COPY & TRACKING
 * ═══════════════════════════════════════════════════════════════════════════════ */

const DEFAULT_TRACKING = {
  source: "nhabe_brand",
  campaign: "o2o_lead",
  medium: "cta_box",
};

const DEFAULT_COPY = {
  title: "Giải pháp tưới chuyên gia từ Nhà Bè Agri",
  description: "Thị trường biến động, năng suất phải vững! Tối ưu chi phí tưới tiêu với công nghệ Nhà Bè Agri.",
  ctaText: "Tính toán vật tư & Nhận báo giá đại lý",
  benefits: [
    "Tư vấn miễn phí từ kỹ thuật viên",
    "Báo giá chi tiết trong 24h",
    "Hỗ trợ lắp đặt toàn quốc",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Generate Tracking URL
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateTrackingUrl(baseUrl: string, tracking: typeof DEFAULT_TRACKING & { content?: string }) {
  const params = new URLSearchParams();
  params.set("utm_source", tracking.source);
  params.set("utm_campaign", tracking.campaign);
  params.set("utm_medium", tracking.medium);
  if (tracking.content) {
    params.set("utm_content", tracking.content);
  }
  return `${baseUrl}?${params.toString()}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Trust badges row
 */
function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/80">
      <span className="flex items-center gap-1">
        <Shield className="h-3.5 w-3.5" />
        Uy tín 10+ năm
      </span>
      <span className="text-white/30">•</span>
      <span className="flex items-center gap-1">
        <Award className="h-3.5 w-3.5" />
        Chuyên gia Tây Nguyên
      </span>
      <span className="text-white/30">•</span>
      <span className="flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        500+ Đại lý toàn quốc
      </span>
    </div>
  );
}

/**
 * Benefit items
 */
function BenefitList({ benefits }: { benefits: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {benefits.map((benefit, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-white/90">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8BC34A]" />
          {benefit}
        </li>
      ))}
    </ul>
  );
}

/**
 * Main CTA Button
 */
function CTALink({ 
  href, 
  children, 
  size = "md",
  tracking 
}: { 
  href: string; 
  children: React.ReactNode; 
  size?: Size;
  tracking?: typeof DEFAULT_TRACKING;
}) {
  const url = tracking ? generateTrackingUrl(href, tracking) : href;
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <Link
      href={url}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[#2E7D32] shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${sizeClasses[size]} bg-gradient-to-r from-[#FFEB3B] to-[#FFC107] hover:from-[#FFD54F] hover:to-[#FFCA28]`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * VARIANT: BANNER (Full-width horizontal)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function BannerVariant({ 
  title, 
  description, 
  ctaText, 
  showBenefits = true,
  tracking 
}: Omit<NhaBeConversionBoxProps, "variant">) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] p-6 shadow-xl sm:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white" />
        <div className="absolute right-20 top-20 h-40 w-40 rounded-full bg-white" />
      </div>
      
      {/* Decorative Icons */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
        <Droplets className="h-48 w-48 text-white" />
      </div>

      <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          {/* Brand Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            <TrendingUp className="h-3.5 w-3.5" />
            Nhà Bè Agri - Giải pháp tưới chuyên nghiệp
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            {title || DEFAULT_COPY.title}
          </h3>
          
          <p className="mb-4 max-w-xl text-sm text-white/80 sm:text-base">
            {description || DEFAULT_COPY.description}
          </p>

          {showBenefits && (
            <div className="hidden lg:block">
              <BenefitList benefits={DEFAULT_COPY.benefits} />
            </div>
          )}
        </div>

        {/* Right CTA */}
        <div className="flex flex-col items-center gap-4 lg:items-end">
          <CTALink href="/tinh-toan" size="lg" tracking={tracking}>
            {ctaText || DEFAULT_COPY.ctaText}
          </CTALink>
          <TrustBadges />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * VARIANT: INLINE (Compact for mid-content)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function InlineVariant({ 
  title, 
  description, 
  ctaText, 
  tracking 
}: Omit<NhaBeConversionBoxProps, "variant" | "showBenefits">) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#4CAF50]/40 bg-gradient-to-r from-[#E8F5E9] via-[#C8E6C9] to-[#E8F5E9] p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] shadow-lg">
          <Calculator className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="mb-1 font-bold text-[#1B5E20]">
            {title || DEFAULT_COPY.title}
          </h4>
          <p className="text-sm text-[#5F6B7A]">
            {description || DEFAULT_COPY.description}
          </p>
        </div>

        {/* CTA */}
        <CTALink href="/tinh-toan" size="md" tracking={tracking}>
          {ctaText || "Tính toán ngay"}
        </CTALink>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * VARIANT: SIDEBAR (Compact card for sidebar)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function SidebarVariant({ 
  ctaText, 
  showTrust = true,
  tracking 
}: Omit<NhaBeConversionBoxProps, "variant" | "title" | "description" | "showBenefits">) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E9ECEF] bg-gradient-to-br from-[#E8F5E9] to-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#388E3C] p-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-white" />
          <span className="font-bold text-white">Nhà Bè Agri</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="mb-3 text-sm text-[#5F6B7A]">
          Nhận báo giá chi tiết và tư vấn miễn phí từ kỹ thuật viên.
        </p>

        <CTALink href="/tinh-toan" size="sm" tracking={tracking}>
          {ctaText || "Dự toán chi phí"}
        </CTALink>

        {showTrust && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7B8794]">
            <Phone className="h-3.5 w-3.5" />
            Hỗ trợ 24/7
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * VARIANT: FLOATING (Fixed position bottom)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function FloatingVariant({ 
  title,
  ctaText,
  tracking 
}: Omit<NhaBeConversionBoxProps, "variant" | "description" | "showBenefits" | "showTrust">) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-auto max-w-lg -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-1 shadow-2xl">
        <div className="flex items-center gap-3 bg-white px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5E9]">
            <Calculator className="h-5 w-5 text-[#2E7D32]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#1A1A1A]">
              {title || "Cần tư vấn tưới tiêu?"}
            </p>
            <p className="text-xs text-[#7B8794]">Nhận báo giá trong 24h</p>
          </div>
          <CTALink href="/tinh-toan" size="sm" tracking={tracking}>
            {ctaText || "Tính ngay"}
          </CTALink>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function NhaBeConversionBox({
  variant = "banner",
  size = "md",
  title,
  description,
  ctaText,
  ctaUrl = "/tinh-toan",
  showBenefits = true,
  showTrust = true,
  className = "",
  trackingParams,
}: NhaBeConversionBoxProps) {
  // Merge default tracking with custom params
  const tracking = {
    ...DEFAULT_TRACKING,
    ...trackingParams,
  };

  const containerClassName = `NhaBeConversionBox ${className}`;

  switch (variant) {
    case "banner":
      return (
        <div className={containerClassName}>
          <BannerVariant
            title={title}
            description={description}
            ctaText={ctaText}
            showBenefits={showBenefits}
            tracking={tracking}
          />
        </div>
      );

    case "inline":
      return (
        <div className={containerClassName}>
          <InlineVariant
            title={title}
            description={description}
            ctaText={ctaText}
            tracking={tracking}
          />
        </div>
      );

    case "sidebar":
      return (
        <div className={containerClassName}>
          <SidebarVariant
            ctaText={ctaText}
            showTrust={showTrust}
            tracking={tracking}
          />
        </div>
      );

    case "floating":
      return (
        <div className={containerClassName}>
          <FloatingVariant
            title={title}
            ctaText={ctaText}
            tracking={tracking}
          />
        </div>
      );

    default:
      return (
        <div className={containerClassName}>
          <BannerVariant
            title={title}
            description={description}
            ctaText={ctaText}
            showBenefits={showBenefits}
            tracking={tracking}
          />
        </div>
      );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRESET COMPONENTS FOR COMMON USE CASES
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Price page CTA - emphasizes market volatility
 */
export function NhaBePricePageCTA() {
  return (
    <NhaBeConversionBox
      variant="banner"
      title="Thị trường biến động, năng suất phải vững!"
      description="Tối ưu chi phí tưới tiêu với công nghệ Nhà Bè Agri - Giải pháp tưới tiết kiệm nước 40%, tăng năng suất 25%."
      ctaText="Tính toán vật tư & Nhận báo giá"
      showBenefits={false}
      trackingParams={{
        source: "price_page",
        campaign: "o2o_lead",
        medium: "cta_banner",
      }}
    />
  );
}

/**
 * Blog inline CTA - contextual for specific crops
 */
export function NhaBeBlogInlineCTA({ cropType }: { cropType?: string }) {
  return (
    <NhaBeConversionBox
      variant="inline"
      title={`Tưới ${cropType || "cây trồng"} chuyên nghiệp`}
      description="Đầu tư hệ thống tưới phù hợp với kỹ thuật canh tác hiện đại."
      ctaText="Tính toán ngay"
      showBenefits={false}
      trackingParams={{
        source: "blog_nhabe",
        campaign: "o2o_lead",
        medium: "cta_inline",
        content: cropType,
      }}
    />
  );
}

/**
 * Blog end-of-article CTA
 */
export function NhaBeBlogEndCTA({ cropType }: { cropType?: string }) {
  return (
    <NhaBeConversionBox
      variant="banner"
      title={cropType ? `Tưới ${cropType} đúng cách với Nhà Bè Agri` : "Giải pháp tưới chuyên gia"}
      description="Công nghệ tưới tiết kiệm nước, phù hợp khí hậu Việt Nam. Nhận tư vấn và báo giá chi tiết từ đại lý gần nhất."
      ctaText="Tính toán vật tư & Nhận báo giá"
      showBenefits={true}
      trackingParams={{
        source: "blog_nhabe",
        campaign: "o2o_lead",
        medium: "cta_end_article",
        content: cropType,
      }}
    />
  );
}

/**
 * Sidebar widget
 */
export function NhaBeSidebarWidget() {
  return (
    <NhaBeConversionBox
      variant="sidebar"
      ctaText="Dự toán chi phí"
      showTrust={true}
      trackingParams={{
        source: "sidebar",
        campaign: "o2o_lead",
        medium: "cta_sidebar",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export type { NhaBeConversionBoxProps };
