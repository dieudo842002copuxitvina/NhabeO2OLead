/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  CONVERSION BOX COMPONENT                                         ║
 * ║  High-converting CTA card for driving users to /tinh-toan          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import Link from "next/link";
import { ArrowRight, Calculator, TrendingDown, TrendingUp, Droplets, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

type CropType = "default" | "sau-rieng" | "ca-phe" | "tieu" | "xoai" | "buoi" | "dieu";

interface ConversionBoxProps {
  cropType?: CropType;
  title?: string;
  description?: string;
  ctaText?: string;
  showStats?: boolean;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CROP CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

const CROP_CONFIG: Record<CropType, {
  icon: React.ReactNode;
  name: string;
  title: string;
  description: string;
  defaultParams: string;
  highlights: string[];
}> = {
  default: {
    icon: <Droplets className="h-8 w-8" />,
    name: "Nông nghiệp",
    title: "Đầu tư công nghệ tưới đúng cách",
    description: "Bảo vệ năng suất cây trồng với máy tính thủy lực - lên cấu hình ống, béc tưới phù hợp diện tích của bạn.",
    defaultParams: "",
    highlights: ["Tối ưu hóa chi phí", "Hoàn vốn nhanh", "Tiết kiệm nước 40%"],
  },
  "sau-rieng": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Sầu riêng",
    title: "Tưới sầu riêng đúng kỹ thuật",
    description: "Với giá sầu riêng hiện tại, đầu tư hệ thống tưới VIO giúp tăng năng suất và hoàn vốn sau 1-2 vụ thu hoạch.",
    defaultParams: "?utm_source=blog&utm_content=sau-rieng&utm_medium=cta",
    highlights: ["Phù hợp khí hậu Tây Nguyên", "Tiết kiệm nước 40%", "Tăng năng suất 20%"],
  },
  "ca-phe": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Cà phê",
    title: "Tưới cà phê bền vững",
    description: "Hệ thống tưới thông minh giúp cà phê phát triển đều, tiết kiệm nước và công sức tưới truyền thống.",
    defaultParams: "?utm_source=blog&utm_content=ca-phe&utm_medium=cta",
    highlights: ["Phù hợp địa hình đồi", "Tiết kiệm nước 35%", "Giảm chi phí nhân công"],
  },
  "tieu": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Hạt tiêu",
    title: "Kỹ thuật tưới tiêu hiệu quả",
    description: "Bộ lọc trung tâm + béc tưới phù hợp giúp cây tiêu khỏe mạnh, hạt đều, năng suất cao.",
    defaultParams: "?utm_source=blog&utm_content=tieu&utm_medium=cta",
    highlights: ["Bộ lọc chống tắc", "Tưới đều 100%", "Phòng bệnh hiệu quả"],
  },
  "xoai": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Xoài",
    title: "Tưới xoài cho quả ngọt",
    description: "Hệ thống tưới nhỏ giọt giúp xoài phát triển tốt, quả to đều, giảm sâu bệnh.",
    defaultParams: "?utm_source=blog&utm_content=xoai&utm_medium=cta",
    highlights: ["Tưới nhỏ giọt chính xác", "Tiết kiệm phân bón", "Tăng chất lượng quả"],
  },
  "buoi": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Bưởi",
    title: "Tưới bưởi tiết kiệm",
    description: "Giải pháp tưới tự động cho bưởi, giúp quả to, vỏ mỏng, năng suất ổn định.",
    defaultParams: "?utm_source=blog&utm_content=buoi&utm_medium=cta",
    highlights: ["Tưới tự động", "Kiểm soát độ ẩm", "Giảm công chăm sóc"],
  },
  "dieu": {
    icon: <TrendingUp className="h-8 w-8" />,
    name: "Điều",
    title: "Tưới điều thông minh",
    description: "Hệ thống tưới phù hợp cho cây điều vùng Tây Nguyên, giúp cây phát triển đều.",
    defaultParams: "?utm_source=blog&utm_content=dieu&utm_medium=cta",
    highlights: ["Phù hợp địa hình", "Tiết kiệm nước", "Tăng tỷ lệ đậu"],
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function detectCropFromSlug(slug: string): CropType {
  const lowerSlug = slug.toLowerCase();
  
  if (lowerSlug.includes("sau-rieng") || lowerSlug.includes("sầu riêng")) return "sau-rieng";
  if (lowerSlug.includes("ca-phe") || lowerSlug.includes("cà phê")) return "ca-phe";
  if (lowerSlug.includes("tieu") || lowerSlug.includes("tiêu")) return "tieu";
  if (lowerSlug.includes("xoai") || lowerSlug.includes("xoài")) return "xoai";
  if (lowerSlug.includes("buoi") || lowerSlug.includes("bưởi")) return "buoi";
  if (lowerSlug.includes("dieu") || lowerSlug.includes("điều")) return "dieu";
  
  return "default";
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function HighlightBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
      <Zap className="h-3 w-3" />
      {text}
    </span>
  );
}

function StatsRow({ config }: { config: typeof CROP_CONFIG.default }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {config.highlights.map((highlight, index) => (
        <HighlightBadge key={index} text={highlight} />
      ))}
    </div>
  );
}

function CalculatorIcon({ large = false }: { large?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ${large ? "h-16 w-16" : "h-12 w-12"}`}>
      <Calculator className={`${large ? "h-8 w-8" : "h-6 w-6"} text-white`} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * VARIANT COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Large Banner variant - for mid-content insertion
 */
function LargeBanner({
  title,
  description,
  ctaText,
  cropType,
}: {
  title: string;
  description: string;
  ctaText: string;
  cropType: CropType;
}) {
  const config = CROP_CONFIG[cropType];
  const ctaUrl = `/tinh-toan${config.defaultParams}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#388E3C] p-6 shadow-xl sm:p-8">
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <CalculatorIcon large />

        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-white/80 sm:text-base">{description}</p>
          {cropType !== "default" && <StatsRow config={config} />}
        </div>

        <Link
          href={ctaUrl}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#2E7D32] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Inline CTA variant - for embedding in content
 */
function InlineCTA({
  title,
  description,
  ctaText,
  cropType,
}: {
  title: string;
  description: string;
  ctaText: string;
  cropType: CropType;
}) {
  const config = CROP_CONFIG[cropType];
  const ctaUrl = `/tinh-toan${config.defaultParams}`;

  return (
    <div className="my-8 rounded-xl border-2 border-dashed border-[#4CAF50]/30 bg-gradient-to-r from-[#F3FAF3] to-[#E8F5E9] p-5">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <CalculatorIcon />
        
        <div className="flex-1 text-center sm:text-left">
          <h4 className="font-semibold text-[#2E7D32]">{title}</h4>
          <p className="mt-0.5 text-sm text-[#5F6B7A]">{description}</p>
        </div>

        <Link
          href={ctaUrl}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E36]"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Card variant - for sidebar or compact placement
 */
function CardVariant({
  title,
  description,
  ctaText,
  cropType,
}: {
  title: string;
  description: string;
  ctaText: string;
  cropType: CropType;
}) {
  const config = CROP_CONFIG[cropType];
  const ctaUrl = `/tinh-toan${config.defaultParams}`;

  return (
    <div className="rounded-2xl border border-[#E9ECEF] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4CAF50]/10">
          {config.icon}
        </div>
        <h4 className="font-semibold text-[#1A1A1A]">{config.name}</h4>
      </div>

      <p className="mb-3 text-sm text-[#5F6B7A]">{description}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {config.highlights.slice(0, 2).map((h, i) => (
          <HighlightBadge key={i} text={h} />
        ))}
      </div>

      <Link
        href={ctaUrl}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4CAF50] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E36]"
      >
        {ctaText}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function ConversionBox({
  cropType = "default",
  title,
  description,
  ctaText = "Tính toán ngay",
  showStats = true,
  className = "",
}: ConversionBoxProps) {
  // Auto-detect crop type if slug-like content is passed
  const detectedCrop = typeof cropType === "string" && cropType.includes("-") 
    ? detectCropFromSlug(cropType)
    : cropType;
  
  const config = CROP_CONFIG[detectedCrop];
  
  // Use provided content or fallback to config
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <LargeBanner
      title={finalTitle}
      description={finalDescription}
      ctaText={ctaText}
      cropType={detectedCrop}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORTED VARIANTS & UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════════ */

// Export variants for specific use cases
export { LargeBanner, InlineCTA, CardVariant, detectCropFromSlug, CROP_CONFIG };

// Export type for external use
export type { CropType, ConversionBoxProps };
