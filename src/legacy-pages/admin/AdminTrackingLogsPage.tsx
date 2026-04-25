import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText, Loader2, RefreshCw, Download, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { canViewSensitive } from '@/lib/dataMasking';

interface TrackEvent {
  id: string;
  created_at: string;
  event_name: string;
  event_id: string;
  url: string | null;
  referrer: string | null;
  fb_status: string | null;
  tiktok_status: string | null;
  user_agent: string | null;
  ip_address: string | null;
  payload: Record<string, unknown> | null;
  session_id: string | null;
}

const AD_SOURCE_STYLES: Record<string, string> = {
  facebook: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
  tiktok: 'bg-foreground/10 text-foreground border-foreground/30',
  google: 'bg-warning/10 text-warning border-warning/30',
  organic: 'bg-success/10 text-success border-success/30',
  direct: 'bg-muted text-muted-foreground border-border',
};

export default function AdminTrackingLogsPage() {
  const { roles } = useAuth();
  const showSensitive = canViewSensitive(roles);
  const [events, setEvents] = useState<TrackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adSourceFilter, setAdSourceFilter] = useState('all');
  const [liveCount, setLiveCount] = useState(0);
  const liveCountRef = useRef(0);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('tracking_events')
      .select('*').order('created_at', { ascending: false }).limit(500);
    setEvents((data ?? []) as TrackEvent[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Realtime: prepend new inserts
  useEffect(() => {
    const ch = supabase
      .channel('tracking-events-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tracking_events' },
        (payload) => {
          const newRow = payload.new as TrackEvent;
          setEvents((prev) => [newRow, ...prev].slice(0, 500));
          liveCountRef.current += 1;
          setLiveCount(liveCountRef.current);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const eventNames = useMemo(() => Array.from(new Set(events.map((e) => e.event_name))), [events]);

  const filtered = useMemo(() => events.filter((e) => {
    if (eventFilter !== 'all' && e.event_name !== eventFilter) return false;
    if (statusFilter === 'fb_ok' && e.fb_status !== 'ok') return false;
    if (statusFilter === 'fb_err' && (!e.fb_status || e.fb_status === 'ok' || e.fb_status === 'disabled' || e.fb_status.startsWith('skipped'))) return false;
    if (statusFilter === 'tt_ok' && e.tiktok_status !== 'ok') return false;
    if (statusFilter === 'sync_err') {
      const n8n = (e.payload?.n8n_status as string | undefined) ?? '';
      const ga4 = (e.payload?.ga4_status as string | undefined) ?? '';
      const hasErr = [e.fb_status, e.tiktok_status, n8n, ga4].some((s) => s && s.startsWith('error'));
      if (!hasErr) return false;
    }
    if (adSourceFilter !== 'all') {
      const src = (e.payload?.adSource as string | undefined) ?? 'direct';
      if (src !== adSourceFilter) return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const dealerName = ((e.payload?.dealerName as string | undefined) ?? '').toLowerCase();
      if (!e.event_name.toLowerCase().includes(q) &&
          !(e.url ?? '').toLowerCase().includes(q) &&
          !dealerName.includes(q)) return false;
    }
    return true;
  }), [events, eventFilter, statusFilter, adSourceFilter, search]);

  const stats = useMemo(() => ({
    total: filtered.length,
    fbOk: filtered.filter((e) => e.fb_status === 'ok').length,
    ttOk: filtered.filter((e) => e.tiktok_status === 'ok').length,
    last1h: filtered.filter((e) => Date.now() - new Date(e.created_at).getTime() < 3600000).length,
  }), [filtered]);

  const exportJsonl = () => {
    const jsonl = filtered.map((e) => JSON.stringify(e)).join('\n');
    const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tracking-${format(new Date(), 'yyyyMMdd-HHmm')}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const statusBadge = (status: string | null | undefined, label: string) => {
    if (!status) return <Badge variant="outline" className="text-[10px]">{label}: —</Badge>;
    if (status === 'ok') return <Badge className="bg-success/10 text-success border-success/20 text-[10px]">{label}: OK</Badge>;
    if (status === 'disabled') return <Badge variant="outline" className="text-[10px]">{label}: Off</Badge>;
    if (status.startsWith('skipped')) return <Badge variant="secondary" className="text-[10px]">{label}: Skip</Badge>;
    return <Badge variant="destructive" className="text-[10px]">{label}: {status.slice(0, 12)}</Badge>;
  };

  const adSourceBadge = (src: string | undefined) => {
    const s = (src ?? 'direct').toLowerCase();
    const cls = AD_SOURCE_STYLES[s] ?? AD_SOURCE_STYLES.direct;
    return <Badge variant="outline" className={`text-[10px] capitalize border ${cls}`}>{s}</Badge>;
  };

  const maskIp = (ip: string | null) => {
    if (!ip) return '-';
    if (showSensitive) return ip;
    const parts = ip.split('.');
    if (parts.length !== 4) return ip.slice(0, 4) + '...';
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-primary" /> Tracking Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            Toàn bộ events server-side (FB CAPI, TikTok, GA4, n8n, internal). 500 records gần nhất.
            <span className="inline-flex items-center gap-1 text-success font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <Radio className="w-3 h-3" /> Live
            </span>
            {liveCount > 0 && <span className="text-xs text-primary">+{liveCount} mới từ khi mở trang</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Reload
          </Button>
          <Button onClick={exportJsonl} size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export JSONL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Tổng (filter)</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">1h qua</p><p className="text-2xl font-bold text-primary">{stats.last1h}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">FB CAPI OK</p><p className="text-2xl font-bold">{stats.fbOk}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">TikTok OK</p><p className="text-2xl font-bold">{stats.ttOk}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input className="w-60" placeholder="Tìm event / URL / đại lý..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Loại event" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả events</SelectItem>
              {eventNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={adSourceFilter} onValueChange={setAdSourceFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Ad Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sync Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả status</SelectItem>
              <SelectItem value="fb_ok">FB CAPI OK</SelectItem>
              <SelectItem value="fb_err">FB CAPI lỗi</SelectItem>
              <SelectItem value="tt_ok">TikTok OK</SelectItem>
              <SelectItem value="sync_err">Bất kỳ kênh lỗi</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={() => { setSearch(''); setEventFilter('all'); setStatusFilter('all'); setAdSourceFilter('all'); }}>Reset</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">Không có event khớp bộ lọc</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Thời gian</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Đại lý liên hệ</TableHead>
                  <TableHead>Nguồn (Ad)</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="min-w-[280px]">Sync Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const dealerName = (e.payload?.dealerName as string | undefined) ?? (e.payload?.dealerId as string | undefined);
                  const adSource = e.payload?.adSource as string | undefined;
                  const n8nStatus = e.payload?.n8n_status as string | undefined;
                  const ga4Status = e.payload?.ga4_status as string | undefined;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap font-mono">{format(new Date(e.created_at), 'dd/MM HH:mm:ss')}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{e.event_name}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[160px] truncate">{dealerName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{adSourceBadge(adSource)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{e.url ?? '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{maskIp(e.ip_address)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {statusBadge(e.fb_status, 'FB')}
                          {statusBadge(e.tiktok_status, 'TT')}
                          {statusBadge(ga4Status, 'GA4')}
                          {statusBadge(n8nStatus, 'n8n')}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
