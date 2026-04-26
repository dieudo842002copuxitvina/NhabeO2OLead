"use client";

import Link from "next/link";
import { ArrowRight, CloudSun, Droplets, NotebookPen, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import SeoMeta from "@/components/SeoMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ToolStatus = "ready" | "coming";

type ToolItem = {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  href: string;
  status: ToolStatus;
  icon: React.ComponentType<{ className?: string }>;
};

const TOOLS: ToolItem[] = [
  {
    title: "Máy tính Dự toán Thủy lực & Châm phân",
    subtitle: "Fertigation Calculator",
    description: "Lên cấu hình ống, béc, venturi và vật tư theo diện tích để giảm chi phí đầu tư ban đầu.",
    badge: "Sẵn sàng",
    href: "/cong-cu/thuy-luc",
    status: "ready",
    icon: Droplets,
  },
  {
    title: "Radar Thời tiết & Cảnh báo Sương muối",
    subtitle: "Micro-climate Radar",
    description: "Theo dõi vi khí hậu tại vườn, nhận cảnh báo sớm khi có nguy cơ sương muối cục bộ.",
    badge: "Sắp ra mắt",
    href: "#",
    status: "coming",
    icon: CloudSun,
  },
  {
    title: "Tra cứu Sâu bệnh & Bác sĩ Nông y AI",
    subtitle: "Agri-Doctor AI",
    description: "Phân tích triệu chứng cây trồng nhanh và đề xuất phác đồ xử lý phù hợp theo từng giai đoạn.",
    badge: "Sẵn sàng",
    href: "/cong-cu/bac-si-ai",
    status: "ready",
    icon: Stethoscope,
  },
  {
    title: "Nhật ký Canh tác Điện tử",
    subtitle: "Digital Farming Log",
    description: "Ghi lại lịch bón phân, phun thuốc và truy xuất nhật ký canh tác theo chuẩn thực hành nông nghiệp.",
    badge: "Sắp ra mắt",
    href: "#",
    status: "coming",
    icon: NotebookPen,
  },
];

export default function CongCuHubPage() {
  const handleStart = (tool: ToolItem) => {
    if (tool.status === "coming") {
      toast.info(`Công cụ "${tool.title}" đang được hoàn thiện.`);
    }
  };

  return (
    <section className="bg-white text-gray-900">
      <SeoMeta
        title="Hub Công cụ Nông nghiệp - Nhà Bè Agri"
        description="Trung tâm công cụ tính toán và hỗ trợ kỹ thuật canh tác: thủy lực, vi khí hậu, nông y AI và nhật ký điện tử."
      />

      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4CAF50]">Tool Hub</p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Công cụ vận hành canh tác</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
          Chọn công cụ phù hợp để lập dự toán, theo dõi rủi ro thời tiết, chẩn đoán sâu bệnh và quản lý dữ liệu canh tác
          trên một giao diện thống nhất.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {TOOLS.map((tool) => (
          <Card
            key={tool.title}
            className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_28px_rgba(16,24,40,0.08)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E3F4E4] bg-[#F3FAF3]">
              <tool.icon className="h-6 w-6 text-[#4CAF50]" />
            </div>

            <div className="mb-3">
              <Badge
                variant="outline"
                className={
                  tool.status === "ready"
                    ? "border-[#BEE6C1] bg-[#F3FAF3] text-[#2F8E36]"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }
              >
                {tool.badge}
              </Badge>
            </div>

            <h3 className="mb-1 text-base font-semibold leading-6 text-gray-900">{tool.title}</h3>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">{tool.subtitle}</p>
            <p className="mb-6 line-clamp-2 min-h-10 text-sm leading-5 text-gray-600">{tool.description}</p>

            {tool.status === "ready" ? (
              <Button
                asChild
                variant="outline"
                className="mt-auto h-10 rounded-lg border-[#4CAF50] text-[11px] font-semibold tracking-[0.08em] text-[#2F8E36] hover:bg-[#F3FAF3] hover:text-[#2F8E36]"
              >
                <Link href={tool.href} className="inline-flex items-center gap-2">
                  BẮT ĐẦU SỬ DỤNG
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleStart(tool)}
                className="mt-auto h-10 rounded-lg border-[#CFE9D1] text-[11px] font-semibold tracking-[0.08em] text-[#4A7A4E] hover:bg-[#F8FCF8] hover:text-[#2F8E36]"
              >
                BẮT ĐẦU SỬ DỤNG
              </Button>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
