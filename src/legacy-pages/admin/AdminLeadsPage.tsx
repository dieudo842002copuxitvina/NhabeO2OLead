import { useMemo } from 'react';
import { historicalLeads } from '@/data/adminMock';
import { dealers } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import StatCard from '@/components/StatCard';
import { Inbox, Target, MessageCircle, Phone, TrendingUp, AlertTriangle } from 'lucide-react';

const CHANNEL_COLORS: Record<string, string> = {
  zalo: 'hsl(210,70%,55%)',
  call: 'hsl(145,63%,42%)',
  inquiry: 'hsl(35,80%,55%)',
};

/**
 * Lead Attribution Dashboard — toàn bộ O2O lead, conversion funnel,
 * channel split, top performing dealers, lead trend 30 ngày.
 */
export default function AdminLeadsPage() {
  const data = useMemo(() => {
    const total = historicalLeads.length;
    const byStatus = historicalLeads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1; return acc;
    }, {} as Record<string, number>);

    const byChannel = (['zalo', 'call', 'inquiry'] as const).map(ch => ({
      channel: ch === 'zalo' ? 'Zalo' : ch === 'call' ? 'Cuộc gọi' : 'Yêu cầu',
      key: ch,
      count: historicalLeads.filter(l => l.channel === ch).length,
    }));

    const byDealer = dealers
      .filter(d => d.status === 'active')
      .map(d => {
        const list = historicalLeads.filter(l => l.dealerId === d.id);
        const won = list.filter(l => l.status === 'won').length;
        return {
          name: d.name.replace('Đại lý ', '').slice(0, 18),
          fullName: d.name,
          leads: list.length,
          won,
          conversion: list.length ? Math.round((won / list.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.leads - a.leads);

    // 30-day trend, bucket by day
    const trend = Array.from({ length: 30 }).map((_, i) => {
      const day = 29 - i;
      return {
        day: `${day}d`,
        leads: historicalLeads.filter(l => l.daysAgo === day).length,
      };
    });

    const won = byStatus.won ?? 0;
    const conversion = total ? Math.round((won / total) * 100) : 0;

    const gapLeads = historicalLeads.filter(l => l.dealerId === '__gap__').length;

    return { total, byStatus, byChannel, byDealer, trend, won, conversion, gapLeads };
  }, []);

  const funnel = [
    { stage: 'Tổng leads', value: data.total, color: 'bg-muted-foreground/20' },
    { stage: 'Đã liên hệ', value: (data.byStatus.contacted ?? 0) + (data.byStatus.won ?? 0) + (data.byStatus.lost ?? 0), color: 'bg-info/30' },
    { stage: 'Chốt đơn', value: data.byStatus.won ?? 0, color: 'bg-success/40' },
  ];
  const maxFunnel = Math.max(...funnel.map(f => f.value), 1);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Lead Attribution</h1>
      <p className="text-muted-foreground mb-6">Phân tích toàn bộ lead O2O đổ về hệ thống Nhà Bè Agri</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng leads (30d)" value={data.total.toString()} change={24} icon={Inbox} />
        <StatCard title="Conversion rate" value={`${data.conversion}%`} change={5} icon={Target} />
        <StatCard title="Lead chốt đơn" value={(data.byStatus.won ?? 0).toString()} change={18} icon={TrendingUp} />
        <StatCard title="Lead vùng trống" value={data.gapLeads.toString()} change={data.gapLeads > 0 ? -8 : 0} icon={AlertTriangle} iconColor="text-warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Trend 30d */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-display">Xu hướng lead 30 ngày</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trend}>
                <XAxis dataKey="day" fontSize={11} reversed />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel split */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Lead theo kênh</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.byChannel} dataKey="count" nameKey="channel" cx="50%" cy="50%" innerRadius={45} outerRadius={80} label={({ value }) => value} fontSize={11}>
                  {data.byChannel.map((c) => <Cell key={c.key} fill={CHANNEL_COLORS[c.key]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Conversion Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3 py-4">
            {funnel.map((f, i) => {
              const w = (f.value / maxFunnel) * 100;
              const dropOff = i > 0 ? Math.round(((funnel[i - 1].value - f.value) / Math.max(funnel[i - 1].value, 1)) * 100) : 0;
              return (
                <div key={f.stage}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground">
                      {f.value} {i > 0 && <span className="text-warning ml-1">(−{dropOff}%)</span>}
                    </span>
                  </div>
                  <div className="h-9 rounded-md bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full ${f.color} flex items-center justify-end pr-3 text-xs font-semibold transition-all`}
                      style={{ width: `${w}%` }}
                    >
                      {Math.round(w)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top dealers by leads */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Top đại lý theo lead</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.byDealer} layout="vertical">
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={10} width={120} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="won" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detail table */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Chi tiết Attribution theo Đại lý</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs uppercase">
                  <th className="py-2 pr-4">Đại lý</th>
                  <th className="py-2 pr-4 text-right">Tổng lead</th>
                  <th className="py-2 pr-4 text-right">Chốt đơn</th>
                  <th className="py-2 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.byDealer.map(d => (
                  <tr key={d.fullName} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{d.fullName}</td>
                    <td className="py-3 pr-4 text-right">{d.leads}</td>
                    <td className="py-3 pr-4 text-right text-success font-semibold">{d.won}</td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className={d.conversion >= 30 ? 'border-success/40 text-success' : 'border-border'}>
                        {d.conversion}%
                      </Badge>
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
