/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DYNAMIC SITEMAP GENERATOR                                    ║
 * ║  Auto-generates sitemap for SEO                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Next.js 14 App Router: Place at app/sitemap.ts
 * Generates XML for:
 * - Static pages
 * - Dynamic product/category pages
 * - Agricultural price pages
 */

import { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nhabe-agri.com";

const STATIC_PAGES: Array<{ url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }> = [
  { url: "/", priority: 1.0, changeFrequency: "daily" },
  { url: "/gioi-thieu", priority: 0.8, changeFrequency: "monthly" },
  { url: "/san-pham", priority: 0.9, changeFrequency: "weekly" },
  { url: "/gia-nong-san", priority: 0.9, changeFrequency: "daily" },
  { url: "/kien-thuc", priority: 0.9, changeFrequency: "daily" },
  { url: "/dai-ly", priority: 0.7, changeFrequency: "monthly" },
  { url: "/dang-ky-dai-ly", priority: 0.6, changeFrequency: "monthly" },
  { url: "/lien-he", priority: 0.7, changeFrequency: "monthly" },
  { url: "/cong-cu", priority: 0.8, changeFrequency: "weekly" },
  { url: "/cong-cu/du-toan-tuoi", priority: 0.8, changeFrequency: "weekly" },
  { url: "/cong-cu/dien-nuoc", priority: 0.7, changeFrequency: "weekly" },
  { url: "/cong-cu/cham-phan", priority: 0.7, changeFrequency: "weekly" },
];

const CROP_SLUGS = [
  "sau-rieng-ri6",
  "sau-rieng-monthong",
  "ca-phe-robusta",
  "ca-phe-arabica",
  "tieude",
  "dieu",
  "buoi",
  "xoai",
];

const REGIONS = [
  "dak-lak",
  "lam-dong",
  "gia-lai",
  "dak-nong",
  "tien-giang",
  "can-tho",
  "binh-phuoc",
  "dong-nai",
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // Get product slugs
    const products = await prisma.products.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    for (const product of products) {
      dynamicRoutes.push({
        url: `${BASE_URL}/san-pham/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    // Get category slugs
    const categories = await prisma.categories.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const category of categories) {
      dynamicRoutes.push({
        url: `${BASE_URL}/danh-muc/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // Get article slugs
    const articles = await prisma.wikiArticles.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    });

    for (const article of articles) {
      dynamicRoutes.push({
        url: `${BASE_URL}/wiki/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }

    // Get blog post slugs for sitemap
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    for (const post of posts) {
      dynamicRoutes.push({
        url: `${BASE_URL}/kien-thuc/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    // Get blog categories
    const postCategories = await prisma.postCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const category of postCategories) {
      dynamicRoutes.push({
        url: `${BASE_URL}/kien-thuc?category=${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // Get dealer locations for regional pages
    const dealers = await prisma.dealers.findMany({
      where: { isActive: true },
      select: { province: true, updatedAt: true },
    });

    const provinces = [...new Set(dealers.map((d) => d.province))];
    for (const province of provinces) {
      dynamicRoutes.push({
        url: `${BASE_URL}/dai-ly?region=${province.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch (error) {
    console.error("[Sitemap] Error fetching dynamic routes:", error);
  }

  return dynamicRoutes;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CROP PRICE PAGES (Dynamic based on crop type)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateCropPricePages(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];

  for (const crop of CROP_SLUGS) {
    pages.push({
      url: `${BASE_URL}/gia-nong-san?crop=${crop}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return pages;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * REGIONAL PAGES
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateRegionalPages(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];

  for (const region of REGIONS) {
    pages.push({
      url: `${BASE_URL}/gia-nong-san?region=${region}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return pages;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN SITEMAP EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log("[Sitemap] Generating sitemap...");

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Dynamic pages from database
  const dynamicRoutes = await getDynamicRoutes();

  // Crop-specific price pages
  const cropPages = generateCropPricePages();

  // Regional pages
  const regionalPages = generateRegionalPages();

  // Combine all routes
  const allRoutes = [
    ...staticRoutes,
    ...dynamicRoutes,
    ...cropPages,
    ...regionalPages,
  ];

  console.log(`[Sitemap] Generated ${allRoutes.length} routes`);

  return allRoutes;
}
