import { useState } from 'react';
import { pendingDealers as initialPending, type PendingDealer } from '@/data/adminMock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, MapPin, Phone, Store, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';

type Decision = 'approved' | 'rejected';
type Record = PendingDealer & { decision?: Decision; reason?: string };

function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

/**
 * Pending Dealer Approvals — duyệt đơn đăng ký đại lý mới.
 */
export default function AdminApprovalsPage() {
  const [list, setList] = useState<Record[]>(initialPending);
  const [filter, setFilter] = useState<'pending' | Decision>('pending');
  const [activeReject, setActiveReject] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const visible = list.filter(r => (filter === 'pending' ? !r.decision : r.decision === filter));

  const approve = (id: string) => {
    setList(prev => prev.map(r => (r.id === id ? { ...r, decision: 'approved' } : r)));
    const item = list.find(r => r.id === id);
    toast.success(`✓ Đã duyệt ${item?.name}. Email kích hoạt đã gửi tới ${item?.phone}`);
  };

  const reject = (id: string) => {
    setList(prev => prev.map(r => (r.id === id ? { ...r, decision: 'rejected', reason } : r)));
    const item = list.find(r => r.id === id);
    toast.error(`✗ Đã từ chối ${item?.name}`);
    setActiveReject(null);
    setReason('');
  };

  const counts = {
    pending: list.filter(r => !r.decision).length,
    approved: list.filter(r => r.decision === 'approved').length,
    rejected: list.filter(r => r.decision === 'rejected').length,
  };

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="font-display text-3xl font-bold mb-2">Duyệt Đại lý mới</h1>
      <p className="text-muted-foreground mb-6">Xem xét và phê duyệt đơn đăng ký từ đại lý tiềm năng.</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {([
          { key: 'pending', label: 'Chờ duyệt', count: counts.pending, color: 'border-warning text-warning' },
          { key: 'approved', label: 'Đã duyệt', count: counts.approved, color: 'border-success text-success' },
          { key: 'rejected', label: 'Đã từ chối', count: counts.rejected, color: 'border-destructive text-destructive' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === t.key
                ? t.color
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {visible.map(d => (
          <Card key={d.id} className={d.decision === 'approved' ? 'border-success/30' : d.decision === 'rejected' ? 'border-destructive/30 opacity-70' : ''}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Chủ: {d.ownerName}</p>
                </div>
                {d.decision === 'approved' && <Badge className="bg-success/15 text-success border-0">✓ Đã duyệt</Badge>}
                {d.decision === 'rejected' && <Badge className="bg-destructive/15 text-destructive border-0">✗ Từ chối</Badge>}
                {!d.decision && <Badge className="bg-warning/15 text-warning border-0"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>}
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" /> {d.address}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /> {d.phone}</p>
                <p className="flex items-center gap-1.5"><Package className="w-3 h-3 shrink-0" /> Dự kiến {d.expectedSKUs} SKU</p>
                <p className="flex items-center gap-1.5">
                  <Store className="w-3 h-3 shrink-0" />
                  {d.hasShop ? 'Đã có showroom' : 'Chưa có showroom'}
                </p>
                <p className="flex items-center gap-1.5"><Clock className="w-3 h-3 shrink-0" /> Đăng ký {timeAgo(d.appliedAt)}</p>
              </div>

              {d.notes && (
                <p className="text-xs italic bg-muted/40 rounded p-2 mb-3">📝 {d.notes}</p>
              )}
              {d.reason && (
                <p className="text-xs italic bg-destructive/5 text-destructive rounded p-2 mb-3">Lý do từ chối: {d.reason}</p>
              )}

              {!d.decision && (
                <div className="flex gap-2">
                  <Button
                    size="sm" className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => approve(d.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Duyệt
                  </Button>
                  <Dialog open={activeReject === d.id} onOpenChange={open => { if (!open) { setActiveReject(null); setReason(''); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                        onClick={() => setActiveReject(d.id)}>
                        <XCircle className="w-4 h-4 mr-1" /> Từ chối
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Lý do từ chối "{d.name}"</DialogTitle></DialogHeader>
                      <Textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="VD: Khu vực đã đủ đại lý, hồ sơ chưa đầy đủ…"
                        rows={4}
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setActiveReject(null); setReason(''); }}>Hủy</Button>
                        <Button variant="destructive" disabled={!reason.trim()} onClick={() => reject(d.id)}>Xác nhận từ chối</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {visible.length === 0 && (
          <Card className="md:col-span-2"><CardContent className="p-12 text-center text-muted-foreground text-sm">
            Không có đơn nào trong mục này.
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
