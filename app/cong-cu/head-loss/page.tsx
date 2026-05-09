"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Phone, Send, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { matchNearestDealerFromSupabase, persistToolResult, submitToolLead, type MatchedDealer } from "@/lib/toolsO2O";
import { calculateFrictionLoss } from "@/lib/agri-engine/hydraulic";
import { findSuitablePipes } from "@/lib/agri-engine/smartBom";

export default function HeadLossPage() {
  const [flowM3h, setFlowM3h] = useState("8");
  const [lengthM, setLengthM] = useState("220");
  const [diameterMm, setDiameterMm] = useState("60");
  const [dealer, setDealer] = useState<MatchedDealer>({ dealerId: null, dealerName: "Nhà Bè Agri", dealerPhone: "", dealerZalo: "", distanceKm: 0 });

  const [headLossMeters, setHeadLossMeters] = useState<number | null>(null);
  const [pressureDropBar, setPressureDropBar] = useState<number | null>(null);
  const [suggestedPipes, setSuggestedPipes] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    void matchNearestDealerFromSupabase().then(setDealer);
  }, []);

  const handleCalculate = async () => {
    setErrorMsg("");
    setHeadLossMeters(null);
    setPressureDropBar(null);
    setSuggestedPipes([]);

    try {
      const q = Number(flowM3h);
      const l = Number(lengthM);
      const d = Number(diameterMm);

      if (Number.isNaN(q) || Number.isNaN(l) || Number.isNaN(d)) {
        throw new Error("Vui lòng nhập số liệu hợp lệ");
      }

      // 1. Tính tổn thất áp suất (Bar)
      // Chuyển m3/h -> L/h
      const loss = calculateFrictionLoss(q * 1000, l, d);
      setHeadLossMeters(loss.headLossMeters);
      setPressureDropBar(loss.pressureDropBar);

      // 2. Tìm ống thực tế phù hợp
      setIsCalculating(true);
      const pipes = await findSuitablePipes(d, loss.pressureDropBar);
      setSuggestedPipes(pipes);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSend = async () => {
    const payload = {
      toolKey: "head-loss",
      toolName: "Tổn thất cột áp & Smart BOM",
      summary: `Q=${flowM3h}m3/h L=${lengthM}m D=${diameterMm}mm => Hf=${headLossMeters?.toFixed(2) || 0}m (${pressureDropBar?.toFixed(2) || 0} bar)`,
      data: { flowM3h: Number(flowM3h), lengthM: Number(lengthM), diameterMm: Number(diameterMm), headLoss: headLossMeters, pressureDropBar },
    };
    persistToolResult(payload);
    await submitToolLead(payload, dealer);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl mb-2">Máy tính Thủy lực & Smart BOM</h1>
      <p className="text-muted-foreground mb-6">Tính toán tổn thất áp suất theo phương trình Hazen-Williams và tự động chọn vật tư phù hợp.</p>
      
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Thông số đầu vào</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lưu lượng dự kiến (m³/h)</label>
              <Input type="text" value={flowM3h} onChange={(e) => setFlowM3h(e.target.value)} placeholder="Ví dụ: 8" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chiều dài ống (m)</label>
              <Input type="text" value={lengthM} onChange={(e) => setLengthM(e.target.value)} placeholder="Ví dụ: 220" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đường kính trong dự kiến (mm)</label>
              <Input type="text" value={diameterMm} onChange={(e) => setDiameterMm(e.target.value)} placeholder="Ví dụ: 60" />
            </div>
            
            {errorMsg && <p className="text-sm text-red-600 font-semibold">{errorMsg}</p>}
            
            <Button onClick={handleCalculate} disabled={isCalculating} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tính toán
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Kết quả tính toán</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pressureDropBar !== null ? (
                <>
                  <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100">
                    <p>Tổn thất cột áp: <b>{headLossMeters?.toFixed(3)} mét</b></p>
                    <p>Tổn thất áp suất: <b>{pressureDropBar?.toFixed(3)} Bar</b></p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">Bấm "Tính toán" để xem kết quả.</p>
              )}
            </CardContent>
          </Card>

          {pressureDropBar !== null && (
            <Card>
              <CardHeader><CardTitle>Vật tư đề xuất</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {isCalculating ? (
                  <p className="text-sm text-slate-500">Đang truy vấn Database...</p>
                ) : suggestedPipes.length > 0 ? (
                  <div className="grid gap-3">
                    {suggestedPipes.map(pipe => (
                      <div key={pipe.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 hover:border-emerald-300">
                        <div className="flex items-center gap-3">
                          <Package className="h-8 w-8 text-slate-400" />
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">{pipe.name}</p>
                            <p className="text-xs text-muted-foreground">ĐK: {getSpec(pipe, 'duong_kinh_mm') || getSpec(pipe, 'diameter')}mm | Áp: {getSpec(pipe, 'ap_suat_chiu_dung_bar') || getSpec(pipe, 'workingPressure')} bar</p>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/store/${pipe.slug}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Không tìm thấy vật tư nào đáp ứng cấu hình này.</p>
                )}
                
                <div className="pt-4 mt-4 border-t">
                  <p className="text-sm mb-2">Đại lý ủy quyền gần nhất: <b>{dealer.dealerName}</b> (~{dealer.distanceKm} km)</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSend}><Send className="mr-1 h-4 w-4" /> Gửi yêu cầu tư vấn</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getSpec(pipe: any, key: string) {
  try {
    const s = typeof pipe.specifications === 'string' ? JSON.parse(pipe.specifications) : pipe.specifications;
    return s?.[key];
  } catch { return null; }
}
