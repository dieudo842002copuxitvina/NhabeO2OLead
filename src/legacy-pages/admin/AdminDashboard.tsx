import { Link } from 'react-router-dom';
import { Inbox, TrendingUp, Coins, Activity, MapPin, Coins as CoinsIcon, UserPlus, ArrowRight, Sparkles, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import KpiSparkCard from '@/components/admin/KpiSparkCard';
import ConversionFunnel from '@/components/admin/ConversionFunnel';
import LiveActivityStream from '@/components/admin/LiveActivityStream';
import SystemHealthCard from '@/components/admin/SystemHealthCard';

const fmtVnd = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}`;
  return new Intl.NumberFormat('vi-VN').format(n);
};
const fmtVndUnit = (n: number) => (n >= 1_000_000_000 ? 'tỷ đ' : n >= 1_000_000 ? 'tr đ' : 'đ');

const quickLinks = [
  { to: '/admin/leads', label: 'Leads', desc: 'Phân tích O2O', icon: Inbox },
  { to: '/admin/heatmap', label: 'Heatmap', desc: 'Vùng nóng', icon: MapPin },
  { to: '/admin/commission', label: 'Hoa hồng', desc: 'Tier & payout', icon: CoinsIcon },
  { to: '/admin/marketing-bi', label: 'Marketing BI', desc: 'CAPI / GA4', icon: BarChart3 },
  { to: '/admin/ai-rules', label: 'AI Rules', desc: 'Banner thông minh', icon: Sparkles },
  { to: '/admin/approvals', label: 'Duyệt đại lý', desc: 'Hồ sơ mới', icon: UserPlus },
];

export default function AdminDashboard() {
  const { kpi, funnel, activity, loading, refresh } = useDashboardMetrics();

  return (
    <div className="container py-6 md:py-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Executive Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trung tâm điều hành Nhà Bè Agri · O2O Lead Engine · 7 ngày gần nhất
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          Realtime · Cập nhật tự động khi có lead/event mới
        </div>
      </div>

      {/* ====== KPI cards row ====== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiSparkCard
          label="Tổng Leads (O2O)"
          value={kpi ? kpi.totalLeads.toLocaleString('vi-VN') : '—'}
          series={kpi?.totalLeadsSpark ?? []}
          icon={Inbox}
          loading={loading}
        />
        <KpiSparkCard
          label="Tỷ lệ Chuyển đổi (CVR)"
          value={kpi ? `${kpi.cvr}` : '—'}
          unit="%"
          series={kpi?.cvrSpark ?? []}
          icon={TrendingUp}
          loading={loading}
        />
        <KpiSparkCard
          label="Giá trị Dự toán"
          value={kpi ? fmtVnd(kpi.leadValue) : '—'}
          unit={kpi ? fmtVndUnit(kpi.leadValue) : ''}
          series={kpi?.leadValueSpark ?? []}
          icon={Coins}
          loading={loading}
        />
        <KpiSparkCard
          label="Tổng Sự kiện"
          value={kpi ? kpi.totalEvents.toLocaleString('vi-VN') : '—'}
          series={kpi?.eventsSpark ?? []}
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* ====== Funnel + Health ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ConversionFunnel stages={funnel} loading={loading} />
        </div>
        <div>
          <SystemHealthCard />
        </div>
      </div>

      {/* ====== Live Activity Stream ====== */}
      <LiveActivityStream items={activity} loading={loading} onRefresh={refresh} />

      {/* ====== Quick navigation ====== */}
      <div>
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2 px-1">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickLinks.map((q) => (
            <Link key={q.to} to={q.to} className="group">
              <Card className="hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <q.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate">{q.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{q.desc}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
