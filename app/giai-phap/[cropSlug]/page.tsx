import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Droplets, Zap, MapPin, Calculator, ArrowRight, 
  CheckCircle2, Phone, Leaf, Sun, Wind
} from "lucide-react";
import { SOLUTIONS_DATA } from "@/data/solutions";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  params: {
    cropSlug: string;
  };
};

// Static Generation cho SEO
export function generateStaticParams() {
  return SOLUTIONS_DATA.map((solution) => ({
    cropSlug: solution.cropSlug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const solution = SOLUTIONS_DATA.find((s) => s.cropSlug === params.cropSlug);
  if (!solution) {
    return {
      title: "Không tìm thấy giải pháp | Nhà Bè Agri",
    };
  }

  return {
    title: `${solution.title} | Nhà Bè Agri`,
    description: solution.description,
    openGraph: {
      title: solution.title,
      description: solution.description,
      images: [
        {
          url: solution.coverImage,
          width: 1200,
          height: 630,
          alt: solution.title,
        },
      ],
    },
  };
}

// Data cho Visual Diagram
const IRRIGATION_DIAGRAM = {
  components: [
    { icon: Droplets, label: "Nguồn nước", sub: "Bể chứa / Giếng khoan" },
    { icon: Zap, label: "Máy bơm", sub: "Bơm ly tâm công suất cao" },
    { icon: MapPin, label: "Bộ lọc trung tâm", sub: "Lọc đĩa 130 micron" },
    { icon: Droplets, label: "Đường ống chính", sub: "PVC / HDPE đường kính lớn" },
    { icon: Droplets, label: "Van phân phối", sub: "Van điện từ điều khiển" },
    { icon: Leaf, label: "Béc tưới", sub: "Béc bù áp / Béc nhỏ giọt" },
  ],
};

export default function SolutionDetailPage({ params }: Props) {
  const solution = SOLUTIONS_DATA.find((s) => s.cropSlug === params.cropSlug);

  if (!solution) {
    notFound();
  }

  // Lọc sản phẩm được khuyên dùng
  const recommendedProducts = PRODUCTS_DATA.filter((product) =>
    solution.recommendedProductSlugs.includes(product.slug)
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        
        {/* ── SECTION A: Hero Panel ── */}
        <section className="grid grid-cols-1 items-center gap-8 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 lg:p-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src={solution.coverImage}
              alt={solution.name}
              fill
              className="object-cover"
              priority
            />
            <Badge className="absolute top-4 left-4 bg-emerald-600 text-white border-0">
              {solution.name}
            </Badge>
          </div>
          
          <div className="flex flex-col justify-center">
            {/* Pain Point Headline */}
            <div className="inline-flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">
                Vấn đề: Tưới thủ công tốn 60% thời gian
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {solution.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {solution.description}
            </p>
            
            <ul className="mt-6 space-y-3">
              {solution.advantages.map((advantage, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-base text-gray-700">{advantage}</span>
                </li>
              ))}
            </ul>
            
            {/* Quick CTA in Hero */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/tinh-toan?crop=${solution.cropSlug}`} className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Tính vật tư ngay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:0900000000" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Gọi tư vấn
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── SECTION B: Visual Diagram (Sơ đồ nguyên lý) ── */}
        <section className="mt-12 rounded-2xl bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sơ Đồ Nguyên Lý Hệ Thống Tưới</h2>
              <p className="text-sm text-gray-500">Quy trình hoạt động từ nguồn nước đến cây trồng</p>
            </div>
          </div>
          
          {/* Diagram Visualization - Horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            <div className="flex items-center justify-center gap-3 md:gap-4 min-w-max">
              {IRRIGATION_DIAGRAM.components.map((comp, idx) => (
                <div key={comp.label} className="flex items-center gap-3 snap-start">
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-[120px] text-center hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                    <comp.icon className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="font-semibold text-sm text-gray-900">{comp.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{comp.sub}</span>
                  </div>
                  {idx < IRRIGATION_DIAGRAM.components.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            Hệ thống được thiết kế tối ưu cho địa hình Tây Nguyên với độ dốc lên đến 30%
          </p>
        </section>

        {/* ── SECTION C: Combo Thiết bị chuẩn (Cross-selling Grid) ── */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vật Tư Khuyên Dùng</h2>
                <p className="text-sm text-gray-500">Danh mục thiết bị chuẩn cho {solution.name}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/danh-muc?crop=${solution.cropSlug}`}>
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">Đang cập nhật danh sách thiết bị...</p>
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/danh-muc">
                  Xem danh mục sản phẩm
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* ── SECTION D: ROI Calculator ── */}
        <section className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Tiết Kiệm Bao Nhiêu Với Tưới Tự Động?</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>Giảm 50-60% chi phí nhân công tưới</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>Tiết kiệm 40% lượng nước sử dụng</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>Tăng 20-30% năng suất cây trồng</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-sm text-emerald-100 mb-2">Ước tính thời gian hoàn vốn</p>
              <p className="text-4xl font-bold text-amber-300">18-24 tháng</p>
              <Button asChild size="lg" className="mt-4 bg-white text-emerald-700 hover:bg-emerald-50">
                <Link href={`/tinh-toan?crop=${solution.cropSlug}`} className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Tính ROI cho rẫy của bạn
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── SECTION E: Lead Magnet ── */}
        <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Bạn cần dự toán chi tiết cho rẫy của mình?
            </h2>
            <p className="text-gray-600 mb-6">
              Để lại thông tin hoặc liên hệ kỹ thuật viên để nhận ngay bản thiết kế và báo giá trọn gói tối ưu nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/tinh-toan?crop=${solution.cropSlug}`} className="gap-2">
                  <Calculator className="w-5 h-5" />
                  Tính vật tư tự động
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                <a href="https://zalo.me/0900000000" target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Nhận báo giá qua Zalo
                </a>
              </Button>
            </div>
          </div>
        </section>

      </div>

      {/* ── STICKY CTA (Mobile Only) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 shadow-lg lg:hidden safe-area-inset-bottom">
        <Link href={`/tinh-toan?crop=${solution.cropSlug}`}>
          <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-bold shadow-lg gap-2">
            <span>🔥</span>
            Tính Toán Vật Tư Cho Rẫy Của Bạn
          </Button>
        </Link>
      </div>
    </main>
  );
}
