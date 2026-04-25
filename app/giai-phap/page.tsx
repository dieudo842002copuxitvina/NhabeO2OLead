"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    title: "Giải pháp tưới Sầu riêng",
    summary: "Thiết kế nhỏ giọt đa điểm, bù áp tốt cho vườn địa hình dốc, tối ưu lượng nước và phân.",
    badge: "Công nghệ Israel",
    metric: "Tiết kiệm 40% nước",
    image:
      "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Giải pháp tưới Cảnh quan",
    summary: "Phun mưa phân khu thông minh cho resort, khu đô thị và công viên, cân bằng thẩm mỹ và hiệu suất.",
    badge: "Tưới bù áp",
    metric: "Đồng đều lưu lượng +/-5%",
    image:
      "https://images.unsplash.com/photo-1598193957011-39b9f2916992?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Giải pháp Nhà màng",
    summary: "Hệ thống tưới dinh dưỡng chính xác theo chu kỳ, tích hợp cảm biến để tối ưu môi trường canh tác.",
    badge: "Tự động hóa thông minh",
    metric: "Giảm 30% chi phí vận hành",
    image:
      "https://images.unsplash.com/photo-1444392061186-9fc38f84f726?auto=format&fit=crop&w=1200&q=80",
  },
];

const reasons = [
  {
    title: "Thiết bị chính hãng",
    description: "Đối tác phân phối uy tín, đầy đủ chứng từ và tiêu chuẩn kỹ thuật.",
    icon: ShieldCheck,
  },
  {
    title: "Kỹ sư hiện trường",
    description: "Khảo sát trực tiếp tại vườn, cấu hình đúng theo địa hình và cây trồng.",
    icon: UserCheck,
  },
  {
    title: "Bảo hành dài hạn",
    description: "Cam kết đồng hành sau lắp đặt với quy trình bảo trì định kỳ rõ ràng.",
    icon: Droplets,
  },
];

export default function GiaiPhapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=80"
            alt="Hero giải pháp tưới tiêu"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/75 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.35),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(34,197,94,0.25),transparent_35%)]" />
        </div>
        <div className="relative container py-16 md:py-24">
          <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
            Premium Solution Portfolio
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Kiến tạo hệ sinh thái tưới tiêu bền vững
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-emerald-50/90 md:text-base">
            Triển khai giải pháp trọn vòng đời từ khảo sát, thiết kế, thi công đến vận hành tối ưu cho từng mô hình canh tác.
          </p>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {solutions.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Card className="group overflow-hidden border-white/20 bg-white/10 backdrop-blur-xl">
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold">
                    {item.badge}
                  </div>
                  <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button asChild size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                      <Link href="/lien-he">Liên hệ tư vấn</Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-200/90">{item.summary}</p>
                  <p className="mt-3 inline-flex rounded-md border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                    {item.metric}
                  </p>
                  <Button asChild variant="outline" className="mt-4 w-full border-white/35 bg-white/5 text-white hover:bg-white/15">
                    <Link href="/lien-he">
                      Xem quy trình kỹ thuật <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container pb-10">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl md:p-8">
          <h2 className="text-2xl font-bold md:text-3xl">Tại sao chọn chúng tôi</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reasons.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/20 bg-slate-900/40 p-4">
                <item.icon className="h-6 w-6 text-emerald-300" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-14 md:pb-16">
        <div className="rounded-2xl border border-emerald-200/35 bg-gradient-to-r from-emerald-600/70 to-emerald-500/60 p-6 text-white shadow-xl md:p-10">
          <h2 className="text-2xl font-bold md:text-3xl">Bạn đang cần giải pháp riêng cho khu vườn của mình?</h2>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/95 md:text-base">
            Đội ngũ kỹ sư Nhà Bè Agri sẵn sàng khảo sát và đề xuất phương án phù hợp theo ngân sách và địa hình thực tế.
          </p>
          <Button asChild className="mt-5 bg-slate-950 text-white hover:bg-slate-900">
            <Link href="/lien-he">Gửi yêu cầu khảo sát</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
