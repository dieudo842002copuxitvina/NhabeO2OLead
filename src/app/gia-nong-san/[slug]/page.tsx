import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, TrendingUp, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import SeoMeta from "@/components/SeoMeta";
import { NhaBePricePageCTA } from "@/components/NhaBeConversionBox";
// We need a Client Component wrapper for the Recharts chart
import PriceChartClient from "./PriceChartClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const price = await prisma.marketPrice.findFirst({
    where: { cropSlug: params.slug },
    orderBy: { recordedAt: "desc" },
  });

  if (!price) {
    return { title: "Không tìm thấy giá nông sản" };
  }

  return {
    title: `Giá ${price.cropName} hôm nay | Bảng giá Nhà Bè Agri`,
    description: `Cập nhật biểu đồ giá ${price.cropName} mới nhất. Xem xu hướng giá, phân tích thị trường và kết nối trực tiếp với đại lý Nhà Bè Agri.`,
  };
}

export default async function CropPriceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Fetch current price
  const latestPrice = await prisma.marketPrice.findFirst({
    where: { cropSlug: params.slug },
    orderBy: { recordedAt: "desc" },
  });

  if (!latestPrice) {
    notFound();
  }

  // 2. Fetch price history for the chart (30 days)
  const history = await prisma.priceHistory.findMany({
    where: { cropSlug: params.slug },
    orderBy: { recordedAt: "asc" },
    take: 30,
  });

  // Map history to standard format if needed (or fallback to dummy for demo if db empty)
  // If db has no history, we will show empty state or fallback in Client Component
  
  const formatVND = (val: any) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-20">
      <SeoMeta
        title={`Giá ${latestPrice.cropName} - Cập nhật liên tục`}
        description={`Theo dõi biến động và xu hướng giá ${latestPrice.cropName}.`}
      />

      <div className="container max-w-4xl mx-auto px-4">
        {/* Breadcrumb / Back button */}
        <Link
          href="/gia-nong-san"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Bảng giá tổng hợp
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-full opacity-50 -z-10" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                Dữ liệu thị trường
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                {latestPrice.cropName}
              </h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  {latestPrice.region}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  Cập nhật: {new Date(latestPrice.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-2xl p-6 text-white text-right shadow-lg shadow-emerald-200">
              <p className="text-emerald-100 text-sm font-semibold mb-1 uppercase tracking-wide">Giá hiện tại</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-black">{formatVND(latestPrice.price)}</span>
                <span className="text-emerald-200 font-medium">/{latestPrice.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ lịch sử giá (Client Component) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Biểu đồ xu hướng giá 30 ngày
          </h2>
          <PriceChartClient 
            cropSlug={params.slug} 
            cropName={latestPrice.cropName} 
            historyData={history} 
            currentPrice={Number(latestPrice.price)} 
          />
        </div>

        {/* Móc nối O2O (Call to Action) */}
        <div className="mt-12">
          <NhaBePricePageCTA />
        </div>
      </div>
    </main>
  );
}
