"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Droplets,
  Gauge,
  LandPlot,
  Layers3,
  Loader2,
  MapPin,
  MessageCircle,
  PhoneCall,
  Sprout,
  Waves,
} from "lucide-react";
import SeoMeta from "@/components/SeoMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DEALERS_DATA, type Dealer } from "@/data/dealers";
import { PRODUCTS_DATA, type Product } from "@/data/products";
import { DEFAULT_LOCATION, expandingRadiusSearch, haversineDistance } from "@/lib/geo";
import { submitGeneralLead } from "@/lib/supabaseQueries";
import ProductCard from "../../store/ProductCard";

type AreaUnit = "ha" | "cong";
type IrrigationModel = "sprinkler" | "drip";
type WaterSource = "pond" | "well" | "canal" | "river";

type CropOption = {
  value: string;
  label: string;
  densityPerHa: number;
};

type IrrigationConfig = {
  label: string;
  emittersPerPlant: number;
  flowLphPerEmitter: number;
  minPressureBar: number;
  emitterPrice: number;
  lateralFactor: number;
};

type BomItem = {
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

type MatchedDealer = Dealer & { distanceKm: number };

const CROP_OPTIONS: CropOption[] = [
  { value: "sau-rieng", label: "Sau rieng", densityPerHa: 156 },
  { value: "xoai", label: "Xoai", densityPerHa: 180 },
  { value: "ca-phe", label: "Ca phe", densityPerHa: 1250 },
  { value: "cam", label: "Cam/Quyt", densityPerHa: 400 },
  { value: "chuoi", label: "Chuoi", densityPerHa: 1500 },
];

const IRRIGATION_CONFIGS: Record<IrrigationModel, IrrigationConfig> = {
  sprinkler: {
    label: "Phun mua",
    emittersPerPlant: 2,
    flowLphPerEmitter: 60,
    minPressureBar: 2.4,
    emitterPrice: 4500,
    lateralFactor: 1.25,
  },
  drip: {
    label: "Nho giot",
    emittersPerPlant: 4,
    flowLphPerEmitter: 8,
    minPressureBar: 1.4,
    emitterPrice: 1900,
    lateralFactor: 1.85,
  },
};

const WATER_SOURCE_META: Record<WaterSource, { label: string; frictionFactor: number }> = {
  pond: { label: "Ao/Ho", frictionFactor: 1.02 },
  well: { label: "Gieng khoan", frictionFactor: 1.1 },
  canal: { label: "Kenh muong", frictionFactor: 1.06 },
  river: { label: "Sông", frictionFactor: 1.16 },
};

const MAIN_PIPE_PRICE_BY_DIA: Record<number, number> = {
  63: 48000,
  75: 69000,
  90: 92000,
  110: 125000,
};

const KEYWORDS = ["Tính toán vật tư tưới sầu riêng", "Cách chọn venturi cho 1ha cà phê"];

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
    Math.round(value),
  );

const round1 = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isValidPhone = (value: string) => /^(0|\+84)\d{9,10}$/.test(value.trim());

const toZaloPhone = (phone?: string): string | null => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("84")) return cleaned;
  if (cleaned.startsWith("0")) return `84${cleaned.slice(1)}`;
  return cleaned;
};

const hashText = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const shuffleBySeed = (products: Product[], seed: number) =>
  [...products].sort((left, right) => hashText(`${left.slug}-${seed}`) - hashText(`${right.slug}-${seed}`));

const pickCrossSellingProducts = (seed: number) => {
  const pool = PRODUCTS_DATA.filter(
    (product) => product.category === "HARDWARE" || product.category === "FERTILIZER",
  );
  return shuffleBySeed(pool, seed).slice(0, 4);
};

const setKeywordsMetaTag = (keywords: string[]) => {
  if (typeof document === "undefined") return;
  let meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "keywords");
    document.head.appendChild(meta);
  }
  meta.content = keywords.join(", ");
};

function LabelWithTooltip({ htmlFor, label, tip }: { htmlFor?: string; label: string; tip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <span className="group relative inline-flex cursor-help text-slate-400">
        <CircleHelp className="h-4 w-4" />
        <span className="pointer-events-none absolute left-1/2 top-[120%] z-20 hidden w-60 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-[11px] leading-4 text-white shadow-lg group-hover:block">
          {tip}
        </span>
      </span>
    </div>
  );
}

const readStoredLocation = (): { lat: number; lng: number } => {
  if (typeof window === "undefined") return DEFAULT_LOCATION;
  const raw = localStorage.getItem("agriflow:last_location");
  if (!raw) return DEFAULT_LOCATION;
  try {
    const parsed = JSON.parse(raw) as { lat?: number; lng?: number };
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return DEFAULT_LOCATION;
  }
  return DEFAULT_LOCATION;
};

const saveStoredLocation = (location: { lat: number; lng: number }) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("agriflow:last_location", JSON.stringify(location));
};

const resolveUserLocation = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(readStoredLocation());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        saveStoredLocation(next);
        resolve(next);
      },
      () => resolve(readStoredLocation()),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
    );
  });

const matchTopDealers = (origin: { lat: number; lng: number }): MatchedDealer[] => {
  const search = expandingRadiusSearch(
    origin,
    DEALERS_DATA,
    (dealer) => ({ lat: dealer.lat, lng: dealer.lng }),
    3,
    [25, 60, 120, 250, 500, 1000],
  );

  if (search.results.length > 0) {
    return search.results.map((item) => ({
      ...item.item,
      distanceKm: item.distance,
    }));
  }

  return DEALERS_DATA.map((dealer) => ({
    ...dealer,
    distanceKm: Math.round(haversineDistance(origin, { lat: dealer.lat, lng: dealer.lng })),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);
};

export default function ThuyLucPage() {
  const [step, setStep] = useState(1);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("ha");
  const [areaInput, setAreaInput] = useState(1.8);
  const [slopePercent, setSlopePercent] = useState(2);
  const [crop, setCrop] = useState<string>("sau-rieng");
  const [irrigationModel, setIrrigationModel] = useState<IrrigationModel>("sprinkler");
  const [waterSource, setWaterSource] = useState<WaterSource>("pond");
  const [pumpPressureBar, setPumpPressureBar] = useState(3.4);

  const [isMatchingDealers, setIsMatchingDealers] = useState(false);
  const [matchedDealers, setMatchedDealers] = useState<MatchedDealer[]>([]);
  const [userGeo, setUserGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [zaloHint, setZaloHint] = useState("");

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadRegion, setLeadRegion] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setKeywordsMetaTag(KEYWORDS);
  }, []);

  const areaHa = useMemo(() => {
    const normalized = Math.max(0.1, areaInput);
    return areaUnit === "ha" ? normalized : normalized / 10;
  }, [areaInput, areaUnit]);

  const calc = useMemo(() => {
    const selectedCrop = CROP_OPTIONS.find((item) => item.value === crop) ?? CROP_OPTIONS[0];
    const model = IRRIGATION_CONFIGS[irrigationModel];
    const source = WATER_SOURCE_META[waterSource];

    const areaM2 = areaHa * 10000;
    const plantCount = Math.max(1, Math.round(areaHa * selectedCrop.densityPerHa));
    const emitterCount = plantCount * model.emittersPerPlant;
    const zoningFactor = areaHa > 2 ? 0.58 : 0.76;
    const designFlowM3h = (emitterCount * model.flowLphPerEmitter * zoningFactor) / 1000;

    const staticHeadM = Math.max(1.5, slopePercent * 0.75);
    const frictionHeadM = (Math.sqrt(areaHa) * 6 + (irrigationModel === "sprinkler" ? 10 : 7)) * source.frictionFactor;
    const totalDynamicHeadM = 9 + staticHeadM + frictionHeadM;
    const requiredPressureBar = Math.max(model.minPressureBar, totalDynamicHeadM / 10);
    const pressureMargin = pumpPressureBar - requiredPressureBar;

    const mainPipeDiameter = designFlowM3h < 12 ? 63 : designFlowM3h < 24 ? 75 : designFlowM3h < 38 ? 90 : 110;
    const mainPipeLength = Math.round(Math.sqrt(areaM2) * 2.5);
    const subMainLength = Math.round(mainPipeLength * 1.7);
    const lateralLength = Math.round(plantCount * model.lateralFactor);
    const valveCount = Math.max(4, Math.ceil(areaHa * 4));
    const filterCount = areaHa > 3 ? 2 : 1;
    const recommendedPumpHp = Math.max(2, Math.ceil(((designFlowM3h * totalDynamicHeadM) / 186) * 2) / 2);

    const fertigationName = areaHa > 2 ? "Bơm định lượng" : "Venturi";
    const fertigationCost = areaHa > 2 ? 21000000 : 2800000;

    const bomItems: BomItem[] = [
      {
        name: "Ống chính HDPE",
        spec: `O${mainPipeDiameter} PN10`,
        quantity: mainPipeLength,
        unit: "m",
        unitPrice: MAIN_PIPE_PRICE_BY_DIA[mainPipeDiameter],
        total: mainPipeLength * MAIN_PIPE_PRICE_BY_DIA[mainPipeDiameter],
      },
      {
        name: "Ống nhánh PVC",
        spec: "O42 - O49",
        quantity: subMainLength,
        unit: "m",
        unitPrice: 36000,
        total: subMainLength * 36000,
      },
      {
        name: "Ống PE tưới",
        spec: irrigationModel === "sprinkler" ? "PE16 cho bec phun" : "PE16 cho day nho giot",
        quantity: lateralLength,
        unit: "m",
        unitPrice: irrigationModel === "sprinkler" ? 8200 : 6900,
        total: lateralLength * (irrigationModel === "sprinkler" ? 8200 : 6900),
      },
      {
        name: irrigationModel === "sprinkler" ? "Bec phun" : "Dau nho giot",
        spec: irrigationModel === "sprinkler" ? `${model.flowLphPerEmitter} L/h` : `${model.flowLphPerEmitter} L/h`,
        quantity: emitterCount,
        unit: "cai",
        unitPrice: model.emitterPrice,
        total: emitterCount * model.emitterPrice,
      },
      {
        name: "Cụm lọc trung tâm",
        spec: "Lọc đĩa + lọc cát",
        quantity: filterCount,
        unit: "bo",
        unitPrice: 4500000,
        total: filterCount * 4500000,
      },
      {
        name: "Van dieu ap/chia khu",
        spec: "Van 2 inch va phu kien",
        quantity: valveCount,
        unit: "cai",
        unitPrice: 320000,
        total: valveCount * 320000,
      },
      {
        name: "Cham phan",
        spec: fertigationName,
        quantity: 1,
        unit: "bo",
        unitPrice: fertigationCost,
        total: fertigationCost,
      },
      {
        name: "Máy bơm khuyến nghị",
        spec: `${recommendedPumpHp.toFixed(1)} HP`,
        quantity: 1,
        unit: "bo",
        unitPrice: recommendedPumpHp * 1950000,
        total: recommendedPumpHp * 1950000,
      },
    ];

    const totalBomCost = bomItems.reduce((sum, item) => sum + item.total, 0);
    const areaCong = areaHa * 10;
    const areaMau = areaCong / 10;

    const annualFertilizerBudget = areaHa * 30000000;
    const venturiAnnual = areaHa * 2000000 + annualFertilizerBudget * 0.12 + 1200000 + 200000;
    const dosingAnnual = areaHa * 800000 + annualFertilizerBudget * 0.04 + 3000000 + 1400000;
    const venturiInitial = 2800000;
    const dosingInitial = 21000000;
    const annualSavings = venturiAnnual - dosingAnnual;
    const paybackYears = annualSavings > 0 ? (dosingInitial - venturiInitial) / annualSavings : null;

    return {
      selectedCrop,
      model,
      source,
      areaM2,
      areaCong,
      areaMau,
      plantCount,
      emitterCount,
      designFlowM3h,
      requiredPressureBar,
      pressureMargin,
      mainPipeDiameter,
      recommendedPumpHp,
      bomItems,
      totalBomCost,
      comparison:
        areaHa > 2
          ? {
              venturi: { initial: venturiInitial, annual: venturiAnnual, year1: venturiInitial + venturiAnnual },
              dosing: { initial: dosingInitial, annual: dosingAnnual, year1: dosingInitial + dosingAnnual },
              annualSavings,
              paybackYears,
            }
          : null,
    };
  }, [areaHa, crop, irrigationModel, pumpPressureBar, slopePercent, waterSource]);

  const preliminaryDrawing = useMemo(() => {
    const topRows = calc.bomItems
      .slice(0, 5)
      .map((item) => `- ${item.name}: ${item.quantity.toLocaleString("vi-VN")} ${item.unit} (${item.spec})`)
      .join("\n");
    return [
      "BAN VE DU TOAN SO BO - TU DONG TAO",
      `Cay trong: ${calc.selectedCrop.label}`,
      `Dien tich: ${round1(areaHa)} ha`,
      `Mo hinh tuoi: ${calc.model.label}`,
      `Lưu lượng thiết kế: ${round1(calc.designFlowM3h)} m3/h`,
      `Áp lực yêu cầu: ${round1(calc.requiredPressureBar)} bar`,
      "Danh mục vật tư chính:",
      topRows,
    ].join("\n");
  }, [areaHa, calc]);

  const crossSellingProducts = useMemo(
    () => pickCrossSellingProducts(Math.round(calc.totalBomCost + calc.designFlowM3h * 100)),
    [calc.designFlowM3h, calc.totalBomCost],
  );

  const pressureStatus = calc.pressureMargin > 0.4 ? "Ổn định" : calc.pressureMargin > -0.2 ? "Sát ngưỡng" : "Thiếu áp";
  const pressureColor = calc.pressureMargin > 0.4 ? "#0f766e" : calc.pressureMargin > -0.2 ? "#d97706" : "#dc2626";
  const pressureBadge =
    calc.pressureMargin > 0.4
      ? { text: "Hệ thống ổn định", className: "bg-emerald-100 text-emerald-800 border-emerald-200" }
      : calc.pressureMargin > -0.2
        ? { text: "Cảnh báo: Áp lực vừa đủ", className: "bg-amber-100 text-amber-800 border-amber-200" }
        : { text: "Cảnh báo: Áp lực bơm không đủ", className: "bg-red-100 text-red-800 border-red-200" };

  const switchAreaUnit = (nextUnit: AreaUnit) => {
    if (nextUnit === areaUnit) return;
    const converted = nextUnit === "ha" ? areaInput / 10 : areaInput * 10;
    setAreaInput(round1(converted));
    setAreaUnit(nextUnit);
  };

  const runGeoMatch = async (): Promise<{ origin: { lat: number; lng: number }; dealers: MatchedDealer[] }> => {
    const origin = await resolveUserLocation();
    const top3 = matchTopDealers(origin);
    setUserGeo(origin);
    setMatchedDealers(top3);
    return { origin, dealers: top3 };
  };

  const openZaloWithNearestDealer = async (dealer: MatchedDealer) => {
    const quoteMessage = [
      `Xin chao ${dealer.name},`,
      "Tôi vừa tính dự toán hệ thống tưới và cần báo giá chi tiết.",
      `Cay: ${calc.selectedCrop.label} | Dien tich: ${round1(areaHa)} ha`,
      `Tổng BOM dự kiến: ${formatVnd(calc.totalBomCost)}`,
      `Lưu lượng: ${round1(calc.designFlowM3h)} m3/h | Áp lực yêu cầu: ${round1(calc.requiredPressureBar)} bar`,
      "Nhờ kỹ sư liên hệ tư vấn.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(quoteMessage);
      setZaloHint("Nội dung báo giá đã copy vào clipboard để dán nhanh trên Zalo.");
    } catch {
      setZaloHint("Bạn có thể gửi yêu cầu trực tiếp trên Zalo cho đại lý gần nhất.");
    }

    const zaloPhone = toZaloPhone(dealer.phone);
    if (zaloPhone) {
      window.open(`https://zalo.me/${zaloPhone}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleNhanBaoGia = async () => {
    setLeadFeedback(null);
    setShowLeadForm(true);
    setIsMatchingDealers(true);
    setZaloHint("");
    try {
      const { dealers } = await runGeoMatch();
      if (dealers[0]) {
        await openZaloWithNearestDealer(dealers[0]);
      }
    } finally {
      setIsMatchingDealers(false);
    }
  };

  const handleTuVanChuyenGia = async () => {
    setLeadFeedback(null);
    setShowLeadForm(true);
    if (!matchedDealers.length) {
      setIsMatchingDealers(true);
      try {
        await runGeoMatch();
      } finally {
        setIsMatchingDealers(false);
      }
    }
  };

  const handleSubmitLead = async () => {
    if (leadName.trim().length < 2) {
      setLeadFeedback({ type: "error", text: "Vui lòng nhập tên khách hàng hợp lệ." });
      return;
    }
    if (!isValidPhone(leadPhone)) {
      setLeadFeedback({ type: "error", text: "SĐT chưa đúng định dạng Việt Nam (0xxxxxxxxx hoặc +84xxxxxxxxx)." });
      return;
    }
    if (leadRegion.trim().length < 2) {
      setLeadFeedback({ type: "error", text: "Vui lòng nhập vùng trồng để kỹ thuật viên phân tuyến đúng khu vực." });
      return;
    }

    setLeadFeedback(null);
    setIsSubmittingLead(true);

    try {
      let dealers = matchedDealers;
      let origin = userGeo;
      if (!dealers.length) {
        const result = await runGeoMatch();
        dealers = result.dealers;
        origin = result.origin;
      }
      const pickedDealer = dealers[0] ?? null;

      await submitGeneralLead({
        customer_name: leadName.trim(),
        customer_phone: leadPhone.trim(),
        province: leadRegion.trim(),
        district: "",
        crop_type: `Du toan thuy luc - ${calc.selectedCrop.label}`,
        area_m2: Math.round(calc.areaM2),
        message: [
          "Lead từ công cụ thủy lực (Chốt đơn/Tư vấn chuyên gia).",
          `Đại lý ưu tiên: ${pickedDealer?.name ?? "Chưa xác định"}`,
          "",
          preliminaryDrawing,
        ].join("\n"),
        calculator_data: {
          areaHa,
          areaUnit,
          areaInput,
          slopePercent,
          crop: calc.selectedCrop.label,
          irrigationModel: calc.model.label,
          waterSource: calc.source.label,
          pumpPressureBar,
          userGeo: origin,
          bom: calc.bomItems,
          totalBomCost: calc.totalBomCost,
          nearestDealers: dealers.map((dealer) => ({
            id: dealer.id,
            name: dealer.name,
            phone: dealer.phone,
            distanceKm: dealer.distanceKm,
            province: dealer.region,
          })),
        },
        assigned_dealer_id: pickedDealer?.id ?? null,
        source: "cong-cu-thuy-luc",
      });

      setLeadFeedback({
        type: "success",
        text: `Kỹ thuật viên tại ${pickedDealer?.name ?? "đại lý gần nhất"} đã nhận được yêu cầu và sẽ gọi lại cho bạn trong 15 phút.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được yêu cầu. Vui lòng thử lại.";
      setLeadFeedback({ type: "error", text: message });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const stepItems = [
    { id: 1, title: "Thông tin vườn" },
    { id: 2, title: "Loai cay & mo hinh tuoi" },
    { id: 3, title: "Nguồn nước & áp lực bơm" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <SeoMeta
        title="Máy tính dự toán thủy lực | Tính toán vật tư tưới sầu riêng"
        description="Máy tính dự toán thủy lực theo bước: BOM realtime, geo-matching đại lý gần nhất, nhận báo giá qua Zalo và tư vấn chuyên gia cho tưới sầu riêng, cà phê."
      />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/cong-cu"
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lai hub cong cu
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Máy tính Dự toán Thủy lực</h1>
            <p className="mt-1 text-sm text-slate-500">
              Thiet ke nhanh, theo doi ap luc, cap nhat vat tu theo thoi gian thuc.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          <section className="lg:col-span-5 flex lg:sticky lg:top-24 lg:self-start">
            <Card className="h-full w-full border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-4">
                <CardTitle className="text-lg">Input theo buoc</CardTitle>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {stepItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStep(item.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                        step === item.id
                          ? "border-green-700 bg-green-50 text-green-800 font-semibold"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      <p className="font-semibold">Bước {item.id}</p>
                      <p className="mt-1 leading-tight">{item.title}</p>
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block text-sm font-medium text-slate-700">Quick Switch don vi dien tich</Label>
                      <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => switchAreaUnit("ha")}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            areaUnit === "ha" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                          )}
                        >
                          ha
                        </button>
                        <button
                          type="button"
                          onClick={() => switchAreaUnit("cong")}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            areaUnit === "cong" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                          )}
                        >
                          mau/cong
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area-input">{areaUnit === "ha" ? "Dien tich (ha)" : "Dien tich (cong)"}</Label>
                      <Input
                        id="area-input"
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={areaInput}
                        onChange={(event) => setAreaInput(clamp(Number(event.target.value) || 0.1, 0.1, 100))}
                      />
                      <p className="text-xs text-slate-500">
                        Quy doi: {round1(areaHa)} ha | {round1(calc.areaCong)} cong | {round1(calc.areaMau)} mau
                      </p>
                    </div>

                    <div className="space-y-2">
                      <LabelWithTooltip
                        htmlFor="slope-input"
                        label="Do doc dia hinh (%)"
                        tip="Do doc anh huong truc tiep den ton that ap luc o cuoi tuyen ong."
                      />
                      <Input
                        id="slope-input"
                        type="number"
                        min={0}
                        step={0.5}
                        value={slopePercent}
                        onChange={(event) => setSlopePercent(clamp(Number(event.target.value) || 0, 0, 25))}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Loai cay trong</Label>
                      <Select value={crop} onValueChange={setCrop}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chon loai cay" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Mo hinh tuoi</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIrrigationModel("sprinkler")}
                          className={cn(
                            "rounded-lg border p-3 text-left text-sm",
                            irrigationModel === "sprinkler"
                              ? "border-teal-600 bg-teal-50 text-teal-900"
                              : "border-slate-200 bg-white text-slate-600",
                          )}
                        >
                          <p className="font-semibold">Phun mua</p>
                          <p className="mt-1 text-xs">Phu nhanh, hop cay lau nam.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIrrigationModel("drip")}
                          className={cn(
                            "rounded-lg border p-3 text-left text-sm",
                            irrigationModel === "drip"
                              ? "border-teal-600 bg-teal-50 text-teal-900"
                              : "border-slate-200 bg-white text-slate-600",
                          )}
                        >
                          <p className="font-semibold">Nho giot</p>
                          <p className="mt-1 text-xs">Tiet kiem nuoc, chinh xac goc.</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nguồn nước</Label>
                      <Select value={waterSource} onValueChange={(value) => setWaterSource(value as WaterSource)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chon nguon nuoc" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(WATER_SOURCE_META).map(([key, item]) => (
                            <SelectItem key={key} value={key}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <LabelWithTooltip
                        htmlFor="pressure-input"
                        label="Áp lực bơm hiện có (bar)"
                        tip="Áp lực hiện có phải lớn hơn áp lực yêu cầu để đảm bảo các điểm cuối vẫn đủ nước."
                      />
                      <Input
                        id="pressure-input"
                        type="number"
                        min={1}
                        step={0.1}
                        value={pumpPressureBar}
                        onChange={(event) => setPumpPressureBar(clamp(Number(event.target.value) || 1, 1, 8))}
                      />
                      <p className="text-xs text-slate-500">
                        Áp lực yêu cầu: {round1(calc.requiredPressureBar)} bar | Dư áp: {round1(calc.pressureMargin)} bar
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
                    Quay lai
                  </Button>
                  <Button
                    type="button"
                    disabled={step === 3}
                    onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                    className="bg-teal-700 text-white hover:bg-teal-800"
                  >
                    Tiep tuc
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="lg:col-span-7 flex flex-col gap-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers3 className="h-5 w-5 text-teal-700" />
                    Live preview thuy luc
                  </CardTitle>
                  <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", pressureBadge.className)}>
                    {pressureBadge.text}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Lưu lượng thiết kế</p>
                    <p className="mt-1 text-lg font-semibold">{round1(calc.designFlowM3h)} m3/h</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Áp lực yêu cầu</p>
                    <p className="mt-1 text-lg font-semibold">{round1(calc.requiredPressureBar)} bar</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Ống chính</p>
                    <p className="mt-1 text-lg font-semibold">O{calc.mainPipeDiameter}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Bơm đề xuất</p>
                    <p className="mt-1 text-lg font-semibold">{calc.recommendedPumpHp.toFixed(1)} HP</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8fbff]">
                  <svg viewBox="0 0 760 320" className="h-auto w-full">
                    <rect x="10" y="20" width="740" height="280" rx="10" fill="#f8fbff" />
                    <path d="M10 60 H750 M10 100 H750 M10 140 H750 M10 180 H750 M10 220 H750 M10 260 H750" stroke="#e6eef7" strokeWidth="1" />
                    <path d="M60 20 V300 M120 20 V300 M180 20 V300 M240 20 V300 M300 20 V300 M360 20 V300 M420 20 V300 M480 20 V300 M540 20 V300 M600 20 V300 M660 20 V300 M720 20 V300" stroke="#e6eef7" strokeWidth="1" />
                    <rect x="40" y="125" width="110" height="74" rx="8" fill="#e2e8f0" stroke="#94a3b8" />
                    <text x="95" y="155" textAnchor="middle" fontSize="12" fill="#334155">
                      Nguồn nước
                    </text>
                    <text x="95" y="172" textAnchor="middle" fontSize="11" fill="#64748b">
                      {calc.source.label}
                    </text>

                    <rect x="185" y="128" width="100" height="68" rx="8" fill="#dbeafe" stroke="#60a5fa" />
                    <text x="235" y="154" textAnchor="middle" fontSize="12" fill="#1e3a8a">
                      Bơm
                    </text>
                    <text x="235" y="171" textAnchor="middle" fontSize="11" fill="#1e40af">
                      {calc.recommendedPumpHp.toFixed(1)} HP
                    </text>

                    <rect x="320" y="130" width="110" height="64" rx="8" fill="#ecfeff" stroke="#14b8a6" />
                    <text x="375" y="154" textAnchor="middle" fontSize="12" fill="#0f766e">
                      Lọc trung tâm
                    </text>
                    <text x="375" y="171" textAnchor="middle" fontSize="11" fill="#0f766e">
                      {calc.model.label}
                    </text>

                    <line x1="150" y1="162" x2="185" y2="162" stroke="#64748b" strokeWidth={3} />
                    <line x1="285" y1="162" x2="320" y2="162" stroke="#64748b" strokeWidth={3} />
                    <line x1="430" y1="162" x2="650" y2="162" stroke={pressureColor} strokeWidth={Math.max(3, calc.mainPipeDiameter / 22)} />

                    {[0, 1, 2, 3, 4].map((index) => {
                      const y = 74 + index * 40;
                      return (
                        <g key={index}>
                          <line x1="520" y1="162" x2="520" y2={y} stroke="#94a3b8" strokeWidth={2.5} />
                          <line
                            x1="520"
                            y1={y}
                            x2="694"
                            y2={y}
                            stroke={irrigationModel === "sprinkler" ? "#0284c7" : "#0f766e"}
                            strokeWidth={2}
                          />
                        </g>
                      );
                    })}

                    <rect x="540" y="225" width="185" height="56" rx="8" fill="#ffffff" stroke={pressureColor} />
                    <text x="552" y="246" fontSize="11" fill="#334155">
                      Trạng thái áp lực: {pressureStatus}
                    </text>
                    <text x="552" y="262" fontSize="11" fill="#334155">
                      Yêu cầu: {round1(calc.requiredPressureBar)} bar
                    </text>
                    <text x="552" y="276" fontSize="11" fill="#334155">
                      Du ap: {round1(calc.pressureMargin)} bar
                    </text>
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="h-5 w-5 text-teal-700" />
                  Bảng dự toán vật tư (BOM)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="w-[32%] px-3 py-3 font-semibold">Hạng mục</th>
                        <th className="w-[24%] px-3 py-3 font-semibold">Quy cách</th>
                        <th className="w-[14%] px-3 py-3 text-right font-semibold">Số lượng</th>
                        <th className="w-[15%] px-3 py-3 text-right font-semibold">Đơn giá</th>
                        <th className="w-[15%] px-3 py-3 text-right font-semibold">Thanh tien</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {calc.bomItems.map((item) => (
                        <tr key={item.name}>
                          <td className="px-3 py-3 text-slate-800">{item.name}</td>
                          <td className="px-3 py-3 text-slate-500">{item.spec}</td>
                          <td className="px-3 py-3 text-right text-slate-700 whitespace-nowrap">
                            {item.quantity.toLocaleString("vi-VN")} {item.unit}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-700 whitespace-nowrap">{formatVnd(item.unitPrice)}</td>
                          <td className="px-3 py-3 text-right font-medium text-slate-900 whitespace-nowrap">{formatVnd(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-emerald-200 bg-emerald-50/70">
                      <tr>
                        <td className="px-3 py-4 text-base font-bold text-emerald-900" colSpan={4}>
                          Tổng chi phí ước tính
                        </td>
                        <td className="px-3 py-4 text-right text-2xl font-extrabold text-emerald-900">
                          {formatVnd(calc.totalBomCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <section id="lead-handoff" className="space-y-5 rounded-2xl border border-green-200 bg-green-50 p-6 md:p-8">
                  <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-green-800">Tổng dự toán hiện tại</p>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-green-900 md:text-5xl">{formatVnd(calc.totalBomCost)}</p>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-green-900/85">
                      Nhận ngay danh mục vật tư BOM chi tiết và bản vẽ kỹ thuật sơ bộ cho rẫy của bạn.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      type="button"
                      onClick={handleNhanBaoGia}
                      className="h-14 w-full rounded-xl bg-[#0068FF] text-base font-bold text-white hover:bg-[#0058e6]"
                      disabled={isMatchingDealers}
                      data-tracking="last-click"
                    >
                      {isMatchingDealers ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Đang geo-matching đại lý gần nhất...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="mr-2 h-5 w-5" />
                          NHẬN BÁO GIÁ CHI TIẾT QUA ZALO
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTuVanChuyenGia}
                      className="h-12 w-full rounded-xl border-green-300 bg-white/80 text-green-900 hover:bg-white"
                    >
                      TƯ VẤN CHUYÊN GIA THIẾT KẾ
                    </Button>
                  </div>

                  {zaloHint && <p className="rounded-md bg-white/80 px-3 py-2 text-xs text-teal-800">{zaloHint}</p>}

                  {matchedDealers.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-800">Top 3 dai ly gan ban (Geo-matching tu DEALERS_DATA)</p>
                      <div className="mt-2 space-y-2">
                        {matchedDealers.map((dealer, index) => (
                          <div key={dealer.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                #{index + 1} {dealer.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                {dealer.region} • {dealer.distanceKm} km
                              </p>
                            </div>
                            <a
                              href={`tel:${dealer.phone}`}
                              className="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-white"
                            >
                              <PhoneCall className="mr-1 h-3 w-3" />
                              Goi
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showLeadForm && (
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">Gửi lead về portal đại lý</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <Label htmlFor="lead-name">Tên khách</Label>
                          <Input id="lead-name" value={leadName} onChange={(event) => setLeadName(event.target.value)} placeholder="Nguyen Van A" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="lead-phone">SDT</Label>
                          <Input
                            id="lead-phone"
                            value={leadPhone}
                            onChange={(event) => setLeadPhone(event.target.value)}
                            placeholder="0901234567"
                            inputMode="tel"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="lead-region">Vùng trồng</Label>
                          <Input id="lead-region" value={leadRegion} onChange={(event) => setLeadRegion(event.target.value)} placeholder="Dak Lak" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lead-drawing">Bản vẽ dự toán sơ bộ</Label>
                        <Textarea id="lead-drawing" value={preliminaryDrawing} readOnly className="min-h-[140px] bg-slate-50 font-mono text-xs" />
                      </div>
                      <Button
                        type="button"
                        onClick={handleSubmitLead}
                        disabled={isSubmittingLead}
                        className="h-11 w-full bg-teal-700 text-white hover:bg-teal-800"
                      >
                        {isSubmittingLead ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang gửi lead...
                          </>
                        ) : (
                          "CHỐT ĐƠN VÀ CHUYỂN LEAD CHO ĐẠI LÝ"
                        )}
                      </Button>

                      {leadFeedback && (
                        <div
                          className={cn(
                            "rounded-md border px-3 py-2 text-sm",
                            leadFeedback.type === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-red-200 bg-red-50 text-red-900",
                          )}
                        >
                          {leadFeedback.type === "success" && <CheckCircle2 className="mr-2 inline h-4 w-4" />}
                          {leadFeedback.text}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>

            {calc.comparison && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gauge className="h-5 w-5 text-teal-700" />
                    Comparison: Venturi vs. Bơm định lượng (diện tích &gt; 2ha)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-3 font-semibold">Giải pháp</th>
                          <th className="px-3 py-3 text-right font-semibold">Đầu tư ban đầu</th>
                          <th className="px-3 py-3 text-right font-semibold">Chi phí vận hành/năm</th>
                          <th className="px-3 py-3 text-right font-semibold">Tổng năm đầu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        <tr>
                          <td className="px-3 py-3">Venturi</td>
                          <td className="px-3 py-3 text-right">{formatVnd(calc.comparison.venturi.initial)}</td>
                          <td className="px-3 py-3 text-right">{formatVnd(calc.comparison.venturi.annual)}</td>
                          <td className="px-3 py-3 text-right font-medium">{formatVnd(calc.comparison.venturi.year1)}</td>
                        </tr>
                        <tr className="bg-teal-50/60">
                          <td className="px-3 py-3 font-medium">Bơm định lượng</td>
                          <td className="px-3 py-3 text-right font-medium">{formatVnd(calc.comparison.dosing.initial)}</td>
                          <td className="px-3 py-3 text-right font-medium">{formatVnd(calc.comparison.dosing.annual)}</td>
                          <td className="px-3 py-3 text-right font-semibold">{formatVnd(calc.comparison.dosing.year1)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-sm font-semibold text-teal-900">
                      Chenh lech van hanh moi nam: {formatVnd(calc.comparison.annualSavings)}
                    </p>
                    <p className="mt-1 text-sm text-teal-800">
                      {calc.comparison.paybackYears
                        ? `Hoàn vốn đầu tư thêm sau khoảng ${round1(calc.comparison.paybackYears)} năm.`
                        : "Với tham số hiện tại, chưa tạo được lợi thế hoàn vốn rõ ràng cho bơm định lượng."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <LandPlot className="mb-2 h-4 w-4 text-slate-700" />
                Mật độ cây: <strong>{calc.selectedCrop.densityPerHa}</strong> cây/ha
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Sprout className="mb-2 h-4 w-4 text-slate-700" />
                Tổng số cây: <strong>{calc.plantCount.toLocaleString("vi-VN")}</strong>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Waves className="mb-2 h-4 w-4 text-slate-700" />
                Đầu tư theo mô hình: <strong>{calc.model.label}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
            Thiết bị & Vật tư khuyên dùng cho hệ thống của bạn
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {crossSellingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
