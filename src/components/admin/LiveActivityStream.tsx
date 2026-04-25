import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Calculator, Eye, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ActivityItem } from '@/hooks/useDashboardMetrics';

interface Props { items: ActivityItem[]; loading?: boolean; onRefresh: () => void }

const STATUS_STYLES: Record<ActivityItem['syncStatus'], string> = {
  ok: 'bg-success/15 text-success',
  pending: 'bg-warning/15 text-warning',
  error: 'bg-destructive/15 text-destructive',
  na: 'bg-muted text-muted-foreground',
};
const STATUS_LABEL: Record<ActivityItem['syncStatus'], string> = {
  ok: 'Synced',
  pending: 'Pending',
  error: 'Failed',
  na: '—',
};

function pickIcon(title: string) {
  if (title.includes('gọi')) return Phone;
  if (title.includes('Zalo')) return MessageCircle;
  if (title.includes('máy tính') || title.includes('Lead')) return Calculator;
  if (title.includes('xem') || title.includes('Xem')) return Eye;
  return Activity;
}

export default function LiveActivityStream({ items, loading, onRefresh }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            Live Activity Stream
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-normal">{items.length} mục</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[460px] overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted/40 rounded animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Chưa có hoạt động nào trong 7 ngày qua.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((it) => {
                const Icon = pickIcon(it.title);
                return (
                  <li key={it.id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                    <div className={`p-1.5 rounded-md shrink-0 ${it.kind === 'lead' ? 'bg-primary/12 text-primary' : 'bg-info/12 text-info'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{it.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {it.detail} · <span className="text-foreground/70">{it.source}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`text-[9px] border-0 ${STATUS_STYLES[it.syncStatus]}`}>
                        {STATUS_LABEL[it.syncStatus]}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(it.ts), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
