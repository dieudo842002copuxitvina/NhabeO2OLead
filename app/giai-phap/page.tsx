import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Headphones, HelpingHand, Wrench } from "lucide-react";
import { SOLUTIONS_DATA } from "@/data/solutions";

export const metadata: Metadata = {
  title: "Giải Pháp Nông Nghiệp Thông Minh Theo Loại Cây Trồng | Nhà Bè Agri",
  description:
    "Giải pháp tưới sầu riêng, kỹ thuật châm phân cà phê và hệ sinh thái thiết bị đồng bộ giúp tối ưu lợi nhuận nông trại.",
  alternates: {
    canonical: "/giai-phap",
  },
};

const trustSignals = [
  {
    title: "Tư vấn thiết kế miễn phí",
    description: "Lên cấu hình tối ưu theo địa hình, nguồn nước và ngân sách thực tế.",
    icon: HelpingHand,
  },
  {
    title: "Lắp đặt tại vườn",
    description: "Triển khai trực tiếp tại vườn và bàn giao quy trình vận hành rõ ràng.",
    icon: Wrench,
  },
  {
    title: "Hỗ trợ kỹ thuật 24/7",
    description: "Đội ngũ kỹ thuật đồng hành xuyên suốt mùa vụ, phản hồi nhanh tại địa phương.",
    icon: Headphones,
  },
];

export default function SolutionsHubPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <section className="mb-14 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Giải Pháp Nông Nghiệp Thông Minh Theo Loại Cây Trồng
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">
            Nhà Bè Agri cung cấp hệ sinh thái thiết bị đồng bộ, từ Drone xịt thuốc đến hệ thống tưới nhỏ giọt,
            giúp tối ưu hóa lợi nhuận cho từng mẫu rẫy.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Giải pháp tưới sầu riêng theo địa hình thực tế</h2>
          <p className="mb-8 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            Chọn đúng cấu hình từ đầu sẽ giúp tăng độ ổn định tưới, giảm rủi ro nghẹt béc và tối ưu chi phí nhân công
            theo từng khu vực canh tác.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS_DATA.map((solution) => (
              <article
                key={solution.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={solution.coverImage}
                    alt={`Giải pháp nông nghiệp cho ${solution.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={solution.id === "sol-01"}
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">{solution.name}</h3>

                  <ul className="mb-6 flex-1 space-y-3">
                    {solution.advantages.slice(0, 3).map((advantage, index) => (
                      <li key={`${solution.id}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-gray-700">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#4CAF50]" />
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/giai-phap/${solution.cropSlug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                  >
                    Khám phá giải pháp
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-2xl bg-gray-50 p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">Kỹ thuật châm phân cà phê và cam kết đồng hành</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <article key={signal.title} className="rounded-xl bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <Icon className="h-6 w-6 text-[#4CAF50]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{signal.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{signal.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-[#4CAF50] p-8 text-center text-white shadow-sm md:p-12">
          <h2 className="text-2xl font-extrabold md:text-3xl">Bạn đang bắt đầu canh tác loại cây mới?</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-green-50">
            Đội kỹ thuật Nhà Bè Agri sẽ giúp bạn khảo sát, đề xuất cấu hình phù hợp và triển khai thực tế tại vườn.
          </p>
          <Link
            href="/dai-ly"
            data-tracking="last-click"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#2E7D32] transition-colors hover:bg-gray-100"
          >
            LIÊN HỆ TRẠM KỸ THUẬT GẦN NHẤT
          </Link>
        </section>

        <section className="mt-12 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-lg font-bold text-gray-900">Nội dung địa phương hóa theo vùng canh tác trọng điểm</h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            Tại Tây Nguyên (Đắk Lắk, Gia Lai, Lâm Đồng, Kon Tum, Đắk Nông), chúng tôi ưu tiên giải pháp tưới sầu riêng
            và kỹ thuật châm phân cà phê phù hợp địa hình đồi dốc. Với Đông Nam Bộ (Đồng Nai, Bình Phước, Tây Ninh, Bà
            Rịa - Vũng Tàu), hệ thống được tối ưu theo điều kiện nắng nóng và nhu cầu vận hành quy mô trang trại.
          </p>
        </section>
      </div>
    </main>
  );
}
