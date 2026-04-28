import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Leaf, Scissors, Smartphone, Sprout } from "lucide-react";
import { SOLUTIONS_DATA } from "@/data/solutions";
import ROICalculator from "./_components/ROICalculator";
import SmartLeadForm from "./_components/SmartLeadForm";

export const metadata: Metadata = {
  title: "Giai Phap Nong Nghiep Thong Minh | All-In-One Turnkey Farm | Nha Be Agri",
  description:
    "Giai phap All-In-One turnkey farm cho nguoi ban ron va giai phap ky thuat chuyen biet theo tung loai cay trong.",
  alternates: {
    canonical: "/giai-phap",
  },
};

const turnkeySteps = [
  {
    id: "step-1",
    title: "Buoc 1: Khao sat & Phat quang",
    description: "Doi tho dia phuong don sach co dai va do dac dia hinh thuc te.",
    icon: Scissors,
    ctaLabel: null,
    href: null,
  },
  {
    id: "step-2",
    title: "Buoc 2: Cai tao nen dat",
    description: "Xu ly phen, kich re va nang do mau mo truoc khi xuong giong.",
    icon: Leaf,
    ctaLabel: "Mua Phan Huu Co / Humic",
    href: "/danh-muc/phan-huu-co-vi-sinh",
  },
  {
    id: "step-3",
    title: "Buoc 3: Chon giong & Lap dat tuoi",
    description: "Xuong giong chuan va thi cong he thong tuoi tu dong dong bo.",
    icon: Sprout,
    ctaLabel: "Tim Dai ly cap vat tu gan ray",
    href: "/dai-ly",
  },
  {
    id: "step-4",
    title: "Buoc 4: Quan ly tu xa (IoT)",
    description: "Theo doi do am va bam tuoi nuoc tren smartphone ngay tai van phong.",
    icon: Smartphone,
    ctaLabel: "Xem Bo dieu khien IoT",
    href: "/danh-muc/bo-dieu-khien",
  },
];

export default function SolutionsHubPage() {
  const packageTiers = [
    {
      name: "Goi Khoi Tao (Silver)",
      theme: "silver" as const,
      features: [
        "Khao sat dia hinh",
        "Cai tao nen dat co ban",
        "Chon va xuong giong chuan",
        "He thong tuoi van van thu cong",
      ],
      ctaLabel: "Nhan Bao Gia Co Ban",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
    {
      name: "Goi Ban Tu Dong (Gold)",
      theme: "gold" as const,
      badge: "PHO BIEN NHAT",
      features: [
        "Tat ca cua goi Khoi Tao",
        "He thong loc trung tam",
        "Bo cham phan tu dong (Venturi)",
        "Hen gio tuoi co ban",
        "Bao cao tien do Zalo hang tuan",
      ],
      ctaLabel: "Dang Ky Goi Pho Bien",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
    {
      name: "Goi Thong Minh (Diamond)",
      theme: "diamond" as const,
      features: [
        "Tat ca cua goi Gold",
        "Tram dieu khien IoT qua Smartphone",
        "Cam bien do am dat/thoi tiet",
        "Bay Drone dinh ky xit thuoc",
        "Tai khoan theo doi Dashboard rieng",
      ],
      ctaLabel: "Tu Van Goi Cao Cap",
      ctaHref: "https://zalo.me/YOUR_ZALO_OA",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="relative isolate overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920&q=80"
            alt="Vuon cay nong nghiep thong minh"
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
              Premium Turnkey Service
            </p>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Giai Phap All-In-One: Nong Trai Tu Dong Cho Nguoi Ban Ron
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
              Ban co dat trong o que nhung song tai thanh pho? Nha Be Agri cung cap dich vu "Chia khoa trao tay" - Tu
              khau don co, cai tao dat, xuong giong den lap dat he thong tuoi tu dong co the dieu khien qua dien
              thoai.
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
                      Dang trien khai
                    </span>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/40 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-green-50 sm:text-base">
                Goi tu van tong the cho du an all-in-one: Khao sat, du toan, ke hoach thi cong va van hanh tu xa theo
                thuc te dat dai cua ban.
              </p>
              <SmartLeadForm
                source="hero-all-in-one"
                triggerLabel="NHAN TU VAN DU AN ALL-IN-ONE"
                triggerClassName="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-sm font-extrabold text-green-950 transition hover:bg-amber-400"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Tuy Chon Goi Cham Soc & Van Hanh</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
            Chon muc do tu dong hoa phu hop voi quy thoi gian va ngan sach cua ban.
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
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Hieu Qua Thuc Te Tu Cac Du An All-In-One
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80"
                  alt="Before - Co ram rap truoc khi trien khai du an"
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
                  alt="After - He thong tuoi van hanh on dinh"
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
              <h3 className="text-lg font-bold text-gray-900">Du an 2Ha Sau Rieng tai Bu Dang, Binh Phuoc</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Giam 80% cong tuoi so voi van hanh thu cong.</li>
                <li>• Ty le song cay giong dat 98% sau giai doan kien thiet.</li>
              </ul>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="relative h-44 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=900&q=80"
                  alt="Before - Vuon ca phe truoc khi cai tao"
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
                  alt="After - Van hanh tuoi va cham phan cho vuon ca phe"
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
                Da ban giao
              </div>
              <h3 className="text-lg font-bold text-gray-900">Du an 5Ha Ca Phe tai Dak Nong</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Toi uu luu luong tuoi theo khu vuc, giam hao hut nuoc dang ke.</li>
                <li>• Quy trinh van hanh on dinh, de theo doi tien do tu xa qua Zalo.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4 pb-6">
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Cau Hoi Thuong Gap Cua Nha Dau Tu</h2>
        </header>

        <div className="space-y-3">
          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm" open>
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Toi o xa, lam sao kiem soat duoc tien do va chat luong?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Khach hang duoc cung cap tai khoan Client Portal, tich hop camera giam sat tai vuon va nhan bao cao Zalo
              tu dong hang tuan.
            </p>
          </details>

          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Bao hanh he thong va ty le song cua cay trong ra sao?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Nha Be Agri cam ket bao hanh thiet bi IoT 24 thang 1 doi 1. Ho tro ky thuat tron doi va cam ket ty le
              song cua giong dat tren 95%.
            </p>
          </details>

          <details className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-gray-900">
              Toi chua co dat, Nha Be Agri co ho tro tim quy dat khong?
            </summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Chung toi co mang luoi Dai ly rai khap cac tinh Tay Nguyen va Mien Nam, san sang ho tro anh/chi khao sat
              quy dat phu hop nhat voi ngan sach.
            </p>
          </details>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-14">
        <header className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Giai Phap Ky Thuat Cho Tung Loai Cay Trong
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
            Danh cho nha nong chuyen nghiep muon toi uu hoa nang suat va chi phi.
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
                  alt={`Giai phap nong nghiep cho ${solution.name}`}
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
                  Xem chi tiet
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
