import { useEffect, useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, Node, Edge, Position, Handle, NodeProps,
  MarkerType, useNodesState, useEdgesState, NodeChange, applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Facebook, Search, Globe, Database, Workflow, MessageCircle,
  Activity, RefreshCw, CheckCircle2, XCircle, AlertCircle, Loader2,
  Music2, Sparkles, BarChart3, Phone, Server, RotateCcw,
} from 'lucide-react';

/* =========================================================================
 * AdminNervousSystemPage — Omnichannel Activity Flow
 * 3-tier flow: Sources → Core Engine → Outcomes
 * Powered by React Flow with live stats from tracking_events + system-health.
 * ========================================================================= */

type NodeKey =
  // Sources
  | 'fb_ads' | 'gg_search' | 'tiktok' | 'seo_landing'
  // Core
  | 'website' | 'agriflow_brain' | 'supabase'
  // Outcomes
  | 'zalo' | 'call_dealer' | 'bigquery' | 'n8n';

type Status = 'ok' | 'down' | 'warn' | 'idle';
type Group = 'source' | 'core' | 'outcome';

interface NodeStats {
  status: Status;
  events24h: number;
  successRate: number;
  latencyMs?: number;
  detail: string;
}

interface EdgeStats {
  from: NodeKey;
  to: NodeKey;
  label: string;
  count24h: number;
  status: Status;
}

interface NodeMeta {
  label: string;
  sub: string;
  icon: typeof Facebook;
  accent: string;
  group: Group;
}

const NODE_META: Record<NodeKey, NodeMeta> = {
  // Sources
  fb_ads:        { label: 'Facebook Ads',  sub: 'Meta CAPI',          icon: Facebook,      accent: 'hsl(217 91% 60%)', group: 'source' },
  gg_search:     { label: 'Google Search', sub: 'GA4 + Ads',          icon: Search,        accent: 'hsl(40 96% 55%)',  group: 'source' },
  tiktok:        { label: 'TikTok',        sub: 'TikTok Pixel',       icon: Music2,        accent: 'hsl(330 90% 60%)', group: 'source' },
  seo_landing:   { label: 'Website SEO',   sub: '120+ Landing pages', icon: Globe,         accent: 'hsl(160 70% 50%)', group: 'source' },
  // Core
  website:       { label: 'Web Server',    sub: 'Vite SPA + Edge',    icon: Server,        accent: 'hsl(142 71% 45%)', group: 'core' },
  agriflow_brain:{ label: 'AgriFlow Logic',sub: 'The Brain · AI Rules', icon: Sparkles,    accent: 'hsl(280 80% 65%)', group: 'core' },
  supabase:      { label: 'Lovable Cloud', sub: 'Postgres + Edge',    icon: Database,      accent: 'hsl(160 84% 39%)', group: 'core' },
  // Outcomes
  zalo:          { label: 'Zalo Lead',     sub: 'CRM Đại lý',         icon: MessageCircle, accent: 'hsl(200 95% 50%)', group: 'outcome' },
  call_dealer:   { label: 'Call Dealer',   sub: 'Cuộc gọi trực tiếp', icon: Phone,         accent: 'hsl(20 90% 55%)',  group: 'outcome' },
  bigquery:      { label: 'BigQuery',      sub: 'Báo cáo & BI',       icon: BarChart3,     accent: 'hsl(220 90% 60%)', group: 'outcome' },
  n8n:           { label: 'n8n',           sub: 'Workflow Automation',icon: Workflow,      accent: 'hsl(15 80% 60%)',  group: 'outcome' },
};

const STATUS_CSS: Record<Status, { stroke: string; glow: string; badge: string }> = {
  ok:   { stroke: 'hsl(142 71% 50%)', glow: '0 0 14px hsl(142 71% 50% / 0.7)', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  warn: { stroke: 'hsl(40 96% 55%)',  glow: '0 0 12px hsl(40 96% 55% / 0.7)',  badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  down: { stroke: 'hsl(0 84% 60%)',   glow: '0 0 16px hsl(0 84% 60% / 0.8)',   badge: 'bg-red-500/20 text-red-400 border-red-500/40' },
  idle: { stroke: 'hsl(220 9% 46%)',  glow: '0 0 6px hsl(220 9% 46% / 0.3)',   badge: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
};

// ---------- Custom Node ----------
interface FlowNodeData {
  nodeKey: NodeKey;
  stats: NodeStats;
  onClick: (k: NodeKey) => void;
  brainScenarios?: string[];
}

function FlowNode({ data }: NodeProps<FlowNodeData>) {
  const meta = NODE_META[data.nodeKey];
  const s = STATUS_CSS[data.stats.status];
  const Icon = meta.icon;
  const isBrain = data.nodeKey === 'agriflow_brain';

  const card = (
    <div
      onClick={() => data.onClick(data.nodeKey)}
      className="rounded-xl border-2 px-4 py-3 min-w-[180px] cursor-pointer transition-all hover:scale-[1.04] backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, hsl(222 47% 12% / 0.95), hsl(222 47% 8% / 0.95))',
        borderColor: s.stroke,
        boxShadow: `${s.glow}, inset 0 0 24px hsl(222 47% 4% / 0.5)`,
      }}
    >
      <Handle type="target" position={Position.Left}  style={{ background: s.stroke, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Right} style={{ background: s.stroke, width: 8, height: 8, border: 'none' }} />
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${meta.accent}33`, color: meta.accent, boxShadow: `inset 0 0 10px ${meta.accent}33` }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-100 leading-tight">{meta.label}</p>
          <p className="text-[10px] text-slate-400">{meta.sub}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/50">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">24h</span>
        <span className="text-xs font-mono font-bold" style={{ color: s.stroke, textShadow: `0 0 8px ${s.stroke}` }}>
          {data.stats.events24h.toLocaleString('vi-VN')}
        </span>
      </div>
    </div>
  );

  // Brain node has hover popover with active AI scenarios
  if (isBrain && data.brainScenarios && data.brainScenarios.length > 0) {
    return (
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>{card}</HoverCardTrigger>
        <HoverCardContent
          side="top"
          className="w-72 border-purple-500/40 bg-slate-950/95 text-slate-100 backdrop-blur-md"
        >
          <p className="text-xs font-bold flex items-center gap-1.5 text-purple-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Kịch bản AI đang kích hoạt
          </p>
          <ul className="space-y-1.5">
            {data.brainScenarios.map((sc, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0 shadow-[0_0_4px_hsl(280_80%_65%)]" />
                {sc}
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    );
  }
  return card;
}
const nodeTypes = { flow: FlowNode };

// ---------- Layout ----------
const LS_KEY = 'admin_nervous_system_positions_v2';

const DEFAULT_POSITIONS: Record<NodeKey, { x: number; y: number }> = {
  // Column 1: Sources
  fb_ads:         { x: 0,    y: 0   },
  gg_search:      { x: 0,    y: 130 },
  tiktok:         { x: 0,    y: 260 },
  seo_landing:    { x: 0,    y: 390 },
  // Column 2-4: Core
  website:        { x: 280,  y: 130 },
  agriflow_brain: { x: 540,  y: 195 },
  supabase:       { x: 800,  y: 195 },
  // Column 5: Outcomes
  zalo:           { x: 1080, y: 0   },
  call_dealer:    { x: 1080, y: 130 },
  n8n:            { x: 1080, y: 260 },
  bigquery:       { x: 1080, y: 390 },
};

function loadPositions(): Record<NodeKey, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_POSITIONS;
    const parsed = JSON.parse(raw) as Partial<Record<NodeKey, { x: number; y: number }>>;
    return { ...DEFAULT_POSITIONS, ...parsed };
  } catch {
    return DEFAULT_POSITIONS;
  }
}

function savePositions(nodes: Node[]) {
  try {
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => { map[n.id] = n.position; });
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {/* ignore */}
}

// ---------- Page ----------
export default function AdminNervousSystemPage() {
  const [loading, setLoading] = useState(true);
  const [refreshTs, setRefreshTs] = useState(Date.now());
  const [selected, setSelected] = useState<NodeKey | null>(null);
  const [nodeStats, setNodeStats] = useState<Record<NodeKey, NodeStats>>(() => initialNodeStats());
  const [edgeStats, setEdgeStats] = useState<EdgeStats[]>([]);
  const [brainScenarios, setBrainScenarios] = useState<string[]>([]);

  const refresh = useCallback(() => setRefreshTs(Date.now()), []);

  // Fetch live stats
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - 24 * 3600_000).toISOString();
        const [{ data: events }, healthResp, { data: rules }] = await Promise.all([
          supabase.from('tracking_events')
            .select('event_name,payload,fb_status,tiktok_status,created_at')
            .gte('created_at', since)
            .limit(5000),
          supabase.functions.invoke('system-health').catch(() => ({ data: null, error: null })),
          supabase.from('ai_rules').select('name,banner,config').eq('status', 'active'),
        ]);
        if (cancelled) return;

        const evs = (events ?? []) as Array<{ event_name: string; payload: unknown; fb_status: string | null; tiktok_status: string | null }>;
        const health = (healthResp?.data as { results?: Array<{ service: string; status: string; latency_ms?: number; detail: string }> } | null)?.results ?? [];

        // Bucket events by source / outcome
        let fbCount = 0, ggCount = 0, ttCount = 0, seoCount = 0, totalSite = evs.length;
        let fbOk = 0, fbErr = 0, ttOk = 0, ttErr = 0;
        let inquiries = 0, calls = 0, zaloClicks = 0;
        evs.forEach((e) => {
          const p = (e.payload ?? {}) as { adSource?: string; source?: string };
          const src = (p.adSource ?? p.source ?? '').toLowerCase();
          if (src.includes('facebook')) fbCount++;
          else if (src.includes('google')) ggCount++;
          else if (src.includes('tiktok')) ttCount++;
          else if (src.includes('seo') || src.includes('landing') || src.includes('organic')) seoCount++;
          if (e.fb_status?.startsWith('success')) fbOk++;
          else if (e.fb_status && !e.fb_status.startsWith('skipped')) fbErr++;
          if (e.tiktok_status?.startsWith('success')) ttOk++;
          else if (e.tiktok_status && !e.tiktok_status.startsWith('skipped')) ttErr++;
          if (e.event_name === 'inquiry_submit' || e.event_name === 'calculator_lead_submit') inquiries++;
          if (e.event_name === 'call_click') calls++;
          if (e.event_name === 'zalo_click') zaloClicks++;
        });

        const findHealth = (svc: string) => health.find((h) => h.service === svc);
        const fbHealth = findHealth('fb_capi');
        const ttHealth = findHealth('tiktok_pixel');
        const n8nHealth = findHealth('n8n');
        const dbHealth = findHealth('database');
        const ga4Health = findHealth('ga4');
        const bqHealth = findHealth('bigquery');

        const mapStatus = (h?: { status: string }): Status =>
          !h ? 'idle' :
          h.status === 'ok' ? 'ok' :
          h.status === 'down' ? 'down' : 'warn';

        const fbRate = fbOk + fbErr > 0 ? Math.round((fbOk / (fbOk + fbErr)) * 100) : (fbHealth?.status === 'ok' ? 100 : 0);
        const ttRate = ttOk + ttErr > 0 ? Math.round((ttOk / (ttOk + ttErr)) * 100) : (ttHealth?.status === 'ok' ? 100 : 0);

        const ns: Record<NodeKey, NodeStats> = {
          fb_ads: {
            status: fbErr > fbOk * 2 ? 'down' : mapStatus(fbHealth),
            events24h: fbCount, successRate: fbRate, latencyMs: fbHealth?.latency_ms,
            detail: fbHealth?.detail ?? 'Chưa cấu hình Pixel/Token',
          },
          gg_search: {
            status: mapStatus(ga4Health), events24h: ggCount,
            successRate: ga4Health?.status === 'ok' ? 100 : 0, latencyMs: ga4Health?.latency_ms,
            detail: ga4Health?.detail ?? 'GA4 Measurement Protocol',
          },
          tiktok: {
            status: ttErr > ttOk * 2 ? 'down' : mapStatus(ttHealth),
            events24h: ttCount, successRate: ttRate, latencyMs: ttHealth?.latency_ms,
            detail: ttHealth?.detail ?? 'Chưa cấu hình TikTok Pixel',
          },
          seo_landing: {
            status: seoCount > 0 ? 'ok' : 'idle', events24h: seoCount, successRate: 100,
            detail: '120+ landing page SEO theo cây trồng & vùng miền',
          },
          website: {
            status: 'ok', events24h: totalSite, successRate: 100,
            detail: `${totalSite} sự kiện tổng hợp trong 24h`,
          },
          agriflow_brain: {
            status: (rules?.length ?? 0) > 0 ? 'ok' : 'warn',
            events24h: rules?.length ?? 0,
            successRate: 100,
            detail: `${rules?.length ?? 0} AI rule đang chạy · matching địa lý + kịch bản thời tiết/giá`,
          },
          supabase: {
            status: mapStatus(dbHealth), events24h: totalSite,
            successRate: dbHealth?.status === 'ok' ? 100 : 0, latencyMs: dbHealth?.latency_ms,
            detail: dbHealth?.detail ?? 'Postgres + Edge Functions',
          },
          n8n: {
            status: mapStatus(n8nHealth), events24h: inquiries,
            successRate: n8nHealth?.status === 'ok' ? 100 : 0, latencyMs: n8nHealth?.latency_ms,
            detail: n8nHealth?.detail ?? 'Webhook chưa cấu hình',
          },
          zalo: {
            status: zaloClicks > 0 ? 'ok' : 'idle', events24h: zaloClicks, successRate: 100,
            detail: `${zaloClicks} click Zalo → CRM Đại lý`,
          },
          call_dealer: {
            status: calls > 0 ? 'ok' : 'idle', events24h: calls, successRate: 100,
            detail: `${calls} cuộc gọi trực tiếp tới đại lý`,
          },
          bigquery: {
            status: mapStatus(bqHealth), events24h: totalSite,
            successRate: bqHealth?.status === 'ok' ? 100 : 0, latencyMs: bqHealth?.latency_ms,
            detail: bqHealth?.detail ?? 'BI export — cron hàng đêm',
          },
        };
        setNodeStats(ns);

        // Brain scenarios
        const scenarios = (rules ?? []).map((r) => {
          const banner = (r.banner ?? {}) as { headline?: string; title?: string };
          return r.name + (banner.headline ? ` · "${banner.headline}"` : '');
        });
        if (scenarios.length === 0) {
          scenarios.push('Mùa khô: ưu tiên hệ thống tưới nhỏ giọt');
          scenarios.push('Cà phê tăng giá: đề xuất nâng cấp drone');
          scenarios.push('Geo-matching Top 3 đại lý trong bán kính 50km');
        }
        setBrainScenarios(scenarios);

        // Edges (Sources → Web → Brain → DB → Outcomes)
        const e: EdgeStats[] = [
          // Sources → Web Server
          { from: 'fb_ads',         to: 'website',        label: 'FB clicks',    count24h: fbCount,        status: ns.fb_ads.status === 'down' ? 'down' : (fbCount > 0 ? 'ok' : 'idle') },
          { from: 'gg_search',      to: 'website',        label: 'Organic',      count24h: ggCount,        status: ggCount > 0 ? 'ok' : 'idle' },
          { from: 'tiktok',         to: 'website',        label: 'TikTok',       count24h: ttCount,        status: ns.tiktok.status === 'down' ? 'down' : (ttCount > 0 ? 'ok' : 'idle') },
          { from: 'seo_landing',    to: 'website',        label: 'SEO landing',  count24h: seoCount,       status: seoCount > 0 ? 'ok' : 'idle' },
          // Web → Brain → DB
          { from: 'website',        to: 'agriflow_brain', label: 'Personalize',  count24h: totalSite,      status: ns.agriflow_brain.status },
          { from: 'agriflow_brain', to: 'supabase',       label: 'Read/Write',   count24h: totalSite,      status: ns.supabase.status },
          // Brain → CAPI feedback (server-side)
          { from: 'website',        to: 'fb_ads',         label: 'CAPI',         count24h: fbOk + fbErr,   status: ns.fb_ads.status },
          // DB → Outcomes
          { from: 'supabase',       to: 'zalo',           label: '+Zalo Lead',   count24h: zaloClicks,     status: ns.zalo.status },
          { from: 'supabase',       to: 'call_dealer',    label: '+Call Lead',   count24h: calls,          status: ns.call_dealer.status },
          { from: 'supabase',       to: 'n8n',            label: 'Webhook',      count24h: inquiries,      status: ns.n8n.status },
          { from: 'supabase',       to: 'bigquery',       label: 'BI export',    count24h: totalSite,      status: ns.bigquery.status },
        ];
        setEdgeStats(e);
      } catch (err) {
        console.error('[nervous-system] load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTs]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  const onNodeClick = useCallback((k: NodeKey) => setSelected(k), []);

  // Build initial nodes from saved positions
  const initialNodes: Node[] = useMemo(() => {
    const positions = loadPositions();
    return (Object.keys(NODE_META) as NodeKey[]).map((k) => ({
      id: k,
      type: 'flow',
      position: positions[k],
      data: { nodeKey: k, stats: nodeStats[k], onClick: onNodeClick, brainScenarios },
      draggable: true,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once

  const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialNodes);

  // Sync stats into node data on every refresh
  useEffect(() => {
    setNodes((curr) => curr.map((n) => ({
      ...n,
      data: { ...n.data, stats: nodeStats[n.id as NodeKey], brainScenarios },
    })));
  }, [nodeStats, brainScenarios, setNodes]);

  // Persist positions on drag
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((curr) => {
      const next = applyNodeChanges(changes, curr);
      if (changes.some((c) => c.type === 'position' && (c as { dragging?: boolean }).dragging === false)) {
        savePositions(next);
      }
      return next;
    });
  }, [setNodes]);

  const resetLayout = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setNodes((curr) => curr.map((n) => ({ ...n, position: DEFAULT_POSITIONS[n.id as NodeKey] })));
  }, [setNodes]);

  const rfEdges: Edge[] = useMemo(() => edgeStats.map((e, idx) => {
    const css = STATUS_CSS[e.status];
    const isDown = e.status === 'down';
    return {
      id: `${e.from}-${e.to}-${idx}`,
      source: e.from,
      target: e.to,
      animated: e.status === 'ok' || e.status === 'warn' || isDown,
      label: `${e.label} · ${e.count24h.toLocaleString('vi-VN')}`,
      labelStyle: { fill: 'hsl(220 9% 80%)', fontSize: 10, fontWeight: 700 },
      labelBgStyle: { fill: 'hsl(222 47% 6%)', fillOpacity: 0.92 },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 6,
      className: isDown ? 'rf-edge-down' : '',
      style: {
        stroke: css.stroke,
        strokeWidth: 2.2,
        filter: `drop-shadow(${css.glow})`,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: css.stroke, width: 18, height: 18 },
    };
  }), [edgeStats]);

  const [, setEdges] = useEdgesState(rfEdges);
  useEffect(() => { setEdges(rfEdges); }, [rfEdges, setEdges]);

  const okCount = Object.values(nodeStats).filter((s) => s.status === 'ok').length;
  const downCount = Object.values(nodeStats).filter((s) => s.status === 'down').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Hệ thần kinh số · Omnichannel Flow
          </h1>
          <p className="text-sm text-muted-foreground">
            Sources → Core Engine → Outcomes · Realtime data flow giữa 11 kênh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">{okCount} OK</Badge>
          {downCount > 0 && <Badge className="bg-red-500/10 text-red-500 border border-red-500/30">{downCount} lỗi</Badge>}
          <Button variant="outline" size="sm" onClick={resetLayout} title="Khôi phục vị trí mặc định">
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
            Làm mới
          </Button>
        </div>
      </div>

      {/* Group labels */}
      <div className="grid grid-cols-3 gap-3 text-[11px] uppercase tracking-wider font-bold">
        <div className="text-blue-400 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-center">
          ⚡ Nguồn lưu lượng (4)
        </div>
        <div className="text-purple-400 px-3 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-center">
          🧠 Hệ thống trung tâm (3)
        </div>
        <div className="text-emerald-400 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-center">
          🎯 Kênh chuyển đổi (4)
        </div>
      </div>

      {/* Flow canvas — dark techno look */}
      <Card className="overflow-hidden border-slate-800">
        <CardContent className="p-0">
          <div
            className="h-[640px] w-full relative"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(222 47% 11%) 0%, hsl(222 47% 5%) 100%)',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              proOptions={{ hideAttribution: true }}
              minZoom={0.3}
              maxZoom={1.6}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background color="hsl(222 47% 22%)" gap={28} size={1} />
              <Controls
                className="!bg-slate-900/80 !border-slate-700 [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-200"
                showInteractive={false}
              />
              <MiniMap
                className="!bg-slate-900/80 !border-slate-700"
                nodeColor={(n) => STATUS_CSS[nodeStats[n.id as NodeKey]?.status ?? 'idle'].stroke}
                maskColor="hsl(222 47% 4% / 0.7)"
              />
            </ReactFlow>

            {/* Edge animations + shake for down */}
            <style>{`
              .rf-edge-down path {
                animation: rfShake 0.6s ease-in-out infinite;
              }
              @keyframes rfShake {
                0%,100% { transform: translateY(0); }
                25%     { transform: translateY(-1px); }
                75%     { transform: translateY(1px); }
              }
              .react-flow__edge-path {
                stroke-dasharray: 6 4;
              }
              .react-flow__edge.animated .react-flow__edge-path {
                animation: rfDash 0.9s linear infinite;
              }
              @keyframes rfDash {
                from { stroke-dashoffset: 20; }
                to   { stroke-dashoffset: 0; }
              }
            `}</style>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Chú thích trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-xs">
          {([
            { s: 'ok' as Status,   l: 'Hoạt động — dòng chảy bình thường' },
            { s: 'warn' as Status, l: 'Cảnh báo — chưa cấu hình hoặc chậm' },
            { s: 'down' as Status, l: 'Lỗi kết nối — đường nối rung cảnh báo' },
            { s: 'idle' as Status, l: 'Chưa có sự kiện trong 24h' },
          ]).map(({ s, l }) => (
            <div key={s} className="flex items-center gap-2">
              <span className="inline-block w-8 h-1 rounded-full" style={{ background: STATUS_CSS[s].stroke, boxShadow: STATUS_CSS[s].glow }} />
              <span className="text-muted-foreground">{l}</span>
            </div>
          ))}
          <span className="ml-auto text-muted-foreground italic">Tip: kéo thả các nốt để sắp xếp lại — vị trí được lưu tự động.</span>
        </CardContent>
      </Card>

      {/* Node detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (() => {
            const meta = NODE_META[selected];
            const stats = nodeStats[selected];
            const Icon = meta.icon;
            const StatusIcon = stats.status === 'ok' ? CheckCircle2 : stats.status === 'down' ? XCircle : AlertCircle;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${meta.accent}22`, color: meta.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p>{meta.label}</p>
                      <p className="text-xs font-normal text-muted-foreground">{meta.sub}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="pt-1">{stats.detail}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${STATUS_CSS[stats.status].badge}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold capitalize">
                      {stats.status === 'ok' ? 'Hoạt động' : stats.status === 'down' ? 'Lỗi' : stats.status === 'warn' ? 'Cảnh báo' : 'Chưa hoạt động'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Stat label="Sự kiện 24h" value={stats.events24h.toLocaleString('vi-VN')} />
                    <Stat label="Success rate" value={`${stats.successRate}%`} />
                    <Stat label="Latency" value={stats.latencyMs !== undefined ? `${stats.latencyMs}ms` : '—'} />
                  </div>
                  {selected === 'agriflow_brain' && brainScenarios.length > 0 && (
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
                      <p className="text-xs font-bold text-purple-400 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Kịch bản đang kích hoạt
                      </p>
                      <ul className="space-y-1">
                        {brainScenarios.map((sc, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {sc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold font-mono mt-0.5">{value}</p>
    </div>
  );
}

function initialNodeStats(): Record<NodeKey, NodeStats> {
  const base: NodeStats = { status: 'idle', events24h: 0, successRate: 0, detail: 'Đang tải...' };
  return {
    fb_ads: base, gg_search: base, tiktok: base, seo_landing: base,
    website: base, agriflow_brain: base, supabase: base,
    zalo: base, call_dealer: base, n8n: base, bigquery: base,
  };
}
