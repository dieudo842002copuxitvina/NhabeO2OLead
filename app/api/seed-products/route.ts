/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SEED PRODUCTS API ROUTE                                        ║
 * ║  One-time script to seed categories and 8 products for NHÀ BÈ AGRI O2O System  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Usage: GET /api/seed-products (seeds and returns results)
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const prisma = new PrismaClient();

/* ═══════════════════════════════════════════════════════════════════════════════
 * CATEGORIES DATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

const categoriesData = [
  {
    name: "Hệ Thống Tưới Nhỏ Giọt",
    slug: "he-thong-tuoi-nho-giot",
    description: "Hệ thống tưới tiết kiệm nước, phù hợp cho cây trồng cần độ ẩm đều",
  },
  {
    name: "Béc Tưới",
    slug: "bec-tuoi",
    description: "Các loại béc tưới: béc xoay, béc phun sương, béc giọt",
  },
  {
    name: "Ống Nhỏ Giọt",
    slug: "ong-nho-giot",
    description: "Ống dẫn nước với đầu nhỏ giọt tích hợp",
  },
  {
    name: "Van & Bộ Lọc",
    slug: "van-bo-loc",
    description: "Van điện từ, van xả, bộ lọc nước",
  },
  {
    name: "Phân Bón & Dinh Dưỡng",
    slug: "phan-bon-dinh-duong",
    description: "Phân bón lá, phân bón hữu cơ, dung dịch thủy canh",
  },
  {
    name: "Máy Bơm",
    slug: "may-bom",
    description: "Máy bơm nước các loại: bơm ly tâm, bơm chìm, bơm tăng áp",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCTS DATA (8 products)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const productsData = [
  {
    sku: "NHB-DRIP-001",
    name: "Bộ Tưới Nhỏ Giọt Hoàn Chỉnh 100m",
    category_slug: "he-thong-tuoi-nho-giot",
    description: "Bộ hệ thống tưới nhỏ giọt hoàn chỉnh 100m, phù hợp cho vườn rau, cây ăn quả nhỏ. Bao gồm ống chính, ống nhánh, đầu nhỏ giọt.",
    image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    base_price: 3500000,
    brand: "NHÀ BÈ AGRI",
    specifications: { length: "100m", type: "complete_set", coverage: "200-300m2" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-DRIP-002",
    name: "Dây Nhỏ Giọt LDS 16mm",
    category_slug: "ong-nho-giot",
    description: "Dây nhỏ giọt LDS 16mm, khoảng cách giọt 20cm, độ dày 0.3mm. Chống tắc, độ bền cao.",
    image_url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    base_price: 8500,
    brand: "LDS",
    specifications: { diameter: "16mm", spacing: "20cm", thickness: "0.3mm" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-BEC-001",
    name: "Béc Tưới Xoay 360° Mini",
    category_slug: "bec-tuoi",
    description: "Béc tưới xoay 360° mini, bán kính phun 3-5m. Phù hợp cho vườn nhỏ, ban công.",
    image_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    base_price: 45000,
    brand: "Garden Pro",
    specifications: { rotation: "360°", radius: "3-5m", material: "plastic" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-VALVE-001",
    name: "Van Điện Từ 1 inch",
    category_slug: "van-bo-loc",
    description: "Van điện từ 1 inch (DN25), điện áp 220V. Điều khiển bật/tắt nước tự động.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    base_price: 380000,
    brand: "NHÀ BÈ AGRI",
    specifications: { size: "1 inch", voltage: "220V", type: "normally_closed" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-FERT-001",
    name: "Phân Bón Lá NPK 20-20-20",
    category_slug: "phan-bon-dinh-duong",
    description: "Phân bón lá NPK 20-20-20, cân bằng dinh dưỡng cho cây trồng. Gói 500g.",
    image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    base_price: 85000,
    brand: "V力",
    specifications: { npk: "20-20-20", weight: "500g", form: "powder" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-PUMP-001",
    name: "Máy Bơm Nước Tăng Áp 1.5HP",
    category_slug: "may-bom",
    description: "Máy bơm tăng áp 1.5HP, lưu lượng 2-4m³/h, cột áp 40-60m. Phù hợp cho hộ gia đình và farm nhỏ.",
    image_url: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800",
    base_price: 1850000,
    brand: "Pan World",
    specifications: { power: "1.5HP", flow: "2-4m³/h", head: "40-60m" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-FILTER-001",
    name: "Bộ Lọc Nước Mesh 1 inch",
    category_slug: "van-bo-loc",
    description: "Bộ lọc nước mesh 1 inch, lọc cặn bẩn, bảo vệ hệ thống tưới. Dễ dàng vệ sinh.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    base_price: 220000,
    brand: "NHÀ BÈ AGRI",
    specifications: { size: "1 inch", filter_type: "mesh", mesh_size: "120 mesh" },
    is_active: true,
    in_stock: true,
  },
  {
    sku: "NHB-BEC-002",
    name: "Béc Phun Sương Micro",
    category_slug: "bec-tuoi",
    description: "Béc phun sương micro, tạo hạt nước mịn. Phù hợp làm mát nhà kính, vườn ươm.",
    image_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    base_price: 25000,
    brand: "MistPro",
    specifications: { type: "micro_mist", spray_angle: "360°", droplets: "fine" },
    is_active: true,
    in_stock: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * SEED FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedProducts() {
  // Step 1: Delete all existing products first
  const deleteProductsResult = await prisma.products.deleteMany({});
  console.log(`   ✓ Deleted ${deleteProductsResult.count} old products`);

  // Step 2: Delete all existing categories
  const deleteCategoriesResult = await prisma.categories.deleteMany({});
  console.log(`   ✓ Deleted ${deleteCategoriesResult.count} old categories`);

  // Step 3: Create categories
  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.categories.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categories[cat.slug] = category.id;
    console.log(`   ✓ Created category: ${cat.name}`);
  }

  // Step 4: Create products
  let productsCreated = 0;
  for (const product of productsData) {
    const categoryId = categories[product.category_slug];
    if (!categoryId) {
      console.warn(`   ⚠ Category not found for product: ${product.name}`);
      continue;
    }

    const slug = `${generateSlug(product.name)}-${Date.now()}`;

    await prisma.products.create({
      data: {
        sku: product.sku,
        name: product.name,
        slug,
        category_id: categoryId,
        description: product.description,
        image_url: product.image_url,
        specifications: product.specifications,
        base_price: product.base_price,
        // brand_id: null, // Bỏ qua brand ở đây, sẽ seed riêng bằng seed-brands.ts
        is_active: product.is_active,
        in_stock: product.in_stock,
      },
    });

    console.log(`   ✓ Created product: ${product.name}`);
    productsCreated++;
  }

  return {
    deletedProducts: deleteProductsResult.count,
    deletedCategories: deleteCategoriesResult.count,
    createdCategories: Object.keys(categories).length,
    createdProducts: productsCreated,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET - SEED PRODUCTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function GET() {
  try {
    console.log("🚀 Starting product seed process...");

    const result = await seedProducts();

    console.log(`   ✓ Deleted ${result.deletedProducts} old products`);
    console.log(`   ✓ Deleted ${result.deletedCategories} old categories`);
    console.log(`   ✓ Created ${result.createdCategories} categories`);
    console.log(`   ✓ Created ${result.createdProducts} products`);

    return NextResponse.json({
      success: true,
      message: "Products seeded successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Seed error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Seeding failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
