/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SEED DEALERS API ROUTE                                          ║
 * ║  One-time script to seed 25 dealers for NHÀ BÈ AGRI O2O System  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Usage: GET /api/seed-dealers (seeds and returns results)
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const prisma = new PrismaClient();

/* ═══════════════════════════════════════════════════════════════════════════════
 * DEALER DATA - 25 NHÀ BÈ AGRI Dealers
 * ═══════════════════════════════════════════════════════════════════════════════ */

const dealersData = [
  {
    name: "NHÀ BÈ AGRI - HỒ CHÍ MINH HEAD OFFICE (Kho tổng)",
    phone: "0983230879",
    address: "Số 25, Khu Biệt Thự Ngân Long, X. Phước Kiển, H. Nhà Bè, HCM",
    province: "Hồ Chí Minh",
    district: "Nhà Bè",
    latitude: 10.7111,
    longitude: 106.7155,
    is_active: true,
  },
  {
    name: "NHÀ BÈ AGRI - VP GIA LAI",
    phone: "0969070077",
    address: "556 Trường Chinh, Pleiku, Gia Lai",
    province: "Gia Lai",
    district: "Pleiku",
    latitude: 13.9825,
    longitude: 108.067,
    is_active: true,
  },
  {
    name: "NHÀ BÈ AGRI - VP ĐĂK LẮK",
    phone: "0348877939",
    address: "Ngã 3 KoretVina, Xã PơngDrang, Đắk Lắk",
    province: "Đắk Lắk",
    district: "Krông Búk",
    latitude: 12.7139,
    longitude: 108.2375,
    is_active: true,
  },
  {
    name: "NHÀ BÈ AGRI - VP LÂM ĐỒNG",
    phone: "0355430003",
    address: "21 Nguyễn Thị Định, Đức Trọng, Lâm Đồng",
    province: "Lâm Đồng",
    district: "Đức Trọng",
    latitude: 11.7555,
    longitude: 108.4401,
    is_active: true,
  },
  {
    name: "NHÀ BÈ AGRI - VP HÀ NỘI",
    phone: "0944961555",
    address: "TT11-04, ngõ 22 Cửu Việt, Trâu Quỳ, Gia Lâm, Hà Nội",
    province: "Hà Nội",
    district: "Gia Lâm",
    latitude: 21.0958,
    longitude: 105.938,
    is_active: true,
  },
  {
    name: "NHÀ BÈ AGRI - VP ĐỒNG NAI",
    phone: "0345791468",
    address: "QL56, Duyên Lãng, Cẩm Mỹ, Đồng Nai",
    province: "Đồng Nai",
    district: "Cẩm Mỹ",
    latitude: 10.8311,
    longitude: 107.305,
    is_active: true,
  },
  {
    name: "DRIPTEC THẾ ANH",
    phone: "0346888599",
    address: "Thôn Eamkeng, Xã Eabar, Sông Hinh, Phú Yên",
    province: "Phú Yên",
    district: "Sông Hinh",
    latitude: 12.95,
    longitude: 109.05,
    is_active: true,
  },
  {
    name: "DRIPTEC HỮU THIỆN",
    phone: "0944764008",
    address: "Km46, TT Pơ Drang, Krông Búk, Đắk Lắk",
    province: "Đắk Lắk",
    district: "Krông Búk",
    latitude: 12.85,
    longitude: 108.25,
    is_active: true,
  },
  {
    name: "Đại lý Nông Hưng",
    phone: null,
    address: "7J46+X6F Đắk Song, Đắk Nông",
    province: "Đắk Nông",
    district: "Đắk Song",
    latitude: 12.252,
    longitude: 107.768,
    is_active: true,
  },
  {
    name: "CTY TNHH GIẢI PHÁP CN ỨNG DỤNG",
    phone: "0945810810",
    address: "77-79 Nguyễn Đình Chiểu, P.1, Cao Lãnh, Đồng Tháp",
    province: "Đồng Tháp",
    district: "Cao Lãnh",
    latitude: 10.4602,
    longitude: 105.6827,
    is_active: true,
  },
  {
    name: "Cửa hàng Thái Lợi",
    phone: "0963750153",
    address: "386 Hùng Vương, TT Phú Thiện, Gia Lai",
    province: "Gia Lai",
    district: "Phú Thiện",
    latitude: 13.55,
    longitude: 108.45,
    is_active: true,
  },
  {
    name: "Cửa hàng Gia Bách",
    phone: "0343954508",
    address: "Ấp 7, Xuân Tây, Cẩm Mỹ, Đồng Nai",
    province: "Đồng Nai",
    district: "Cẩm Mỹ",
    latitude: 10.81,
    longitude: 107.32,
    is_active: true,
  },
  {
    name: "Thế giới điện nước Đắk Nông",
    phone: "0358722799",
    address: "205 Quang Trung, P. Nghĩa Tân, Gia Nghĩa, Đắk Nông",
    province: "Đắk Nông",
    district: "Gia Nghĩa",
    latitude: 12.0025,
    longitude: 107.6836,
    is_active: true,
  },
  {
    name: "Cửa hàng Quốc Tú",
    phone: "0834560958",
    address: "Khu Đức Thọ, TT Đức Phong, Bù Đăng, Bình Phước",
    province: "Bình Phước",
    district: "Bù Đăng",
    latitude: 11.55,
    longitude: 106.85,
    is_active: true,
  },
  {
    name: "Đại lí Thành Nhung",
    phone: "0909764059",
    address: "Số 16 Ấp Hội Phú, Tân Châu, Tây Ninh",
    province: "Tây Ninh",
    district: "Tân Châu",
    latitude: 11.35,
    longitude: 106.15,
    is_active: true,
  },
  {
    name: "Cửa hàng điện nước Lâm Tuấn",
    phone: "0787558332",
    address: "113 ĐT713, Đức Hạnh, Đức Linh, Bình Thuận",
    province: "Bình Thuận",
    district: "Đức Linh",
    latitude: 10.95,
    longitude: 107.75,
    is_active: true,
  },
  {
    name: "HKD Điện Nước Quốc Thọ",
    phone: "0389655652",
    address: "Tổ 04, Ấp 07, Tân Thành, Tây Ninh",
    province: "Tây Ninh",
    district: "Tân Thành",
    latitude: 11.45,
    longitude: 106.05,
    is_active: true,
  },
  {
    name: "CTY TNHH GIẢI PHÁP AUTOTUTUOI",
    phone: "0355863232",
    address: "160 Hương lộ 15, Ấp 5, Thạnh Phú, Vĩnh Cửu, Đồng Nai",
    province: "Đồng Nai",
    district: "Vĩnh Cửu",
    latitude: 10.95,
    longitude: 107.05,
    is_active: true,
  },
  {
    name: "CTY TNHH MTV SX TM DV THÁI VIỆT",
    phone: "0908881880",
    address: "Số 62 đường số 6, Phường An Lạc, HCM",
    province: "Hồ Chí Minh",
    district: "Bình Tân",
    latitude: 10.75,
    longitude: 106.6,
    is_active: true,
  },
  {
    name: "CH NPP LỄ HẠT GIỐNG",
    phone: "0917872111",
    address: "213 QL1A, TT. Phú Long, Hàm Thuận Bắc, Bình Thuận",
    province: "Bình Thuận",
    district: "Hàm Thuận Bắc",
    latitude: 10.85,
    longitude: 108.05,
    is_active: true,
  },
  {
    name: "CTY TNHH TM XD VÀ MT CÔNG RÔ",
    phone: "0931223334",
    address: "Đường Nguyễn Văn Nhu, Mỹ Bình, Phan Rang-Tháp Chàm, Ninh Thuận",
    province: "Ninh Thuận",
    district: "Phan Rang-Tháp Chàm",
    latitude: 11.5643,
    longitude: 108.989,
    is_active: true,
  },
  {
    name: "CH Điện Nước Nga Quý",
    phone: "0988290624",
    address: "Tổ 6, Ấp 6, Xuân Tây, Cẩm Mỹ, Đồng Nai",
    province: "Đồng Nai",
    district: "Cẩm Mỹ",
    latitude: 10.82,
    longitude: 107.31,
    is_active: true,
  },
  {
    name: "Cửa hàng điện nước Hoà Thành",
    phone: "0928895724",
    address: "TT. Định Quán, Đồng Nai",
    province: "Đồng Nai",
    district: "Định Quán",
    latitude: 11.15,
    longitude: 107.25,
    is_active: true,
  },
  {
    name: "CH vật tư nông nghiệp Trường Giang",
    phone: "0868091762",
    address: "103 DT720, Thôn 8, Gia An, Tánh Linh, Lâm Đồng",
    province: "Lâm Đồng",
    district: "Tánh Linh",
    latitude: 11.55,
    longitude: 107.75,
    is_active: true,
  },
  {
    name: "Cửa Hàng Hà Phường 2",
    phone: null,
    address: "492 Lê Duẩn, Khu phố 7, Ninh Sơn, Khánh Hòa",
    province: "Khánh Hòa",
    district: "Ninh Sơn",
    latitude: 12.25,
    longitude: 109.15,
    is_active: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * SEED FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function seedDealers() {
  // Step 1: Delete all existing dealers
  const deleteResult = await prisma.dealer.deleteMany({});

  // Step 2: Create new dealers
  const createResult = await prisma.dealer.createMany({
    data: dealersData,
  });

  return { deleted: deleteResult.count, created: createResult.count };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET - SEED DEALERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function GET() {
  try {
    console.log("🚀 Starting dealer seed process...");

    const { deleted, created } = await seedDealers();

    console.log(`   ✓ Deleted ${deleted} old dealers`);
    console.log(`   ✓ Created ${created} new dealers`);

    return NextResponse.json({
      success: true,
      message: "Seeded successfully",
      deleted,
      created,
      totalDealers: created,
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
