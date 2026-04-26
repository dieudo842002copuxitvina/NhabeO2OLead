"use client";

import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  Cpu,
  Database,
  Droplets,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Sprout,
  Stethoscope,
} from "lucide-react";
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A]">
      <SeoMeta
        title="Hub Công cụ Nông nghiệp - Nhà Bè Agri"
        description="Trung tâm công cụ tính toán và hỗ trợ kỹ thuật canh tác: thủy lực, vi khí hậu, nông y AI và nhật ký điện tử."
      />

      <div className="flex min-h-screen bg-[#FFFFFF]">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-[#E9ECEF] bg-[#FFFFFF] lg:flex">
          <div className="flex items-center gap-3 border-b border-[#E9ECEF] px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4CAF50] text-white">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4CAF50]">Nhà Bè Agri</p>
              <p className="text-base font-semibold text-[#1A1A1A]">Hub Công cụ</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            <Link
              href="/cong-cu"
              className="flex items-center gap-3 rounded-xl bg-[#F4FAF4] px-4 py-3 text-sm font-semibold text-[#2F8E36]"
            >
              <Cpu className="h-4 w-4 text-[#4CAF50]" />
              Hub Công cụ
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#F8FAFC] hover:text-[#1A1A1A]"
            >
              <LayoutDashboard className="h-4 w-4 text-[#9CA3AF]" />
              Tổng quan
            </Link>
            <Link
              href="/danh-muc"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#F8FAFC] hover:text-[#1A1A1A]"
            >
              <Database className="h-4 w-4 text-[#9CA3AF]" />
              Danh mục
            </Link>
            <Link
              href="/setting"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#F8FAFC] hover:text-[#1A1A1A]"
            >
              <Settings className="h-4 w-4 text-[#9CA3AF]" />
              Cài đặt
            </Link>
          </nav>
        </aside>

        <main className="flex-1 bg-[#FFFFFF] px-4 py-8 sm:px-6 lg:px-10">
          <header className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4CAF50]">Tool Hub</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">Công cụ vận hành canh tác</h1>
            <p className="max-w-3xl text-sm leading-6 text-[#5F6B7A] sm:text-base">
              Chọn công cụ phù hợp để lập dự toán, theo dõi rủi ro thời tiết, chẩn đoán sâu bệnh và quản lý dữ liệu canh tác
              trên một giao diện thống nhất.
            </p>
          </header>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {TOOLS.map((tool) => (
              <Card
                key={tool.title}
                className="flex h-full flex-col rounded-2xl border border-[#E9ECEF] bg-[#FFFFFF] p-5 shadow-[0_8px_24px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_12px_28px_rgba(16,24,40,0.08)]"
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
                        : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
                    }
                  >
                    {tool.badge}
                  </Badge>
                </div>

                <h3 className="mb-1 text-base font-semibold leading-6 text-[#1A1A1A]">{tool.title}</h3>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#7B8794]">{tool.subtitle}</p>
                <p className="mb-6 line-clamp-2 min-h-10 text-sm leading-5 text-[#5F6B7A]">{tool.description}</p>

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
          </section>
        </main>
      </div>
    </div>
  );
}
