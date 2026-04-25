import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeads, subscribeLeads, updateLeadStatus, leadStats, type Lead, type LeadStatus } from '@/lib/leads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Phone, FileText, ExternalLink, Inbox, CheckCircle2, Clock, Trophy } from 'lucide-react';

const channelMeta: Record<Lead['channel'], { label: string; icon: typeof Phone; color: string }> = {
  zalo: { label: 'Zalo', icon: MessageCircle, color: 'bg-info/15 text-info' },
  call: { label: 'Cuộc gọi', icon: Phone, color: 'bg-primary/15 text-primary' },
  inquiry: { label: 'Yêu cầu', icon: FileText, color: 'bg-accent/15 text-accent' },
};

const statusMeta: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Mới', color: 'bg-warning/15 text-warning border-warning/30' },
  contacted: { label: 'Đã liên hệ', color: 'bg-info/15 text-info border-info/30' },
  won: { label: 'Chốt đơn', color: 'bg-success/15 text-success border-success/30' },
  lost: { label: 'Bỏ qua', color: 'bg-muted text-muted-foreground border-border' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

/**
 * Mini-CRM Leads — danh sách Khách hàng tiềm năng.
 * Mỗi click Zalo / Gọi / Yêu cầu trên web sẽ tự bắn về đây.
 */
export default function DealerLeadsPage() {
  const dealerId = 'd-1';
  const [leads, setLeads] = useState<Lead[]>(() => getLeads(dealerId));
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');

  useEffect(() => {
    const unsub = subscribeLeads(() => setLeads(getLeads(dealerId)));
    return () => { unsub(); };
  }, [dealerId]);

  const stats = leadStats(dealerId);
  const visible = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const sorted = [...visible].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Khách hàng tiềm năng</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Mỗi khi khách bấm Zalo hoặc Gọi trên web, lead sẽ tự bắn về đây.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Inbox, label: 'Tổng leads', value: stats.total, color: 'text-foreground' },
          { icon: Clock, label: 'Lead mới', value: stats.new, color: 'text-warning' },
          { icon: CheckCircle2, label: 'Đã liên hệ', value: stats.contacted, color: 'text-info' },
          { icon: Trophy, label: 'Chốt đơn', value: stats.won, color: 'text-success' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </div>
              <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {sorted.length} lead{sorted.length !== 1 ? 's' : ''}
        </p>
        <Select value={filter} onValueChange={(v) => setFilter(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="new">Mới</SelectItem>
            <SelectItem value="contacted">Đã liên hệ</SelectItem>
            <SelectItem value="won">Chốt đơn</SelectItem>
            <SelectItem value="lost">Bỏ qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sorted.map(lead => {
          const ch = channelMeta[lead.channel];
          const st = statusMeta[lead.status];
          const Icon = ch.icon;
          return (
            <Card key={lead.id} className={lead.status === 'new' ? 'border-warning/40 bg-warning/[0.02]' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ch.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{lead.customerHint ?? 'Khách ẩn danh'}</span>
                      <Badge variant="outline" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">· {timeAgo(lead.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quan tâm: <span className="text-foreground font-medium">{lead.productName ?? '—'}</span>
                    </p>
                    {lead.note && (
                      <p className="text-xs italic text-muted-foreground mt-1">📝 {lead.note}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        Kênh: <span className="font-medium text-foreground">{ch.label}</span>
                      </span>
                      {lead.source && (
                        <Link
                          to={lead.source}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1"
                        >
                          {lead.source} <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {lead.status === 'new' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateLeadStatus(lead.id, 'contacted')}
                    >
                      Đánh dấu đã liên hệ
                    </Button>
                  )}
                  {lead.status !== 'won' && lead.status !== 'lost' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => updateLeadStatus(lead.id, 'won', 'Đã chốt đơn')}
                      >
                        ✓ Chốt
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => updateLeadStatus(lead.id, 'lost')}
                      >
                        Bỏ qua
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sorted.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có lead nào trong mục này.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
