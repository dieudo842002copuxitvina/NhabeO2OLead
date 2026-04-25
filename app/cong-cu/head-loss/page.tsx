"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { matchNearestDealerFromSupabase, persistToolResult, submitToolLead, type MatchedDealer } from "@/lib/toolsO2O";

export default function HeadLossPage() {
  const [flowM3h, setFlowM3h] = useState(8);
  const [lengthM, setLengthM] = useState(220);
  const [diameterMm, setDiameterMm] = useState(60);
  const [dealer, setDealer] = useState<MatchedDealer>({ dealerId: null, dealerName: "Nhà Bè Agri", dealerPhone: "", dealerZalo: "", distanceKm: 0 });

  useEffect(() => {
    void matchNearestDealerFromSupabase().then(setDealer);
  }, []);

  const headLoss = useMemo(() => {
    const q = Math.max(flowM3h, 0.1);
    const l = Math.max(lengthM, 1);
    const d = Math.max(diameterMm / 1000, 0.01);
    return 10.67 * l * Math.pow(q / 3600, 1.852) / Math.pow(d, 4.871);
  }, [diameterMm, flowM3h, lengthM]);

  const handleSend = async () => {
    const payload = {
      toolKey: "head-loss",
      toolName: "Tổn thất cột áp",
      summary: `Q=${flowM3h}m3/h L=${lengthM}m D=${diameterMm}mm => Hf=${headLoss.toFixed(2)}m`,
      data: { flowM3h, lengthM, diameterMm, headLoss },
    };
    persistToolResult(payload);
    await submitToolLead(payload, dealer);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Tính tổn thất cột áp (Head Loss)</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Đầu vào</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="number" value={flowM3h} onChange={(e) => setFlowM3h(Number(e.target.value) || 0)} placeholder="Lưu lượng m3/h" />
            <Input type="number" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value) || 0)} placeholder="Chiều dài ống m" />
            <Input type="number" value={diameterMm} onChange={(e) => setDiameterMm(Number(e.target.value) || 0)} placeholder="Đường kính mm" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Kết quả</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p>Tổn thất cột áp ước tính: <b>{headLoss.toFixed(2)} m</b></p>
            <p className="text-xs text-muted-foreground">Dùng công thức Hazen-Williams để ước lượng nhanh cho thiết kế sơ bộ.</p>
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
