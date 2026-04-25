import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dealers } from '@/data/mock';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, MessageCircle, Save, Loader2, Package, Droplets, Sprout, History, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { trackEvent } from '@/lib/tracking';

interface StatusHistoryEntry {
  status: string;
  at: string;
  by?: string | null;
}

export interface CalcLeadDetail {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_province: string | null;
  crop: string;
  area_m2: number;
  water_source: string;
  slope: string;
  spacing: string;
  pump_hp: number;
  pipe_meters: number;
  nozzle_count: number;
  total_cost: number;
  status: string;
  dealer_id: string | null;
  notes: string | null;
  status_history: StatusHistoryEntry[] | null;
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Mới', contacted: 'Đã liên hệ', won: 'Chốt đơn', lost: 'Thất bại',
};
const CROP_LABELS: Record<string, string> = {
  durian: 'Sầu riêng', coffee: 'Cà phê', pepper: 'Hồ tiêu',
  pomelo: 'Bưởi', dragonfruit: 'Thanh long', avocado: 'Bơ',
};

interface Props {
  lead: CalcLeadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (lead: CalcLeadDetail) => void;
}

export default function LeadDetailDialog({ lead, open, onOpenChange, onUpdated }: Props) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(lead?.notes ?? '');
  }, [lead?.id, lead?.notes]);

  if (!lead) return null;

  const dealer = lead.dealer_id ? dealers.find((d) => d.id === lead.dealer_id) : null;
  const history = lead.status_history ?? [];

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('calculator_leads')
      .update({ notes })
      .eq('id', lead.id);
    setSaving(false);
    if (error) { toast.error('Lưu ghi chú thất bại'); return; }
    toast.success('Đã lưu ghi chú');
    onUpdated({ ...lead, notes });
  };

  const handleCall = () => {
    const phone = dealer?.phone ?? lead.customer_phone;
    trackEvent('call_click', { dealerId: dealer?.id, dealerName: dealer?.name });
    window.location.href = `tel:${phone}`;
  };

  const handleZalo = () => {
    if (!dealer?.zalo) {
      toast.error('Lead chưa gán đại lý có Zalo');
      return;
    }
    trackEvent('zalo_click', { dealerId: dealer.id, dealerName: dealer.name });
    const cleanedZalo = dealer.zalo.replace(/[^0-9]/g, '');
    const msg = `Khách ${lead.customer_name} (${lead.customer_phone}) - ${CROP_LABELS[lead.crop] ?? lead.crop} ${lead.area_m2}m² - dự toán ${Number(lead.total_cost).toLocaleString('vi-VN')}đ - ID: ${lead.id.slice(0, 8)}`;
    window.open(`https://zalo.me/${cleanedZalo}?body=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            Lead #{lead.id.slice(0, 8)}
            <Badge variant="outline">{STATUS_LABEL[lead.status] ?? lead.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Tạo {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')} · {lead.customer_name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Customer + Dealer */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Khách hàng</p>
                <p className="font-semibold">{lead.customer_name}</p>
                <p className="text-sm">{lead.customer_phone}</p>
                {lead.customer_province && (
                  <p className="text-xs text-muted-foreground">{lead.customer_province}</p>
                )}
              </div>
              <div className="space-y-1.5 p-4 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Đại lý gán</p>
                {dealer ? (
                  <>
                    <p className="font-semibold">{dealer.name}</p>
                    <p className="text-sm">{dealer.phone}</p>
                    <p className="text-xs text-muted-foreground">{dealer.address}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa gán</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button onClick={handleCall} className="flex-1 gap-2">
                <Phone className="w-4 h-4" /> Gọi {dealer ? 'đại lý' : 'khách'}
              </Button>
              <Button onClick={handleZalo} variant="outline" className="flex-1 gap-2" disabled={!dealer?.zalo}>
                <MessageCircle className="w-4 h-4" /> Chat Zalo đại lý
              </Button>
            </div>

            <Separator />

            {/* Crop spec */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary" /> Thông số dự án
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <Spec label="Cây trồng" value={CROP_LABELS[lead.crop] ?? lead.crop} />
                <Spec label="Diện tích" value={`${lead.area_m2.toLocaleString()} m²`} />
                <Spec label="Khoảng cách" value={lead.spacing} />
                <Spec label="Độ dốc" value={lead.slope} />
              </div>
            </div>

            {/* Equipment breakdown */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Vật tư & thiết bị
              </h3>
              <div className="space-y-2 text-sm">
                <SpecRow icon={<Droplets className="w-4 h-4 text-primary" />}
                  label="Máy bơm" value={`${lead.pump_hp} HP`}
                  hint={`Nguồn nước: ${lead.water_source === 'well' ? 'Giếng khoan' : 'Sông/ao/hồ'}`} />
                <SpecRow icon={<Package className="w-4 h-4 text-primary" />}
                  label="Đường ống PVC" value={`${lead.pipe_meters.toLocaleString()} m`} />
                <SpecRow icon={<Droplets className="w-4 h-4 text-primary" />}
                  label="Béc tưới" value={`${lead.nozzle_count.toLocaleString()} béc`} />
              </div>
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                <span className="text-sm font-medium">Tổng dự toán</span>
                <span className="text-xl font-bold text-primary">
                  {Number(lead.total_cost).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <Separator />

            {/* Status history */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Lịch sử trạng thái
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Chưa có thay đổi. Trạng thái khởi tạo: <Badge variant="outline">Mới</Badge>
                </p>
              ) : (
                <ol className="space-y-2 border-l-2 border-muted pl-4">
                  {history.map((h, i) => (
                    <li key={i} className="text-sm relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge variant="outline">{STATUS_LABEL[h.status] ?? h.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(h.at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      {h.by && <p className="text-xs text-muted-foreground mt-0.5">bởi {h.by}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <Separator />

            {/* Internal notes */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-primary" /> Ghi chú nội bộ
              </h3>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú follow-up, kết quả gọi điện, yêu cầu đặc biệt..."
                rows={4}
              />
              <Button onClick={saveNotes} disabled={saving} size="sm" className="mt-2 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu ghi chú
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md border bg-card">
      <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}

function SpecRow({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md border bg-card">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className="font-semibold whitespace-nowrap">{value}</span>
    </div>
  );
}
