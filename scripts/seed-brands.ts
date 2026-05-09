/**
 * scripts/seed-brands.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Brand data vào Prisma DB
 *
 * Chạy: npx tsx scripts/seed-brands.ts
 *
 * Cách dùng:
 *   1. Chạy migration trước: npx prisma migrate dev --name add_brands
 *   2. Chạy seed: npx tsx scripts/seed-brands.ts
 *   3. Kiểm tra: npx prisma studio (mở bảng Brand)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

interface BrandSeed {
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  origin_country: string | null;
  is_active: boolean;
}

async function seedBrands() {
  console.log("\n🌱 Brand Seeder — Nhà Bè Agri O2O\n" + "=".repeat(50));

  // 1. Đọc seed file
  const seedPath = path.join(__dirname, "..", "prisma", "seed-brands.json");
  let brands: BrandSeed[];

  try {
    const raw = fs.readFileSync(seedPath, "utf-8");
    brands = JSON.parse(raw);
    console.log(`  📂 Đọc được ${brands.length} brand từ seed-brands.json`);
  } catch (err) {
    console.error(`  ❌ Không đọc được seed file: ${(err as Error).message}`);
    process.exit(1);
  }

  // 2. Connect DB
  try {
    await prisma.$connect();
    console.log("  ✅ Kết nối Prisma DB thành công\n");
  } catch (err) {
    console.error(`  ❌ Không kết nối được DB: ${(err as Error).message}`);
    process.exit(1);
  }

  // 3. Seed từng brand
  let successCount = 0;
  let skipCount = 0;

  for (const brand of brands) {
    try {
      const existing = await prisma.brand.findUnique({
        where: { slug: brand.slug },
      });

      if (existing) {
        // Update nếu đã tồn tại
        await prisma.brand.update({
          where: { slug: brand.slug },
          data: {
            name: brand.name,
            logo_url: brand.logo_url,
            description: brand.description,
            website: brand.website,
            origin_country: brand.origin_country,
            is_active: brand.is_active,
          },
        });
        console.log(`  🔄 ${brand.name} (${brand.slug}) — đã cập nhật`);
        successCount++;
      } else {
        // Create mới
        await prisma.brand.create({
          data: {
            name: brand.name,
            slug: brand.slug,
            logo_url: brand.logo_url,
            description: brand.description,
            website: brand.website,
            origin_country: brand.origin_country,
            is_active: brand.is_active,
          },
        });
        console.log(`  ✅ ${brand.name} (${brand.slug}) — đã tạo mới`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Lỗi seed ${brand.name}: ${(err as Error).message}`);
      skipCount++;
    }
  }

  // 4. Thống kê
  const total = await prisma.brand.count();
  console.log("\n" + "=".repeat(50));
  console.log("  📊 KẾT QUẢ SEED BRANDS");
  console.log("=".repeat(50));
  console.log(`  ✅ Thành công: ${successCount}`);
  console.log(`  ⚠️  Lỗi: ${skipCount}`);
  console.log(`  📦 Tổng brand trong DB: ${total}`);
  console.log("=".repeat(50));

  // 5. Liệt kê danh sách
  const allBrands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      origin_country: true,
      is_active: true,
    },
  });

  console.log("\n  📋 Danh sách Brand trong DB:");
  for (const b of allBrands) {
    const flag = b.is_active ? "✅" : "❌";
    console.log(`     ${flag} ${b.name} (${b.slug}) — ${b.origin_country || "?"}`);
  }

  await prisma.$disconnect();
}

seedBrands().catch((err) => {
  console.error("\n❌ Script crash:", err);
  process.exit(1);
});
