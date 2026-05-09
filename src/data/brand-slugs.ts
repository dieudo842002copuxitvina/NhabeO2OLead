/**
 * BRAND SLUGS — Static source of truth for all brand slugs.
 * Kept as static data (not DB) because:
 *   - Client components can't call Prisma directly
 *   - MegaMenu runs before DB hydration on cold start
 *   - Nav needs stable slugs that don't change per request
 *
 * When a new brand is added to DB → add it here (slug + label + flag + url).
 * MegaMenuData.json brands section should be kept in sync.
 */

export const BRAND_SLUGS = [
  "rivulis",
  "ducar",
  "azud",
  "bermad",
  "netafim",
  "driptec",
  "arka",
  "rain-bird",
] as const;

export type BrandSlug = typeof BRAND_SLUGS[number];

export const BRAND_LABELS: Record<BrandSlug, string> = {
  rivulis: "Rivulis",
  ducar: "Ducar",
  azud: "Azud",
  bermad: "Bermad",
  netafim: "Netafim",
  driptec: "Driptec",
  arka: "ArkA",
  "rain-bird": "Rain Bird",
};

export const BRAND_FLAGS: Record<BrandSlug, string> = {
  rivulis: "🇮🇱",
  ducar: "🇹🇷",
  azud: "🇪🇸",
  bermad: "🇦🇺",
  netafim: "🇮🇱",
  driptec: "🇻🇳",
  arka: "🇮🇱",
  "rain-bird": "🇺🇸",
};

export const BRAND_URLS: Record<BrandSlug, string> = {
  rivulis: "/thuong-hieu/rivulis",
  ducar: "/thuong-hieu/ducar",
  azud: "/thuong-hieu/azud",
  bermad: "/thuong-hieu/bermad",
  netafim: "/thuong-hieu/netafim",
  driptec: "/thuong-hieu/driptec",
  arka: "/thuong-hieu/arka",
  "rain-bird": "/thuong-hieu/rain-bird",
};

/** All brands as array of objects — ready to map in JSX */
export const ALL_BRANDS = BRAND_SLUGS.map((slug) => ({
  slug,
  label: BRAND_LABELS[slug],
  flag: BRAND_FLAGS[slug],
  url: BRAND_URLS[slug],
}));

export const ALL_BRAND_URLS = ALL_BRANDS.map((b) => b.url);
