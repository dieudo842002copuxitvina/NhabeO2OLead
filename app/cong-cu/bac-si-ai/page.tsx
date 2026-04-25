"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, MapPin, Phone, ScanLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { matchNearestDealerFromSupabase, persistToolResult, submitToolLead, type MatchedDealer } from "@/lib/toolsO2O";

type Diagnosis = {
  name: string;
  confidence: number;
  recommendation: string[];
};

const mockDiagnosis: Diagnosis = {
  name: "Đốm lá nấm + suy dinh dưỡng nhẹ",
  confidence: 91,
  recommendation: ["Fungicide Hexaconazole", "Bổ sung Canxi-Boron", "Tối ưu chu kỳ tưới 2 lần/ngày"],
};

export default function BacSiAiPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dealer, setDealer] = useState<MatchedDealer>({ dealerId: null, dealerName: "Nhà Bè Agri", dealerPhone: "", dealerZalo: "", distanceKm: 0 });

  useEffect(() => {
    void matchNearestDealerFromSupabase().then(setDealer);
  }, []);

  const suggestedKit = useMemo(
    () => [
      "Béc Rivulis D5000 PC",
      "Máy bơm Pentax CR 100",
      "Bộ lọc đĩa 120 mesh",
    ],
    []
  );

  const onPickImage = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setDiagnosis(null);
  };

  const runScan = () => {
    if (!preview) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDiagnosis(mockDiagnosis);
    }, 2400);
  };

  const handleSend = async () => {
    if (!diagnosis) return;
    const payload = {
      toolKey: "bac-si-ai",
      toolName: "Bác sĩ cây trồng AI",
      summary: `${diagnosis.name} (${diagnosis.confidence}%)`,
      data: { diagnosis, suggestedKit, dealer },
    };
    persistToolResult(payload);
    await submitToolLead(payload, dealer);
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Bác sĩ cây trồng AI</h1>
      <p className="mt-1 text-sm text-muted-foreground">Dùng Camera API để chụp ảnh lá cây, quét triệu chứng và kết nối đại lý gần nhất.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Chụp/Upload ảnh lá cây</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!preview ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Button onClick={() => fileRef.current?.click()}><Camera className="mr-1 h-4 w-4" /> Mở camera/chọn ảnh</Button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border">
                <img src={preview} alt="leaf" className="h-72 w-full object-cover" />
                {scanning && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981]"
                  />
                )}
              </div>
            )}
            <input ref={fileRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => onPickImage(e.target.files?.[0])} />
            <Button disabled={!preview || scanning} onClick={runScan}>
              <ScanLine className="mr-1 h-4 w-4" /> {scanning ? "Đang quét..." : "Bắt đầu quét laser"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Kết quả chẩn đoán & O2O</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!diagnosis ? (
              <p className="text-muted-foreground">Chưa có kết quả chẩn đoán.</p>
            ) : (
              <>
                <p>Bệnh nghi ngờ: <b>{diagnosis.name}</b></p>
                <p>Độ tin cậy: <b>{diagnosis.confidence}%</b></p>
                <ul className="list-disc space-y-1 pl-4">
                  {diagnosis.recommendation.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Bộ giải pháp có sẵn tại đại lý gần nhất</p>
                  <ul className="mt-1 list-disc pl-4">
                    {suggestedKit.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="font-medium">Đại lý: {dealer.dealerName} (~{dealer.distanceKm} km)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSend}><Send className="mr-1 h-4 w-4" /> Gửi kết quả này cho Đại lý gần nhất tư vấn</Button>
                    <Button asChild size="sm" variant="outline"><a href={`tel:${dealer.dealerPhone}`}><Phone className="mr-1 h-4 w-4" /> Gọi</a></Button>
                    <Button asChild size="sm" variant="outline"><a href={`https://zalo.me/${dealer.dealerZalo}`} target="_blank" rel="noreferrer"><MapPin className="mr-1 h-4 w-4" /> Zalo</a></Button>
                  </div>
                </div>
              </>
            )}
            <Button asChild variant="ghost" className="px-0"><Link href="/cong-cu">Quay lại Tools Hub</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
