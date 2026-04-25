"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { matchNearestDealerFromSupabase, persistToolResult, submitToolLead, type MatchedDealer } from "@/lib/toolsO2O";

export default function RoiPage() {
  const [investment, setInvestment] = useState(120000000);
  const [savingPerMonth, setSavingPerMonth] = useState(12000000);
  const [extraRevenuePerMonth, setExtraRevenuePerMonth] = useState(8000000);
  const [dealer, setDealer] = useState<MatchedDealer>({ dealerId: null, dealerName: "Nhà Bè Agri", dealerPhone: "", dealerZalo: "", distanceKm: 0 });

  useEffect(() => {
    void matchNearestDealerFromSupabase().then(setDealer);
  }, []);

  const roi = useMemo(() => {
    const monthlyGain = Math.max(savingPerMonth + extraRevenuePerMonth, 1);
    const paybackMonths = investment / monthlyGain;
    const annualRoi = (monthlyGain * 12) / Math.max(investment, 1) * 100;
    return { monthlyGain, paybackMonths, annualRoi };
  }, [extraRevenuePerMonth, investment, savingPerMonth]);

  const handleSend = async () => {
    const payload = {
      toolKey: "roi",
      toolName: "Máy tính ROI",
      summary: `Hoàn vốn ${roi.paybackMonths.toFixed(1)} tháng, ROI ${roi.annualRoi.toFixed(1)}%/năm`,
      data: { investment, savingPerMonth, extraRevenuePerMonth, ...roi },
    };
    persistToolResult(payload);
    await submitToolLead(payload, dealer);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Máy tính ROI</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Đầu vào tài chính</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value) || 0)} placeholder="Chi phí đầu tư (VND)" />
            <Input type="number" value={savingPerMonth} onChange={(e) => setSavingPerMonth(Number(e.target.value) || 0)} placeholder="Tiết kiệm/tháng (VND)" />
            <Input type="number" value={extraRevenuePerMonth} onChange={(e) => setExtraRevenuePerMonth(Number(e.target.value) || 0)} placeholder="Doanh thu tăng/tháng (VND)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Kết quả ROI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p>Lợi ích ròng mỗi tháng: <b>{Math.round(roi.monthlyGain).toLocaleString("vi-VN")} VND</b></p>
            <p>Thời gian hoàn vốn: <b>{roi.paybackMonths.toFixed(1)} tháng</b></p>
            <p>ROI năm đầu: <b>{roi.annualRoi.toFixed(1)}%</b></p>
            <p>Đại lý gần nhất: <b>{dealer.dealerName}</b> (~{dealer.distanceKm} km)</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSend}><Send className="mr-1 h-4 w-4" /> Gửi kết quả này cho Đại lý gần nhất tư vấn</Button>
              <Button asChild size="sm" variant="outline"><a href={`tel:${dealer.dealerPhone}`}><Phone className="mr-1 h-4 w-4" /> Gọi</a></Button>
              <Button asChild size="sm" variant="outline"><a href={`https://zalo.me/${dealer.dealerZalo}`} target="_blank" rel="noreferrer"><MapPin className="mr-1 h-4 w-4" /> Zalo</a></Button>
            </div>
            <Button asChild variant="ghost" className="px-0"><Link href="/cong-cu">Quay lại Tools Hub</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
