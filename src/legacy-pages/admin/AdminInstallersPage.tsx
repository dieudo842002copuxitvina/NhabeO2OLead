import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Hammer, CheckCircle2, XCircle, Clock, Eye, MapPin, Phone, Briefcase } from 'lucide-react';
import {
  getInstallers, subscribeInstallers, setInstallerStatus, installerStats,
  SPECIALTY_META, type Installer, type InstallerStatus,
} from '@/lib/installers';

export default function AdminInstallersPage() {
  const [tab, setTab] = useState<InstallerStatus>('pending');
  const [list, setList] = useState<Installer[]>(() => getInstallers());
  const [viewing, setViewing] = useState<Installer | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => subscribeInstallers(() => setList(getInstallers())), []);

  const stats = installerStats();
  const filtered = list.filter(i => i.status === tab).sort((a, b) => b.createdAt - a.createdAt);

  const approve = (id: string) => setInstallerStatus(id, 'approved');
  const reject = () => {
    if (!rejectingId) return;
    setInstallerStatus(rejectingId, 'rejected', rejectReason || 'Hồ sơ chưa đạt');
    setRejectingId(null); setRejectReason('');
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Hammer className="w-8 h-8 text-primary" /> Duyệt Đội thợ
        </h1>
        <p className="text-muted-foreground mt-1">QA thẩm định CCCD + ảnh công trình trước khi cho thợ vào mạng lưới.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={<Clock className="text-warning" />} label="Chờ duyệt" value={stats.pending} />
        <Stat icon={<CheckCircle2 className="text-success" />} label="Đã duyệt" value={stats.approved} />
        <Stat icon={<XCircle className="text-destructive" />} label="Từ chối" value={stats.rejected} />
        <Stat icon={<Briefcase className="text-info" />} label="Đang rảnh" value={stats.available} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {(['pending', 'approved', 'rejected'] as InstallerStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === s ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : 'Từ chối'}
            {' '}({list.filter(i => i.status === s).length})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Không có hồ sơ.</CardContent></Card>
        ) : filtered.map(i => (
          <Card key={i.id}>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{i.fullName}</h3>
                  {i.status === 'pending' && <Badge className="bg-warning/15 text-warning border-warning/30" variant="outline">Mới</Badge>}
                  {i.status === 'rejected' && i.rejectReason && (
                    <Badge variant="outline" className="text-destructive border-destructive/30">{i.rejectReason}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{i.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{i.province}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{i.experienceYears} năm KN</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {i.specialties.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {SPECIALTY_META[s].emoji} {SPECIALTY_META[s].label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setViewing(i)}>
                  <Eye className="w-4 h-4 mr-1.5" /> Xem hồ sơ
                </Button>
                {i.status === 'pending' && (
                  <>
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approve(i.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Duyệt
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setRejectingId(i.id)}>
                      <XCircle className="w-4 h-4 mr-1.5" /> Từ chối
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View KYC dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.fullName} — Hồ sơ KYC</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 uppercase">CCCD mặt trước</p>
                  <img src={viewing.cccdImage} alt="CCCD" className="w-full max-w-sm rounded-lg border" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 uppercase">Ảnh công trình ({viewing.portfolioImages.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {viewing.portfolioImages.map((url, idx) => (
                      <img key={idx} src={url} alt={`CT ${idx+1}`} className="aspect-square w-full object-cover rounded-lg border" />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject reason */}
      <Dialog open={!!rejectingId} onOpenChange={() => { setRejectingId(null); setRejectReason(''); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Từ chối hồ sơ</DialogTitle></DialogHeader>
          <Textarea
            placeholder="VD: CCCD không rõ, ảnh công trình không thuyết phục..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Hủy</Button>
            <Button variant="destructive" onClick={reject}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 [&_svg]:w-3.5 [&_svg]:h-3.5">
          {icon} {label}
        </div>
        <p className="font-display font-bold text-2xl">{value}</p>
      </CardContent>
    </Card>
  );
}
