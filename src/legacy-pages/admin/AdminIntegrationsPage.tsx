import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Webhook, Activity, Save, Loader2, ExternalLink, AlertCircle, BarChart3, Database,
  MapPin, PlayCircle, RefreshCw, CheckCircle2, XCircle, MinusCircle, Radio,
  Eye, EyeOff,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrackingEvent {
  id: string;
  event_name: string;
  event_id: string;
  url: string | null;
  fb_status: string | null;
  tiktok_status: string | null;
  created_at: string;
}

interface BiLastRun { at?: string; status?: string; counts?: { calculator_leads?: number; tracking_events?: number } }

interface HealthResult {
  service: string;
  label: string;
  status: 'ok' | 'down' | 'not_configured';
  detail: string;
  latency_ms?: number;
}

// --- Reusable secret input with show/hide eye ---
function SecretInput({
  id, value, onChange, placeholder,
}: { id: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-xs"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
        tabIndex={-1}
        aria-label={show ? 'Ẩn' : 'Hiện'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [tracking, setTracking] = useState({ facebook: true, tiktok: true, internal: true, ga4: true });
  const [ga4, setGa4] = useState({ measurement_id: '', api_secret: '' });
  const [fbCfg, setFbCfg] = useState({ pixel_id: '', capi_token: '' });
  const [ttCfg, setTtCfg] = useState({ pixel_id: '', access_token: '' });
  const [bi, setBi] = useState({ bi_export_webhook_url: '', enabled: false, lookback_hours: 24, bq_dataset: 'agriflow' });
  const [biLastRun, setBiLastRun] = useState<BiLastRun | null>(null);
  const [mapsKeyConfigured, setMapsKeyConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [stats, setStats] = useState({ total: 0, fbOk: 0, ttOk: 0, last24h: 0 });

  // Live Status panel
  const [health, setHealth] = useState<HealthResult[]>([]);
  const [healthCheckedAt, setHealthCheckedAt] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const checkHealth = async (silent = false) => {
    if (!silent) setHealthLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-health');
      if (error) throw error;
      const r = data as { results: HealthResult[]; checked_at: string };
      setHealth(r.results ?? []);
      setHealthCheckedAt(r.checked_at);
    } catch (e) {
      if (!silent) toast.error('Không kiểm tra được: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally {
      if (!silent) setHealthLoading(false);
    }
  };

  // Auto-poll every 30s
  useEffect(() => {
    checkHealth(true);
    const id = setInterval(() => checkHealth(true), 30000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: settings }, { data: evs }] = await Promise.all([
      supabase.from('app_settings').select('*').in('key',
        ['n8n_webhook_url', 'tracking_enabled', 'ga4_config', 'fb_capi_config', 'tiktok_config',
         'bi_export_config', 'bi_export_last_run', 'maps_status']),
      supabase.from('tracking_events').select('id,event_name,event_id,url,fb_status,tiktok_status,created_at')
        .order('created_at', { ascending: false }).limit(50),
    ]);
    if (settings) {
      const get = (k: string) => settings.find((s) => s.key === k)?.value as Record<string, unknown> | undefined;
      const wh = get('n8n_webhook_url');
      const tr = get('tracking_enabled');
      const g = get('ga4_config');
      const fb = get('fb_capi_config');
      const tt = get('tiktok_config');
      const b = get('bi_export_config');
      const lr = get('bi_export_last_run');
      const ms = get('maps_status');
      if (wh) setWebhookUrl((wh.url as string) ?? '');
      if (tr) setTracking({ facebook: true, tiktok: true, internal: true, ga4: true, ...tr });
      if (g) setGa4({ measurement_id: '', api_secret: '', ...g });
      if (fb) setFbCfg({ pixel_id: '', capi_token: '', ...fb });
      if (tt) setTtCfg({ pixel_id: '', access_token: '', ...tt });
      if (b) setBi({ bi_export_webhook_url: '', enabled: false, lookback_hours: 24, bq_dataset: 'agriflow', ...b });
      if (lr) setBiLastRun(lr as BiLastRun);
      if (ms) setMapsKeyConfigured(!!(ms as { configured?: boolean }).configured);
    }
    if (evs) {
      setEvents(evs as TrackingEvent[]);
      const since = Date.now() - 86400000;
      setStats({
        total: evs.length,
        fbOk: evs.filter((e) => e.fb_status === 'ok').length,
        ttOk: evs.filter((e) => e.tiktok_status === 'ok').length,
        last24h: evs.filter((e) => new Date(e.created_at).getTime() > since).length,
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const ops = await Promise.all([
      supabase.from('app_settings').upsert({ key: 'n8n_webhook_url', value: { url: webhookUrl.trim() } }),
      supabase.from('app_settings').upsert({ key: 'tracking_enabled', value: tracking }),
      supabase.from('app_settings').upsert({ key: 'ga4_config', value: { measurement_id: ga4.measurement_id.trim(), api_secret: ga4.api_secret.trim() } }),
      supabase.from('app_settings').upsert({ key: 'fb_capi_config', value: { pixel_id: fbCfg.pixel_id.trim(), capi_token: fbCfg.capi_token.trim() } }),
      supabase.from('app_settings').upsert({ key: 'tiktok_config', value: { pixel_id: ttCfg.pixel_id.trim(), access_token: ttCfg.access_token.trim() } }),
      supabase.from('app_settings').upsert({ key: 'bi_export_config', value: bi }),
    ]);
    setSaving(false);
    const err = ops.find((o) => o.error)?.error;
    if (err) {
      toast.error('Lưu thất bại: ' + err.message);
      return;
    }
    toast.success('Đã lưu cấu hình — đang refresh trạng thái…');
    // Refetch health so Test buttons reflect new credentials
    await checkHealth(false);
  };

  const runBiExport = async (dryRun: boolean) => {
    toast.info(dryRun ? 'Đang lấy mẫu dữ liệu...' : 'Đang đẩy data sang n8n...');
    const { data, error } = await supabase.functions.invoke('bi-export', { body: { dry_run: dryRun } });
    if (error) { toast.error('Lỗi: ' + error.message); return; }
    const counts = (data as { counts?: { calculator_leads?: number; tracking_events?: number } })?.counts;
    toast.success(`Leads: ${counts?.calculator_leads ?? 0} · Events: ${counts?.tracking_events ?? 0}`);
    if (!dryRun) await load();
  };

  const testWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Nhập webhook URL trước');
      return;
    }
    toast.info('Đang gửi lead test tới n8n...');
    const { data, error } = await supabase.functions.invoke('notify-lead', {
      body: {
        lead_id: 'TEST-' + Date.now(),
        customer: { name: 'Test User', phone: '0901234567', province: 'Đắk Lắk' },
        calculator: { crop: 'Sầu riêng', area_m2: 5000, total_cost: 25000000 },
        dealer: null,
      },
    });
    if (error) { toast.error('Lỗi: ' + error.message); return; }
    toast.success(`n8n response: ${JSON.stringify(data)}`);
  };

  const testChannel = async (label: string) => {
    toast.info(`Đang gửi event test cho ${label}...`);
    const { data, error } = await supabase.functions.invoke('track-event', {
      body: {
        event_name: 'admin_test_event',
        url: window.location.href,
        payload: { source: 'admin-test', channel: label, ts: Date.now() },
      },
    });
    if (error) { toast.error(`${label}: ${error.message}`); return; }
    const r = data as { fb?: string; tiktok?: string; ga4?: string };
    toast.success(`${label} → FB: ${r.fb} · TT: ${r.tiktok} · GA4: ${r.ga4}`);
  };

  const statusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>;
    if (status === 'ok') return <Badge className="bg-success/10 text-success border-success/20">OK</Badge>;
    if (status.startsWith('skipped')) return <Badge variant="secondary">Skip</Badge>;
    if (status === 'disabled') return <Badge variant="outline">Off</Badge>;
    return <Badge variant="destructive">{status.slice(0, 20)}</Badge>;
  };

  // --- Channel definitions for the consolidated Tracking card ---
  type ChannelKey = 'facebook' | 'tiktok' | 'ga4' | 'internal';
  const fbReady = !!(fbCfg.pixel_id.trim() && fbCfg.capi_token.trim());
  const ttReady = !!(ttCfg.pixel_id.trim() && ttCfg.access_token.trim());
  const gaReady = !!(ga4.measurement_id.trim() && ga4.api_secret.trim());

  const channels: Array<{
    key: ChannelKey;
    label: string;
    sub: string;
    ready: boolean;
    fields?: React.ReactNode;
  }> = [
    {
      key: 'facebook',
      label: 'Facebook CAPI',
      sub: 'Server-side Conversions API · gửi event đã hash PII',
      ready: fbReady,
      fields: (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="fb-pixel" className="text-xs">FB_PIXEL_ID</Label>
            <Input
              id="fb-pixel"
              value={fbCfg.pixel_id}
              onChange={(e) => setFbCfg((p) => ({ ...p, pixel_id: e.target.value }))}
              placeholder="Nhập Pixel ID tại đây..."
              className="font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fb-token" className="text-xs">FB_CAPI_TOKEN</Label>
            <SecretInput
              id="fb-token"
              value={fbCfg.capi_token}
              onChange={(v) => setFbCfg((p) => ({ ...p, capi_token: v }))}
              placeholder="Dán Access Token..."
            />
          </div>
        </div>
      ),
    },
    {
      key: 'tiktok',
      label: 'TikTok Pixel',
      sub: 'TikTok Events API · realtime tracking',
      ready: ttReady,
      fields: (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="tt-pixel" className="text-xs">TIKTOK_PIXEL_ID</Label>
            <Input
              id="tt-pixel"
              value={ttCfg.pixel_id}
              onChange={(e) => setTtCfg((p) => ({ ...p, pixel_id: e.target.value }))}
              placeholder="Nhập Pixel Code tại đây..."
              className="font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tt-token" className="text-xs">TIKTOK_ACCESS_TOKEN</Label>
            <SecretInput
              id="tt-token"
              value={ttCfg.access_token}
              onChange={(v) => setTtCfg((p) => ({ ...p, access_token: v }))}
              placeholder="Dán Access Token..."
            />
          </div>
        </div>
      ),
    },
    {
      key: 'ga4',
      label: 'Google Analytics 4',
      sub: 'Measurement Protocol · server-side',
      ready: gaReady,
      fields: (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ga4-mid" className="text-xs">GA4_MEASUREMENT_ID</Label>
            <Input
              id="ga4-mid"
              value={ga4.measurement_id}
              onChange={(e) => setGa4((p) => ({ ...p, measurement_id: e.target.value }))}
              placeholder="G-XXXXXXXXXX"
              className="font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ga4-secret" className="text-xs">GA4_API_SECRET</Label>
            <SecretInput
              id="ga4-secret"
              value={ga4.api_secret}
              onChange={(v) => setGa4((p) => ({ ...p, api_secret: v }))}
              placeholder="Dán API Secret..."
            />
          </div>
        </div>
      ),
    },
    {
      key: 'internal',
      label: 'Internal Analytics (BI)',
      sub: 'Lưu vào tracking_events · luôn sẵn sàng',
      ready: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Webhook className="w-6 h-6 text-primary" /> Trung tâm tích hợp & Tracking
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý webhook n8n, Facebook CAPI, TikTok Pixel, GA4 và xem nhật ký sự kiện server-side
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Tổng events (50 gần nhất)</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">24h qua</p><p className="text-2xl font-bold text-primary">{stats.last24h}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">FB CAPI OK</p><p className="text-2xl font-bold">{stats.fbOk}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">TikTok OK</p><p className="text-2xl font-bold">{stats.ttOk}</p></CardContent></Card>
      </div>

      {/* ============== LIVE STATUS PANEL — Omnichannel Hub ============== */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <Radio className="w-4 h-4 text-primary" /> Live Status — Omnichannel Hub
              </CardTitle>
              <CardDescription>
                Auto-poll mỗi 30s · {healthCheckedAt ? `cập nhật lúc ${format(new Date(healthCheckedAt), 'HH:mm:ss')}` : 'đang chờ kiểm tra…'}
              </CardDescription>
            </div>
            <Button onClick={() => checkHealth(false)} disabled={healthLoading} variant="outline" size="sm" className="gap-2">
              {healthLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Test ngay
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {health.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {healthLoading ? 'Đang kiểm tra…' : 'Chưa có dữ liệu — bấm "Test ngay"'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {health.map((h) => {
                const styles = h.status === 'ok'
                  ? { bg: 'bg-success/5', border: 'border-success/30', dot: 'bg-success', icon: <CheckCircle2 className="w-4 h-4 text-success" />, label: 'Live', labelCls: 'text-success' }
                  : h.status === 'down'
                  ? { bg: 'bg-destructive/5', border: 'border-destructive/40', dot: 'bg-destructive', icon: <XCircle className="w-4 h-4 text-destructive" />, label: 'Lỗi kết nối', labelCls: 'text-destructive' }
                  : { bg: 'bg-muted/40', border: 'border-border', dot: 'bg-muted-foreground/40', icon: <MinusCircle className="w-4 h-4 text-muted-foreground" />, label: 'Chưa cấu hình', labelCls: 'text-muted-foreground' };
                return (
                  <div key={h.service} className={`relative rounded-lg border-2 ${styles.border} ${styles.bg} p-3`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`relative flex h-2.5 w-2.5 shrink-0`}>
                          {h.status === 'ok' && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.dot} opacity-75`} />}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${styles.dot}`} />
                        </span>
                        <p className="font-medium text-sm truncate">{h.label}</p>
                      </div>
                      {styles.icon}
                    </div>
                    <p className={`text-[11px] mt-1.5 font-semibold uppercase ${styles.labelCls}`}>{styles.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{h.detail}</p>
                    {typeof h.latency_ms === 'number' && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">{h.latency_ms}ms</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Webhook className="w-4 h-4" /> n8n Webhook</CardTitle>
            <CardDescription>Mỗi lead Calculator sẽ được POST tới URL này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n.com/webhook/agriflow-lead"
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
              </Button>
              <Button variant="outline" onClick={testWebhook} disabled={!webhookUrl.trim()} className="gap-2">
                <ExternalLink className="w-4 h-4" /> Test
              </Button>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
              Payload mẫu: <code>{`{ lead_id, customer:{name,phone,province}, calculator:{...}, dealer:{...} }`}</code>
            </div>
          </CardContent>
        </Card>

        {/* ============= KÊNH TRACKING — collapsible inputs ============= */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" /> Kênh Tracking</CardTitle>
            <CardDescription>Bật kênh để mở ô nhập credentials · các giá trị lưu vào DB và áp dụng ngay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channels.map((c) => {
              const isOn = tracking[c.key];
              const canTest = c.key === 'internal' ? true : c.ready;
              return (
                <div
                  key={c.key}
                  className={cn(
                    'rounded-lg border transition-colors',
                    isOn ? 'border-primary/30 bg-primary/[0.02]' : 'border-border bg-muted/20',
                  )}
                >
                  <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          'inline-flex h-2 w-2 rounded-full shrink-0',
                          c.ready ? 'bg-success' : isOn ? 'bg-warning' : 'bg-muted-foreground/40',
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.ready ? 'Đã cấu hình' : (isOn ? 'Đang bật — cần điền credentials' : c.sub)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => testChannel(c.label)}
                        disabled={!canTest}
                        title={canTest ? 'Gửi event test' : 'Nhập credentials trước'}
                      >
                        <PlayCircle className="w-3 h-3" /> Test
                      </Button>
                      <Switch
                        checked={isOn}
                        onCheckedChange={(v) => setTracking((p) => ({ ...p, [c.key]: v }))}
                      />
                    </div>
                  </div>
                  {/* Accordion-style fields */}
                  {c.fields && (
                    <div
                      className={cn(
                        'grid transition-all duration-200 ease-in-out',
                        isOn ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 pt-1 border-t border-border/50">
                          {c.fields}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-warning/5 border border-warning/20 rounded p-3">
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>Khi chưa có credentials, event vẫn được log vào BI nội bộ (status <code>skipped:no-credentials</code>).</span>
            </div>

            <Button onClick={save} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu cấu hình Tracking
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> Google Maps · Distance Matrix</CardTitle>
          <CardDescription>Tính khoảng cách thực tế (driving) thay vì đường chim bay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={mapsKeyConfigured ? 'default' : 'secondary'}>
              {mapsKeyConfigured ? 'API Key đã cấu hình' : 'Chưa có API Key — fallback Haversine'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Edge function <code>distance-matrix</code> đã sẵn sàng. <code>GOOGLE_MAPS_API_KEY</code> cần
            được cấu hình ở Backend → Edge Function Secrets (không lưu trong DB vì là server-side key).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" /> Export BI → Google BigQuery</CardTitle>
          <CardDescription>Đẩy <code>calculator_leads</code> + <code>tracking_events</code> sang n8n để insert vào BigQuery cho Looker Studio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <Label htmlFor="bi-url">n8n BigQuery Webhook URL</Label>
              <Input id="bi-url" value={bi.bi_export_webhook_url} placeholder="https://n8n.com/webhook/agriflow-bq"
                onChange={(e) => setBi((p) => ({ ...p, bi_export_webhook_url: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="bi-dataset">BigQuery Dataset</Label>
              <Input id="bi-dataset" value={bi.bq_dataset}
                onChange={(e) => setBi((p) => ({ ...p, bq_dataset: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="bi-lookback">Lookback (giờ)</Label>
              <Input id="bi-lookback" type="number" min={1} max={720} value={bi.lookback_hours}
                onChange={(e) => setBi((p) => ({ ...p, lookback_hours: Number(e.target.value) || 24 }))} />
            </div>
            <div className="flex items-end">
              <div className="flex items-center justify-between gap-3 w-full p-2 rounded border">
                <div>
                  <p className="text-sm font-medium">Bật cron tự động</p>
                  <p className="text-xs text-muted-foreground">Chạy mỗi đêm 02:00</p>
                </div>
                <Switch checked={bi.enabled} onCheckedChange={(v) => setBi((p) => ({ ...p, enabled: v }))} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu cấu hình
            </Button>
            <Button onClick={() => runBiExport(true)} variant="outline" size="sm" className="gap-2">
              <PlayCircle className="w-4 h-4" /> Dry-run (xem mẫu)
            </Button>
            <Button onClick={() => runBiExport(false)} variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" /> Chạy ngay
            </Button>
          </div>

          {biLastRun?.at && (
            <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
              Lần chạy gần nhất: <strong>{format(new Date(biLastRun.at), 'dd/MM HH:mm:ss')}</strong> ·
              Status: <strong>{biLastRun.status}</strong> ·
              Leads: {biLastRun.counts?.calculator_leads ?? 0} · Events: {biLastRun.counts?.tracking_events ?? 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhật ký sự kiện (50 gần nhất)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có sự kiện nào</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Sự kiện</TableHead>
                  <TableHead>URL nguồn</TableHead>
                  <TableHead>FB</TableHead>
                  <TableHead>TikTok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">{format(new Date(e.created_at), 'dd/MM HH:mm:ss')}</TableCell>
                    <TableCell><Badge variant="outline">{e.event_name}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{e.url ?? '-'}</TableCell>
                    <TableCell>{statusBadge(e.fb_status)}</TableCell>
                    <TableCell>{statusBadge(e.tiktok_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
