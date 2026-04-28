"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import type { ProductCategory } from "@/data/products";

type LeadCaptureFormProps = {
  productCategory: ProductCategory;
};

type LeadFormState = {
  fullName: string;
  phone: string;
  province: string;
  area: string;
};

const INITIAL_STATE: LeadFormState = {
  fullName: "",
  phone: "",
  province: "",
  area: "",
};

export default function LeadCaptureForm({ productCategory }: LeadCaptureFormProps) {
  const [form, setForm] = useState<LeadFormState>(INITIAL_STATE);
  const [message, setMessage] = useState("");

  const ctaLabel =
    productCategory === "DRONE" ? "ĐĂNG KÝ BAY THỬ TẠI VƯỜN" : "NHẬN TƯ VẤN KỸ THUẬT";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.province.trim()) {
      setMessage("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Tỉnh/Thành.");
      return;
    }

    setMessage(
      `Yêu cầu đã được gửi đến Đại lý gần nhất tại ${form.province.trim()}. Chúng tôi sẽ liên hệ lại ngay.`,
    );
    setForm(INITIAL_STATE);
  };

  return (
    <section id="lead-form" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Nhận tư vấn O2O từ kỹ thuật viên</h2>
        <p className="mt-1 text-sm text-gray-600">
          Để lại thông tin để hệ thống kết nối đại lý gần khu vực vườn của bạn.
        </p>
      </header>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Họ tên</span>
            <input
              value={form.fullName}
              onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
              placeholder="Nguyễn Văn A"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Số điện thoại</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
              placeholder="09xxxxxxxx"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Vị trí (Tỉnh/Thành)</span>
            <input
              value={form.province}
              onChange={(e) => setForm((current) => ({ ...current, province: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
              placeholder="Đắk Lắk"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Diện tích vườn (ha)</span>
            <input
              value={form.area}
              onChange={(e) => setForm((current) => ({ ...current, area: e.target.value }))}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
              placeholder="5"
            />
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#256A29]"
        >
          <Send className="h-4 w-4" />
          {ctaLabel}
        </button>
      </form>

      {message ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-[#2F8E36]"
        >
          {message}
        </motion.p>
      ) : null}
    </section>
  );
}
