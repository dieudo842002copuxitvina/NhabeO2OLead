"use client";

import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

type SmartLeadPayload = {
  province: string;
  scale: string;
  crop: string;
  zaloPhone: string;
  source?: string;
};

type SmartLeadFormProps = {
  triggerLabel: string;
  triggerClassName?: string;
  source?: string;
  onSubmit?: (payload: SmartLeadPayload) => Promise<void> | void;
};

const PROVINCE_OPTIONS = ["Gia Lai", "Bình Phước", "Đắk Lắk", "Lâm Đồng", "Đồng Nai"];
const SCALE_OPTIONS = ["Dưới 1 Ha", "1 - 3 Ha", "Trên 3 Ha"];
const CROP_OPTIONS = ["Sầu Riêng", "Cà Phê", "Trái cây khác"];

export default function SmartLeadForm({
  triggerLabel,
  triggerClassName,
  source = "giai-phap-all-in-one",
  onSubmit,
}: SmartLeadFormProps) {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState(PROVINCE_OPTIONS[0]);
  const [scale, setScale] = useState(SCALE_OPTIONS[1]);
  const [crop, setCrop] = useState(CROP_OPTIONS[0]);
  const [zaloPhone, setZaloPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!zaloPhone.trim()) return;

    setIsSubmitting(true);
    const payload: SmartLeadPayload = { province, scale, crop, zaloPhone: zaloPhone.trim(), source };

    if (onSubmit) {
      await onSubmit(payload);
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    alert(`Yêu cầu đã được ghi nhận. Kỹ sư khu vực ${province} sẽ liên hệ Zalo của bạn trong vòng 30 phút!`);
    setIsSubmitting(false);
    setOpen(false);
    setZaloPhone("");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName} data-tracking="last-click">
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[240] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Đăng Ký Tư Vấn Giải Pháp All-In-One</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Vui lòng cung cấp một số thông tin cơ bản để kỹ sư Nhà Bè Agri chuẩn bị phương án tốt nhất cho rẫy
                  của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Đóng form tư vấn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pb-6 sm:pb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Vị trí khu đất</label>
                <select
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {PROVINCE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Quy mô diện tích</label>
                <select
                  value={scale}
                  onChange={(event) => setScale(event.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {SCALE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Cây trồng dự kiến</label>
                <select
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CROP_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800">Số Zalo liên hệ</label>
                <input
                  type="text"
                  inputMode="tel"
                  required
                  value={zaloPhone}
                  onChange={(event) => setZaloPhone(event.target.value)}
                  placeholder="VD: 0901234567"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0068FF] text-sm font-extrabold text-white transition hover:bg-[#0058e6] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isSubmitting ? "Đang gửi..." : "GỬI YÊU CẦU TƯ VẤN"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
