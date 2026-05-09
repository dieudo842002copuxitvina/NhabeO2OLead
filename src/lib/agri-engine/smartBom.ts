"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tìm kiếm các sản phẩm ống phù hợp với yêu cầu áp suất và đường kính
 * @param requiredDiameterMm Đường kính yêu cầu (mm)
 * @param maxPressureBar Áp suất tối đa hệ thống yêu cầu (bar)
 * @returns Danh sách 3 ống phù hợp nhất
 */
export async function findSuitablePipes(requiredDiameterMm: number, maxPressureBar: number) {
  try {
    // Truy vấn tất cả sản phẩm thuộc danh mục liên quan đến "Ống"
    const allPipes = await prisma.products.findMany({
      where: {
        categories: {
          name: {
            contains: "Ống",
            mode: "insensitive"
          }
        },
        is_active: true
      },
      include: {
        brands: true
      }
    });

    const suitablePipes = allPipes.filter(pipe => {
      try {
        // Parse trường JSON technical_params/specifications một cách an toàn
        // Vì Prisma trả về JSON/Object, ta cần handle cẩn thận
        const specs = typeof pipe.specifications === 'string' 
          ? JSON.parse(pipe.specifications) 
          : pipe.specifications as Record<string, any>;
          
        if (!specs) return false;

        // So sánh đường kính và áp suất chịu đựng
        // Dựa trên schema ProductForm, các field này thường có tên:
        // duong_kinh_mm, ap_suat_chiu_dung_bar
        const diameter = Number(specs.duong_kinh_mm || specs.diameter || 0);
        const pressure = Number(specs.ap_suat_chiu_dung_bar || specs.workingPressure || specs.pressure || 0);

        return diameter >= requiredDiameterMm && pressure >= maxPressureBar;
      } catch (e) {
        // Nếu parse lỗi hoặc dữ liệu bị thiếu thì bỏ qua sản phẩm này
        return false;
      }
    });

    // Ưu tiên thương hiệu Nhà Bè Agri (nếu có)
    suitablePipes.sort((a, b) => {
      const isANhaBe = a.brands?.name?.toLowerCase().includes("nhà bè agri") ? 1 : 0;
      const isBNhaBe = b.brands?.name?.toLowerCase().includes("nhà bè agri") ? 1 : 0;
      return isBNhaBe - isANhaBe;
    });

    return suitablePipes.slice(0, 3);
  } catch (error) {
    console.error("Error finding suitable pipes:", error);
    return [];
  }
}
