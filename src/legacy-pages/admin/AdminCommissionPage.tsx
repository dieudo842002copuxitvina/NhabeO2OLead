import { useMemo, useState } from 'react';
import { dealers, orders } from '@/data/mock';
import { commissionTiers, tierOf, type CommissionTier } from '@/data/adminMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatVND } from '@/components/ProductCard';
import { Coins, TrendingUp, Wallet, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Commission Management — cấu hình tier % hoa hồng + bảng payout cho từng đại lý.
 */
export default function AdminCommissionPage() {
  const [tiers, setTiers] = useState<CommissionTier[]>(commissionTiers);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftRate, setDraftRate] = useState(0);

  const dealerStats = useMemo(() => {
    return dealers
      .filter(d => d.status === 'active')
      .map(d => {
        const dealerOrders = orders.filter(o => o.dealerId === d.id && o.status === 'delivered');
        const monthRev = dealerOrders.reduce((s, o) => s + o.total, 0);
        const tier = tierOf(d.revenue);
        // Recompute tier from current state
        const currentTier = [...tiers].reverse().find(t => d.revenue >= t.minRevenue) ?? tiers[0];
        const commission = Math.round((d.revenue * currentTier.rate) / 100);
        return { dealer: d, monthRev, tier: currentTier, commission };
      })
      .sort((a, b) => b.commission - a.commission);
  }, [tiers]);

  const totalCommission = dealerStats.reduce((s, x) => s + x.commission, 0);
  const totalRevenue = dealerStats.reduce((s, x) => s + x.dealer.revenue, 0);

  const startEdit = (t: CommissionTier) => { setEditing(t.id); setDraftRate(t.rate); };
  const saveEdit = (id: string) => {
    setTiers(prev => prev.map(t => (t.id === id ? { ...t, rate: draftRate } : t)));
    setEditing(null);
    toast.success(`Đã cập nhật rate cho ${tiers.find(t => t.id === id)?.label}`);
  };

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Quản lý hoa hồng</h1>
      <p className="text-muted-foreground mb-6">Cấu hình bậc thưởng và theo dõi payout cho mạng lưới đại lý.</p>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng hoa hồng dự kiến</p>
              <p className="font-display font-bold text-xl text-primary">{formatVND(totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng GMV đại lý</p>
              <p className="font-display font-bold text-xl">{formatVND(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. commission rate</p>
              <p className="font-display font-bold text-xl">
                {totalRevenue ? ((totalCommission / totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier config */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base font-display">Bậc hoa hồng</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {tiers.map(t => (
              <div key={t.id} className={`rounded-lg border p-4 ${t.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-lg">{t.label}</span>
                  {editing === t.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(t.id)} className="p-1 hover:bg-success/20 rounded">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1 hover:bg-destructive/20 rounded">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(t)} className="p-1 hover:bg-foreground/10 rounded">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {editing === t.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number" min={0} max={50} step={0.5}
                      value={draftRate}
                      onChange={e => setDraftRate(parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm bg-background"
                    />
                    <span className="text-xs">%</span>
                  </div>
                ) : (
                  <p className="font-display font-bold text-3xl leading-none">{t.rate}<span className="text-base">%</span></p>
                )}
                <p className="text-[11px] mt-2 opacity-80">
                  Doanh thu ≥ {t.minRevenue >= 1_000_000_000
                    ? `${(t.minRevenue / 1_000_000_000).toFixed(1)} tỷ`
                    : `${(t.minRevenue / 1_000_000).toFixed(0)}M`} VND
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Bảng payout đại lý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs uppercase">
                  <th className="py-2 pr-4">Đại lý</th>
                  <th className="py-2 pr-4">Khu vực</th>
                  <th className="py-2 pr-4 text-right">Doanh thu</th>
                  <th className="py-2 pr-4 text-center">Bậc</th>
                  <th className="py-2 pr-4 text-center">Rate</th>
                  <th className="py-2 pr-4 text-right">Hoa hồng</th>
                  <th className="py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {dealerStats.map(({ dealer, tier, commission }) => (
                  <tr key={dealer.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-4 font-medium">{dealer.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{dealer.region}</td>
                    <td className="py-3 pr-4 text-right">{formatVND(dealer.revenue)}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge className={`${tier.color} border-0`}>{tier.label}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-center font-semibold">{tier.rate}%</td>
                    <td className="py-3 pr-4 text-right font-display font-semibold text-primary">
                      {formatVND(commission)}
                    </td>
                    <td className="py-3 text-center">
                      <Button
                        size="sm" variant="outline"
                        onClick={() => toast.success(`Đã tạo lệnh chi ${formatVND(commission)} cho ${dealer.name}`)}
                      >
                        Tạo payout
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
