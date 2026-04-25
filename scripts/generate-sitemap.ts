/**
 * Generate static sitemap.xml for SEO landing pages.
 * Run: npx tsx scripts/generate-sitemap.ts
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Inline minimal copies of CROPS / PROVINCES to avoid TS path alias issues in scripts
const CROP_SLUGS = ['sau-rieng','ca-phe','tieu','buoi','thanh-long','lua','rau-mau','cao-su'];
const PROVINCE_SLUGS = ['dak-lak','lam-dong','gia-lai','dak-nong','kon-tum','dong-nai','binh-duong','tay-ninh','binh-thuan','long-an','tien-giang','ben-tre','can-tho','an-giang','kien-giang'];

const BASE = 'https://nhabeagri.com';
const today = new Date().toISOString().split('T')[0];

const staticUrls = [
  '/', '/products', '/dai-ly', '/thi-truong', '/tin-tuc', '/giai-phap', '/lien-he',
  '/cong-cu/tinh-toan-tuoi', '/giai-phap-tuoi',
];

const urls: string[] = [];
for (const u of staticUrls) urls.push(u);
for (const c of CROP_SLUGS) for (const p of PROVINCE_SLUGS) urls.push(`/giai-phap-tuoi/${c}/${p}`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.startsWith('/giai-phap-tuoi/') ? 'weekly' : 'daily'}</changefreq>
    <priority>${u === '/' ? '1.0' : u.startsWith('/giai-phap-tuoi/') ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

const outPath = resolve(process.cwd(), 'public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`✅ Sitemap generated: ${urls.length} URLs → ${outPath}`);
