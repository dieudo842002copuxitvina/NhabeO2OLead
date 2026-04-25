import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthResult {
  service: string;
  label: string;
  status: 'ok' | 'down' | 'not_configured';
  detail: string;
  latency_ms?: number;
}

const STATUS_META: Record<HealthResult['status'], { icon: typeof CheckCircle2; cls: string; label: string }> = {
  ok: { icon: CheckCircle2, cls: 'text-success bg-success/10 border-success/30', label: 'Hoạt động' },
  down: { icon: XCircle, cls: 'text-destructive bg-destructive/10 border-destructive/30', label: 'Lỗi' },
  not_configured: { icon: AlertCircle, cls: 'text-muted-foreground bg-muted border-border', label: 'Chưa cấu hình' },
};

export default function SystemHealthCard() {
  const [results, setResults] = useState<HealthResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const ping = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-health');
      if (error) throw error;
      const r = data as { results: HealthResult[]; checked_at: string };
      setResults(r.results ?? []);
      setCheckedAt(r.checked_at ?? new Date().toISOString());
    } catch (e) {
      console.error('[system-health] failed', e);
      setResults([
        { service: 'all', label: 'Health check', status: 'down', detail: e instanceof Error ? e.message : 'Lỗi không xác định' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ping();
    const t = setInterval(ping, 60_000); // re-check every 60s
    return () => clearInterval(t);
  }, []);

  const okCount = results.filter((r) => r.status === 'ok').length;
  const downCount = results.filter((r) => r.status === 'down').length;
  const overallCls = downCount > 0
    ? 'bg-destructive/10 text-destructive border-destructive/30'
    : okCount === results.length && okCount > 0
      ? 'bg-success/10 text-success border-success/30'
      : 'bg-warning/10 text-warning border-warning/30';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> Sức khỏe hệ thống
          </span>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] border ${overallCls}`}>
              {downCount > 0 ? `${downCount} lỗi` : okCount > 0 ? 'Tất cả OK' : 'Chưa rõ'}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={ping} disabled={loading}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.map((r) => {
          const meta = STATUS_META[r.status];
          const Icon = meta.icon;
          return (
            <div key={r.service} className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border ${meta.cls}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{r.label}</p>
                  <p className="text-[10px] opacity-80 truncate">{r.detail}</p>
                </div>
              </div>
              {r.latency_ms !== undefined && (
                <span className="text-[10px] font-mono shrink-0">{r.latency_ms}ms</span>
              )}
            </div>
          );
        })}
        {checkedAt && (
          <p className="text-[10px] text-muted-foreground text-right pt-1">
            Cập nhật {new Date(checkedAt).toLocaleTimeString('vi-VN')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
