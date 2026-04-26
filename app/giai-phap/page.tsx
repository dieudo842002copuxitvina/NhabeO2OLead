import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, HelpingHand, Wrench, Headphones } from "lucide-react";
import { SOLUTIONS_DATA } from "@/data/solutions";

export const metadata: Metadata = {
  title: "Giải Pháp Nông Nghiệp Thông Minh Theo Loại Cây Trồng | Nhà Bè Agri",
  description:
    "Nhà Bè Agri cung cấp hệ sinh thái thiết bị đồng bộ, từ Drone xịt thuốc đến hệ thống tưới nhỏ giọt, giúp tối ưu hóa lợi nhuận cho từng mẫu rẫy.",
};

export default function SolutionsHubPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Section A: Hero (Định vị thương hiệu) */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Giải Pháp Nông Nghiệp Thông Minh</span>
            <span className="block text-[#4CAF50] mt-2">Theo Loại Cây Trồng</span>
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-base text-gray-500 sm:text-lg md:text-xl">
            Nhà Bè Agri cung cấp hệ sinh thái thiết bị đồng bộ, từ Drone xịt thuốc đến hệ thống tưới nhỏ giọt, giúp tối ưu hóa lợi nhuận cho từng mẫu rẫy.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600 font-medium">
            <span className="bg-gray-100 px-3 py-1 rounded-full">#Giải pháp tưới sầu riêng</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">#Kỹ thuật châm phân cà phê</span>
          </div>
        </section>

        {/* Section B: Lưới Giải Pháp (Solution Grid) */}
        <section className="mb-20">
          <h2 className="sr-only">Danh sách giải pháp nông nghiệp</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS_DATA.map((solution) => (
              <article
                key={solution.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-200">
                  <Image
                    src={solution.coverImage}
                    alt={`Giải pháp kỹ thuật cho cây ${solution.name}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {solution.name}
                  </h3>
                  
                  <ul className="mb-6 space-y-3 flex-1">
                    {solution.advantages.slice(0, 3).map((advantage, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-5 w-5 flex-shrink-0 text-[#4CAF50] mt-0.5" />
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/giai-phap/${solution.cropSlug}`}
                    className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 py-3 px-4 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-100 transition-all"
                  >
                    Khám phá giải pháp
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section C: Cam kết Kỹ thuật (Trust Signals) */}
        <section className="border-t border-gray-200 py-12 mb-12">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">Cam Kết Từ Đội Ngũ Nhà Bè Agri</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#4CAF50] mb-4">
                <HelpingHand className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tư vấn thiết kế miễn phí</h3>
              <p className="text-sm text-gray-500">Lên cấu hình tối ưu, phù hợp ngân sách và địa hình khu vực rẫy.</p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#4CAF50] mb-4">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lắp đặt tại vườn</h3>
              <p className="text-sm text-gray-500">Hỗ trợ giám sát thi công trực tiếp, bàn giao trọn gói hệ thống.</p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#4CAF50] mb-4">
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hỗ trợ kỹ thuật 24/7</h3>
              <p className="text-sm text-gray-500">Cam kết đồng hành cùng bà con suốt mùa vụ, xử lý nhanh sự cố.</p>
            </div>
          </div>
        </section>

        {/* Section D: Logic Chuyển Đổi (CTA Banner) */}
        <section className="rounded-3xl bg-[#4CAF50] p-8 text-center text-white shadow-md md:p-12">
          <h2 className="text-2xl font-extrabold md:text-3xl">Bạn đang bắt đầu canh tác loại cây mới?</h2>
          <p className="mt-3 text-base text-green-50 sm:text-lg">
            Đừng ngần ngại! Hãy liên hệ kỹ sư của chúng tôi để nhận hỗ trợ khảo sát thực địa và đưa ra mô hình thiết kế chuẩn nhất.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/dai-ly"
              data-tracking="last-click"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-[#4CAF50] shadow-lg hover:bg-gray-50 transition-all"
            >
              LIÊN HỆ TRẠM KỸ THUẬT GẦN NHẤT
            </Link>
          </div>
        </section>

        {/* Localized GEO Footer info */}
        <section className="mt-16 text-center text-xs text-gray-400">
          <p>Cung cấp trọn gói thiết bị & giải pháp tưới châm phân cho các vùng trọng điểm Tây Nguyên (Đắk Lắk, Gia Lai, Lâm Đồng, Kon Tum, Đắk Nông) và Đông Nam Bộ (Đồng Nai, Bình Phước, Tây Ninh, Bà Rịa - Vũng Tàu).</p>
        </section>

      </div>
    </main>
  );
}
