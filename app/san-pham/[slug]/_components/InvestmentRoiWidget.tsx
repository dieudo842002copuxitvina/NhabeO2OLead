"use client";

import { useMemo, useState } from "react";

type InvestmentRoiWidgetProps = {
  productPrice: number;
};

export default function InvestmentRoiWidget({ productPrice }: InvestmentRoiWidgetProps) {
  const [areaHecta, setAreaHecta] = useState<number>(1);

  const paybackMonths = useMemo(() => {
    const safeArea = Math.max(0.1, areaHecta || 0.1);
    const estimatedMonthlyBenefit = safeArea * 3_500_000;
    return Math.max(1, Math.round(productPrice / estimatedMonthlyBenefit));
  }, [areaHecta, productPrice]);

  return (
    <section className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-green-900">Dự toán hiệu quả đầu tư</h2>

      <div className="mt-4 space-y-2">
        <label htmlFor="roi-hecta" className="text-sm font-medium text-green-900">
          Nhập diện tích rẫy (Hecta)
        </label>
        <input
          id="roi-hecta"
          type="number"
          min={0.1}
          step={0.1}
          value={areaHecta}
          onChange={(event) => setAreaHecta(Number(event.target.value) || 0.1)}
          className="h-11 w-full rounded-xl border border-green-200 bg-white px-3 text-gray-900 outline-none focus:border-green-700"
        />
      </div>

      <div className="mt-4 rounded-xl border border-green-200 bg-white p-4">
        <p className="text-sm text-gray-600">Thời gian thu hồi vốn ước tính</p>
        <p className="mt-1 text-3xl font-extrabold text-green-900">{paybackMonths} tháng</p>
        <p className="mt-2 text-sm text-green-800">
          Kết quả thực tế có thể tốt hơn. Liên hệ kỹ sư để chạy dự toán chi tiết.
        </p>
      </div>
    </section>
  );
}
