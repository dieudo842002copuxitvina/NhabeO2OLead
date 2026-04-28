import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Leaf, Scissors, Smartphone, Sprout } from "lucide-react";
import { SOLUTIONS_DATA } from "@/data/solutions";
import ROICalculator from "./_components/ROICalculator";
import SmartLeadForm from "./_components/SmartLeadForm";

export const metadata: Metadata = {
  title: "Giải Pháp Nông Nghiệp Thông Minh | All-In-One Turnkey Farm | Nhà Bè Agri",
  description:
    "Giải pháp All-In-One turnkey farm cho người bận rộn và giải pháp kỹ thuật chuyên biệt theo từng loại cây trồng.",
  alternates: {
    canonical: "/giai-phap",
  },
};

const turnkeySteps = [
  {
    id: "step-1",
    title: "Bước 1: Khảo sát địa hình & Phát quang",
    description:
      "Không chỉ là dọn cỏ, kỹ sư Nhà Bè Agri sẽ tiến hành lấy mẫu đất tại 5 điểm khác nhau để xét nghiệm chỉ số dinh dưỡng, đo độ dốc bằng máy định vị GPS để lập bản vẽ cao độ chính xác, đảm bảo hệ thống tưới sau này đồng đều 100%.",
    icon: Scissors,
    ctaLabel: null,
    href: null,
  },
  {
    id: "step-2",
    title: "Bước 2: Xử lý nền & Dưỡng đất",
    description:
      "Dựa trên kết quả xét nghiệm, chúng tôi thực hiện quy trình cải tạo đất 3 giai đoạn: Giải độc phèn/hữu cơ -> Bổ sung tập đoàn vi sinh vật có lợi -> Cân bằng pH đất bằng vôi tinh luyện và Humic nhập khẩu. Đây là nền tảng để cây bền gốc, ít sâu bệnh.",
    icon: Leaf,
    ctaLabel: "Mua Phân Hữu Cơ / Humic",
    href: "/danh-muc/phan-huu-co-vi-sinh",
  },
  {
    id: "step-3",
    title: "Bước 3: Xuống giống & Lắp đặt hệ thống tưới",
    description:
      "Sử dụng giống đầu dòng có chứng nhận. Hệ thống tưới sử dụng béc bù áp (PC) chống côn trùng, kết hợp bộ trung tâm lọc đĩa kép giúp loại bỏ hoàn toàn cặn bẩn, bảo vệ đầu tưới không bị tắc nghẽn trong 10 năm.",
    icon: Sprout,
    ctaLabel: "Tìm Đại lý cấp vật tư gần rẫy",
    href: "/dai-ly",
  },
  {
    id: "step-4",
    title: "Bước 4: Chuyển giao & Vận hành thông minh",
    description:
      "Bàn giao quyền điều khiển qua App Smartphone cho chủ đầu tư. Thiết lập chế độ tưới tự động theo cảm biến độ ẩm, giúp tiết kiệm 40% tiền điện và 50% lượng nước so với tưới truyền thống.",
    icon: Smartphone,
    ctaLabel: "Xem Bộ điều khiển IoT",
    href: "/danh-muc/bo-dieu-khien",
  },
];

export default function SolutionsHubPage() {
  const packageTiers = [
    {
      name: "Gói Khởi Tạo (Silver)",
      theme: "silver" as const,
      features: [
        "Khảo sát địa hình",
        "Cải tạo nền đất cơ bản",
        "Chọn và xuống giống chuẩn",
        "Hệ thống tưới van vặn thủ công",
      ],
      ctaLabel: "Nhận Báo Giá Cơ Bản",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
    {
      name: "Gói Bán Tự Động (Gold)",
      theme: "gold" as const,
      badge: "PHỔ BIẾN NHẤT",
      features: [
        "Tất cả của gói Khởi Tạo",
        "Hệ thống lọc trung tâm",
        "Bộ châm phân tự động (Venturi)",
        "Hẹn giờ tưới cơ bản",
        "Báo cáo tiến độ Zalo hàng tuần",
      ],
      ctaLabel: "Đăng Ký Gói Phổ Biến",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
    {
      name: "Gói Thông Minh (Diamond)",
      theme: "diamond" as const,
      features: [
        "Tất cả của gói Gold",
        "Trạm điều khiển IoT qua Smartphone",
        "Cảm biến độ ẩm đất/thời tiết",
        "Bay Drone định kỳ xịt thuốc",
        "Tài khoản theo dõi Dashboard riêng",
      ],
      ctaLabel: "Tư Vấn Gói Cao Cấp",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="relative isolate overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920&q=80"
            alt="Vườn cây nông nghiệp thông minh"
            fill
            className="object-cover opacity-35"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/88 to-emerald-800/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-green-100">
              PREMIUM TURNKEY SERVICE
            </p>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Giải Pháp All-In-One: Nông Trại Tự Động Cho Người Bận Rộn
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
              Bạn có đất trống ở quê nhưng sống tại thành phố? Nhà Bè Agri cung cấp dịch vụ "Chìa khóa trao tay" - Từ
              khâu dọn cỏ, cải tạo đất, xuống giống đến lắp đặt hệ thống tưới tự động có thể điều khiển qua điện
              thoại.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {turnkeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.id}
                  className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/90 text-green-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{step.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-green-100">{step.description}</p>
                  {step.href && step.ctaLabel ? (
                    <Link
                      href={step.href}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-green-900 transition hover:bg-white"
                    >
                      {step.ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="mt-4 inline-flex w-fit rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-green-100">
                      Đang triển khai
                    </span>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/40 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-green-50 sm:text-base">
                Gói tư vấn tổng thể cho dự án all-in-one: Khảo sát, dự toán, kế hoạch thi công và vận hành từ xa theo
                thực tế đất đai của bạn.
              </p>
              <SmartLeadForm
                source="hero-all-in-one"
                triggerLabel="NHẬN TƯ VẤN DỰ ÁN ALL-IN-ONE"
                triggerClassName="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-sm font-extrabold text-green-950 transition hover:bg-amber-400"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Tùy Chọn Gói Chăm Sóc & Vận Hành</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
            Chọn mức độ tự động hóa phù hợp với quỹ thời gian và ngân sách của bạn.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {packageTiers.map((tier) => {
            const isGold = tier.theme === "gold";
            const isDiamond = tier.theme === "diamond";

            return (
              <article
                key={tier.name}
                className={[
                  "relative flex h-full flex-col rounded-2xl p-6",
                  isGold
                    ? "scale-[1.02] border-2 border-emerald-500 bg-white shadow-xl lg:scale-[1.04]"
                    : isDiamond
                      ? "border border-amber-400/70 bg-gray-900 text-white shadow-lg"
                      : "border border-gray-200 bg-white shadow-sm",
                ].join(" ")}
              >
                {tier.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white">
                    {tier.badge}
                  </span>
                ) : null}

                <h3 className={["text-xl font-extrabold", isDiamond ? "text-white" : "text-gray-900"].join(" ")}>
                  {tier.name}
                </h3>

                <ul className="mt-5 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={`${tier.name}-${feature}`} className="flex items-start gap-2 text-sm leading-6">
                      <Check
                        className={[
                          "mt-0.5 h-5 w-5 shrink-0",
                          isDiamond ? "text-amber-500" : isGold ? "text-emerald-600" : "text-gray-400",
                        ].join(" ")}
                      />
                      <span className={isDiamond ? "text-gray-100" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isDiamond ? (
                  <SmartLeadForm
                    source="pricing-diamond"
                    triggerLabel={tier.ctaLabel}
                    triggerClassName="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-bold text-gray-900 transition hover:bg-amber-400"
                  />
                ) : (
                  <Link
                    href={tier.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "mt-6 inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-bold transition",
                      isGold
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50",
                    ].join(" ")}
                    data-tracking="last-click"
                  >
                    {tier.ctaLabel}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <ROICalculator />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <header className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Hiệu Quả Thực Tế Từ Các Dự Án All-In-One</h2>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80"
                  alt="Before - Cỏ rậm rạp trước khi triển khai dự án"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                  Before
                </span>
              </div>
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80"
                  alt="After - Hệ thống tưới vận hành ổn định"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  After
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">Dự án 2Ha Sầu Riêng tại Bù Đăng, Bình Phước</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Giảm 80% công tưới so với vận hành thủ công.</li>
                <li>• Tỷ lệ sống cây giống đạt 98% sau giai đoạn kiến thiết.</li>
              </ul>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=900&q=80"
                  alt="Before - Vườn cà phê trước khi cải tạo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                  Before
                </span>
              </div>
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=900&q=80"
                  alt="After - Vận hành tưới và châm phân cho vườn cà phê"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  After
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                Đã bàn giao
              </div>
              <h3 className="text-lg font-bold text-gray-900">Dự án 5Ha Cà Phê tại Đắk Nông</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Tối ưu lưu lượng tưới theo khu vực, giảm hao hụt nước đáng kể.</li>
                <li>• Quy trình vận hành ổn định, dễ theo dõi tiến độ từ xa qua Zalo.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4 pb-6">
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Câu Hỏi Thường Gặp Của Nhà Đầu Tư</h2>
        </header>

        <div className="space-y-3">
          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm" open>
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Tôi ở xa, làm sao kiểm soát được tiến độ và chất lượng?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Nhà Bè Agri thiết lập một hệ thống quản lý 3 lớp:
              <br />- Lớp 1: Camera giám sát AI 360 độ lắp đặt tại các vị trí trọng yếu.
              <br />- Lớp 2: Nhật ký điện tử được đội thợ cập nhật hàng ngày qua ứng dụng nội bộ (bao gồm ảnh chụp thực địa).
              <br />- Lớp 3: Báo cáo tự động từ cảm biến IoT (độ ẩm, pH, dinh dưỡng) gửi thẳng về Zalo của anh/chị mỗi 24h.
              Anh/chị hoàn toàn làm chủ vườn cây mà không cần có mặt tại hiện trường.
            </p>
          </details>

          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Bảo hành hệ thống và tỷ lệ sống của cây trồng ra sao?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Chúng tôi áp dụng quy trình "Bảo hiểm cây trồng":
              <br />- Cây giống được tuyển chọn từ các vườn ươm đối tác đạt chuẩn VietGAP.
              <br />- Trong 6 tháng đầu tiên, nếu cây chết do lỗi kỹ thuật hoặc giống, chúng tôi thay mới 100% miễn phí.
              <br />- Hệ thống tưới được bảo trì định kỳ 3 tháng/lần để đảm bảo không có cây nào bị thiếu nước hay úng cục bộ.
            </p>
          </details>

          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Rủi ro vận hành (Cúp điện/Mất mạng) được xử lý như thế nào?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Hệ thống được thiết kế với cơ chế "Fail-safe":
              <br />- Bộ điều khiển IoT có chế độ lưu kịch bản tưới Offline (tự chạy theo giờ dù mất mạng).
              <br />- Lắp đặt van xả khí và van an toàn để bảo vệ đường ống khi có sự cố áp lực.
              <br />- Luôn có hệ thống van tay song song để đội thợ địa phương có thể can thiệp thủ công ngay lập tức nếu
              có sự cố điện kéo dài.
            </p>
          </details>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
        <header className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Giải Pháp Kỹ Thuật Cho Từng Loại Cây Trồng</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
            Dành cho nhà nông chuyên nghiệp muốn tối ưu hóa năng suất và chi phí.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS_DATA.map((solution) => (
            <article
              key={solution.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
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
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/giai-phap/${solution.cropSlug}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
