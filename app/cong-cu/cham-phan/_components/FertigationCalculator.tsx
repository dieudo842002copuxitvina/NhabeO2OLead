"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CircleGauge, FlaskConical, SlidersHorizontal, Phone } from "lucide-react";
import InputWithSuffix from "./InputWithSuffix";
import ResultRow from "./ResultRow";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type FertigationCalculatorProps = {
  areaHa: number;
  flowM3h: number;
  targetEc: number;
  fertilizerKg: number;
  motherL: number;
  venturiLh: number;
  ratio: number;
  onAreaHaChange: (value: number) => void;
  onFlowM3hChange: (value: number) => void;
  onTargetEcChange: (value: number) => void;
  zaloHref: string;
  zaloMessage: string;
};

const REGIONS = [
  "Đắk Lắk",
  "Đắk Nông",
  "Gia Lai",
  "Lâm Đồng",
  "Bình Phước",
  "Miền Tây"
];

export default function FertigationCalculator({
  areaHa,
  flowM3h,
  targetEc,
  fertilizerKg,
  motherL,
  venturiLh,
  ratio,
  onAreaHaChange,
  onFlowM3hChange,
  onTargetEcChange,
  zaloHref,
  zaloMessage,
}: FertigationCalculatorProps) {
  const [region, setRegion] = useState(REGIONS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSubmitPhone = () => {
    if (!phone.trim()) {
      toast({ title: "⚠️ Lỗi", description: "Vui lòng nhập số điện thoại Zalo.", variant: "destructive" });
      return;
    }
    
    setModalOpen(false);
    toast({
      title: "✅ Đã gửi dự toán",
      description: `Kỹ thuật viên tại ${region} sẽ liên hệ với bạn qua Zalo ${phone} trong 15 phút tới.`,
    });
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <article className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:col-span-5">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <SlidersHorizontal className="h-5 w-5 text-[#4CAF50]" />
            Thiết lập đầu vào
          </h2>

          <div className="space-y-5">
            <InputWithSuffix
              id="area-ha"
              label="Diện tích vườn"
              value={areaHa}
              min={0}
              step={0.01}
              suffix="ha"
              onChange={onAreaHaChange}
            />

            <InputWithSuffix
              id="flow-m3h"
              label="Lưu lượng nước tưới dự kiến"
              value={flowM3h}
              min={0}
              step={0.1}
              suffix="m³/h"
              onChange={onFlowM3hChange}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Vùng trồng</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Chọn vùng trồng" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="target-ec" className="text-sm font-medium text-gray-700">
                  Mức EC mục tiêu
                </label>
                <span className="inline-flex w-14 justify-end rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold tabular-nums text-gray-700">
                  {targetEc.toFixed(1)}
                </span>
              </div>

              <input
                id="target-ec"
                type="range"
                min={0.5}
                max={3.5}
                step={0.1}
                value={targetEc}
                onChange={(event) => onTargetEcChange(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#4CAF50]"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5</span>
                <span>3.5</span>
              </div>
            </div>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-7">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <CircleGauge className="h-5 w-5 text-[#4CAF50]" />
            Kết quả tính toán
          </h2>

          <div className="space-y-3">
            <ResultRow label="Khối lượng phân bón" value={`${fertilizerKg.toFixed(1)} kg`} emphasize />
            <ResultRow label="Thể tích dung dịch mẹ" value={`${motherL.toFixed(1)} L`} />
            <ResultRow label="Lưu lượng hút Venturi" value={`${venturiLh.toFixed(1)} L/h`} />
            <ResultRow label="Tỷ lệ pha" value={`1 : ${ratio.toFixed(1)}`} />
          </div>

          <div className="mt-4 min-h-[58px]">
            {targetEc > 2.5 ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Cảnh báo: Mức EC cao, cần theo dõi kỹ để tránh ngộ độc rễ.
                </p>
              </div>
            ) : (
              <div className="h-[58px]" aria-hidden />
            )}
          </div>

          <div className="mt-auto flex justify-end pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-6 text-sm md:text-base font-bold text-white shadow-sm transition-colors hover:bg-[#0056d6]"
            >
              <Phone className="h-5 w-5" />
              Nhận báo giá & Tư vấn qua Zalo
            </button>
          </div>
        </article>
      </div>

      {/* Dialog cho SĐT Zalo */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhận tư vấn từ kỹ thuật viên</DialogTitle>
            <DialogDescription>
              Vui lòng nhập số điện thoại Zalo của bạn. Đội ngũ tại <strong>{region}</strong> sẽ phân tích và gửi báo giá vật tư phù hợp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại Zalo</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmitPhone}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#0068FF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0056d6]"
            >
              Gửi yêu cầu
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
