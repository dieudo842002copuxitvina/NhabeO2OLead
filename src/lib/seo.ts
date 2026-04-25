import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://nhabeagri.vn";
const DEFAULT_OG_IMAGE = "/og-nhabe-agri.jpg";
const DEFAULT_BRAND = "Nhà Bè Agri";
const DEFAULT_AREA = "Việt Nam";

export type GenerateSEOMetadataInput = {
  productName: string;
  brandName?: string | null;
  area?: string | null;
  description?: string | null;
  canonicalPath: string;
  image?: string | null;
  keywords?: string[];
};

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return configuredUrl.replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl?: string | null) {
  const siteUrl = getSiteUrl();

  if (!pathOrUrl) {
    return `${siteUrl}${DEFAULT_OG_IMAGE}`;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function normalizeCanonicalPath(path: string) {
  const [pathname] = path.split("?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized.replace(/\/$/, "") || "/";
}

export function buildSEOTitle(productName: string, brandName = DEFAULT_BRAND, area = DEFAULT_AREA) {
  return `${productName} - ${brandName} | Giải pháp cho ${area}`;
}

export function generateSEOMetadata({
  productName,
  brandName,
  area,
  description,
  canonicalPath,
  image,
  keywords = [],
}: GenerateSEOMetadataInput): Metadata {
  const resolvedBrand = brandName?.trim() || DEFAULT_BRAND;
  const resolvedArea = area?.trim() || DEFAULT_AREA;
  const canonical = absoluteUrl(normalizeCanonicalPath(canonicalPath));
  const title = buildSEOTitle(productName, resolvedBrand, resolvedArea);
  const metaDescription =
    description?.trim() ||
    `${resolvedBrand} cung cấp ${productName} chính hãng, tư vấn kỹ thuật và kết nối đại lý gần nhất cho ${resolvedArea}.`;
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title,
    description: metaDescription,
    keywords: [
      productName,
      resolvedBrand,
      resolvedArea,
      "Nhà Bè Agri",
      "đại lý nông nghiệp",
      "thiết bị nông nghiệp",
      ...keywords,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: DEFAULT_BRAND,
      locale: "vi_VN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImage],
    },
  };
}
