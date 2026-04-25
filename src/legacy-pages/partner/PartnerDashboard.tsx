import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, MapPin, Package, Inbox, Wrench, QrCode, Wallet,
  Sprout, CheckCircle2, Camera, TrendingUp, Store, HardHat,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// ───────────────────────── Mock data ─────────────────────────
type StockItem = { id: string; name: string; sku: string; available: boolean };
const INITIAL_STOCK: StockItem[] = [
  { id: 'p1', name: 'Béc tưới BS5000-Pro', sku: 'BS5000', available: true },
  { id: 'p2', name: 'Ống LDPE 20mm (cuộn 100m)', sku: 'LDPE-20', available: true },
  { id: 'p3', name: 'Bộ lọc đĩa 2"', sku: 'FLT-DSK-2', available: false },
  { id: 'p4', name: 'Van điện từ 24V', sku: 'SOL-24', available: true },
  { id: 'p5', name: 'Bộ châm phân Venturi', sku: 'VNT-1', available: false },
];

type DealerLead = {
  id: string; name: string; crop: string; location: string;
  phoneMasked: string; minutesAgo: number;
};
const DEALER_LEADS: DealerLead[] = [
  { id: 'L-201', name: 'A. Tuấn',  crop: 'Sầu riêng', location: 'Đắk Mil, Đắk Nông', phoneMasked: '0987.***.123', minutesAgo: 5 },
  { id: 'L-202', name: 'C. Hằng',  crop: 'Cà phê',    location: 'Bảo Lộc, Lâm Đồng',  phoneMasked: '0912.***.456', minutesAgo: 22 },
  { id: 'L-203', name: 'A. Phúc',  crop: 'Hồ tiêu',   location: 'Chư Sê, Gia Lai',     phoneMasked: '0938.***.789', minutesAgo: 41 },
];

type Job = { id: string; title: string; distanceKm: number; payout: string; type: 'install' | 'repair' };
const JOBS: Job[] = [
  { id: 'J-301', title: 'Lắp mới hệ thống tưới sầu riêng 1.5ha', distanceKm: 3, payout: '2.500.000đ', type: 'install' },
  { id: 'J-302', title: 'Sửa chữa béc tưới bị nghẹt – vườn cà phê', distanceKm: 5, payout: '450.000đ',  type: 'repair' },
  { id: 'J-303', title: 'Bảo trì bộ lọc đĩa định kỳ',              distanceKm: 8, payout: '300.000đ',  type: 'repair' },
];

// ───────────────────────── Page ─────────────────────────
export default function PartnerDashboard() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="container max-w-4xl py-5 md:py-8">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Cổng Đối Tác</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Nhà Bè Agri – Partner Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demo song song giao diện Đại lý & Thợ thi công.
          </p>
        </header>

        <Tabs defaultValue="dealer" className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-12 p-1 bg-muted/60 mb-5">
            <TabsTrigger
              value="dealer"
              className="h-10 text-sm md:text-base font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
            >
              <Store className="w-4 h-4" /> Giao diện Đại lý
            </TabsTrigger>
            <TabsTrigger
              value="installer"
              className="h-10 text-sm md:text-base font-semibold gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow"
            >
              <HardHat className="w-4 h-4" /> Giao diện Thợ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dealer" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="dealer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <DealerView />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="installer" className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key="installer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <InstallerView />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ───────────────────────── Dealer View ─────────────────────────
function DealerView() {
  const { toast } = useToast();
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [acceptedLeads, setAcceptedLeads] = useState<Set<string>>(new Set());

  const toggleStock = (id: string) => {
    setStock(prev =>
      prev.map(it => {
        if (it.id !== id) return it;
        const next = !it.available;
        toast({
          title: next ? '✅ Đã bật: Sẵn hàng' : '⏸ Đã tắt: Chờ nhập hàng',
          description: it.name,
        });
        return { ...it, available: next };
      })
    );
  };

  const acceptLead = (lead: DealerLead) => {
    setAcceptedLeads(prev => new Set(prev).add(lead.id));
    toast({
      title: '🌿 Đã tiếp nhận tư vấn',
      description: `${lead.name} – ${lead.crop} – ${lead.location}`,
    });
  };

  const availableCount = stock.filter(s => s.available).length;

  return (
    <div className="space-y-5">
      {/* KPI summary */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="SP sẵn hàng" value={`${availableCount}/${stock.length}`} icon={<Package className="w-4 h-4" />} accent="primary" />
        <KpiCard label="Lead mới"    value={DEALER_LEADS.length.toString()}      icon={<Inbox className="w-4 h-4" />}   accent="accent"  />
        <KpiCard label="Đã tiếp nhận" value={acceptedLeads.size.toString()}      icon={<CheckCircle2 className="w-4 h-4" />} accent="success" />
      </div>

      {/* Quick stock management */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Quản lý kho nhanh
          </CardTitle>
          <p className="text-xs text-muted-foreground">Bật/tắt trạng thái sẵn hàng — đồng bộ ngay với khách hàng tìm kiếm.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {stock.map(item => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-muted/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base text-foreground truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase">{item.sku}</Badge>
                    <span className={`text-xs font-medium ${item.available ? 'text-success' : 'text-muted-foreground'}`}>
                      {item.available ? '● Sẵn hàng tại kho' : '○ Chờ nhập hàng'}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={item.available}
                  onCheckedChange={() => toggleStock(item.id)}
                  className="scale-150 data-[state=checked]:bg-success data-[state=unchecked]:bg-muted-foreground/40"
                  aria-label={`Toggle stock for ${item.name}`}
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* New leads */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            Khách hàng mới (Leads)
          </CardTitle>
          <p className="text-xs text-muted-foreground">Số điện thoại được ẩn tự động cho đến khi bạn tiếp nhận.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEALER_LEADS.map(lead => {
            const taken = acceptedLeads.has(lead.id);
            return (
              <motion.div
                key={lead.id}
                whileHover={{ scale: 1.005 }}
                className={`rounded-xl border-2 p-4 transition-all ${
                  taken ? 'border-success/40 bg-success/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <Badge variant="outline" className="text-[11px] bg-secondary/10 text-secondary border-secondary/30">
                        <Sprout className="w-3 h-3 mr-1" /> {lead.crop}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{lead.minutesAgo} phút trước</span>
                    </div>
                    <p className="font-bold text-base text-foreground">{lead.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {lead.location}
                    </p>
                    <p className="text-sm font-mono mt-1.5 flex items-center gap-1.5 text-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {taken ? lead.phoneMasked.replace(/\*/g, '7') : lead.phoneMasked}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  disabled={taken}
                  onClick={() => acceptLead(lead)}
                  className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-60"
                >
                  {taken ? (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Đã tiếp nhận</>
                  ) : (
                    <><Phone className="w-5 h-5 mr-2" /> Tiếp nhận tư vấn</>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ───────────────────────── Installer View (PWA-style) ─────────────────────────
function InstallerView() {
  const { toast } = useToast();
  const [acceptedJobs, setAcceptedJobs] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [walletBalance, setWalletBalance] = useState(4_850_000);

  const acceptJob = (job: Job) => {
    setAcceptedJobs(prev => new Set(prev).add(job.id));
    toast({
      title: '🛠 Đã nhận việc',
      description: `${job.title} — ${job.payout}`,
    });
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setWalletBalance(b => b + 150_000);
      toast({
        title: '✅ Bảo hành đã kích hoạt',
        description: 'Mã QR BS5000-2024-A88. Cộng 150.000đ vào ví.',
      });
    }, 1800);
  };

  return (
    <div className="space-y-5 max-w-md mx-auto">
      {/* Wallet — hero */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Ví của tôi
            </span>
            <TrendingUp className="w-4 h-4 opacity-70" />
          </div>
          <p className="font-display text-4xl font-bold text-accent leading-none">
            {walletBalance.toLocaleString('vi-VN')}
            <span className="text-xl ml-1 opacity-90">đ</span>
          </p>
          <p className="text-xs mt-2 opacity-80">Hoa hồng tháng này · Rút về MoMo / Bank</p>
          <Button
            size="sm"
            className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10"
          >
            Rút tiền ngay
          </Button>
        </CardContent>
      </Card>

      {/* Nearby jobs */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Việc làm quanh đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {JOBS.map(job => {
            const taken = acceptedJobs.has(job.id);
            return (
              <motion.div
                key={job.id}
                whileTap={{ scale: 0.985 }}
                className={`rounded-xl border-2 p-3.5 transition-colors ${
                  taken ? 'border-success/50 bg-success/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className={
                      job.type === 'install'
                        ? 'bg-primary/10 text-primary border-primary/30 text-[10px]'
                        : 'bg-accent/10 text-accent border-accent/30 text-[10px]'
                    }
                  >
                    {job.type === 'install' ? 'Lắp mới' : 'Sửa chữa'}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> Cách bạn {job.distanceKm}km
                  </span>
                </div>
                <p className="font-semibold text-sm leading-snug text-foreground mb-1">{job.title}</p>
                <p className="text-accent font-bold text-base mb-2.5">{job.payout}</p>
                <Button
                  size="lg"
                  disabled={taken}
                  onClick={() => acceptJob(job)}
                  className={`w-full h-11 font-semibold ${
                    taken
                      ? 'bg-success hover:bg-success text-success-foreground'
                      : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  }`}
                >
                  {taken ? (
                    <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Đã nhận việc</>
                  ) : (
                    'Nhận việc'
                  )}
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Warranty QR scanner placeholder */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Kích hoạt bảo hành điện tử
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl bg-foreground/95 overflow-hidden flex items-center justify-center cursor-pointer select-none"
            onClick={simulateScan}
          >
            {/* corner brackets */}
            <span className="absolute top-3 left-3 w-8 h-8 border-l-4 border-t-4 border-accent rounded-tl-lg" />
            <span className="absolute top-3 right-3 w-8 h-8 border-r-4 border-t-4 border-accent rounded-tr-lg" />
            <span className="absolute bottom-3 left-3 w-8 h-8 border-l-4 border-b-4 border-accent rounded-bl-lg" />
            <span className="absolute bottom-3 right-3 w-8 h-8 border-r-4 border-b-4 border-accent rounded-br-lg" />

            {/* scan line */}
            {scanning && (
              <motion.span
                initial={{ top: '12%' }}
                animate={{ top: '88%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="absolute left-6 right-6 h-0.5 bg-accent shadow-[0_0_12px_hsl(var(--accent))]"
              />
            )}

            <div className="text-center text-background/80">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <p className="text-sm font-medium">{scanning ? 'Đang quét…' : 'Chạm để mở camera'}</p>
              <p className="text-[11px] opacity-70 mt-0.5">Đưa mã QR vào khung ngắm</p>
            </div>
          </div>
          <Button
            onClick={simulateScan}
            disabled={scanning}
            size="lg"
            className="w-full h-12 mt-3 font-semibold bg-primary hover:bg-primary/90"
          >
            <QrCode className="w-5 h-5 mr-2" />
            {scanning ? 'Đang kích hoạt…' : 'Quét mã QR thiết bị'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ───────────────────────── Shared bits ─────────────────────────
function KpiCard({
  label, value, icon, accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: 'primary' | 'accent' | 'success';
}) {
  const tone =
    accent === 'primary' ? 'text-primary border-primary/30 bg-primary/5' :
    accent === 'accent'  ? 'text-accent border-accent/30 bg-accent/5'   :
    'text-success border-success/30 bg-success/5';
  return (
    <Card className={`border-2 ${tone}`}>
      <CardContent className="p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-[11px] mb-1 opacity-80">
          {icon}{label}
        </div>
        <div className="text-xl md:text-2xl font-bold leading-none">{value}</div>
      </CardContent>
    </Card>
  );
}
