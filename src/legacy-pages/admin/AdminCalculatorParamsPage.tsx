import { useMemo, useState } from 'react';
import { Settings2, Save, RotateCcw, Loader2, Coins, Sliders, Sprout } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useCalculatorParams, type CalculatorParamRow } from '@/hooks/useCalculatorParams';
import { supabase } from '@/integrations/supabase/client';
import { calculate, formatVND, CROPS } from '@/lib/calculatorV2';

const CATEGORY_META: Record<CalculatorParamRow['category'], { label: string; icon: typeof Coins; tone: string }> = {
  price:  { label: 'Giá vật tư',         icon: Coins,  tone: 'text-warning' },
  factor: { label: 'Hệ số công thức',    icon: Sliders, tone: 'text-info' },
  crop:   { label: 'Thông số cây trồng', icon: Sprout, tone: 'text-success' },
  misc:   { label: 'Khác',               icon: Settings2, tone: 'text-muted-foreground' },
};

export default function AdminCalculatorParamsPage() {
  const { rows, params, loading, reload } = useCalculatorParams();
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CalculatorParamRow['category']>('price');

  const grouped = useMemo(() => {
    const g: Record<CalculatorParamRow['category'], CalculatorParamRow[]> = {
      price: [], factor: [], crop: [], misc: [],
    };
    rows.forEach(r => g[r.category].push(r));
    return g;
  }, [rows]);

  // Live preview: 5000m² Sầu riêng, phẳng, giếng — recompute with edits applied
  const previewParams = { ...params, ...edits };
  const preview = calculate(
    { crop: 'durian', areaM2: 5000, spacing: 8, slope: 'flat', waterSource: 'well' },
    previewParams,
  );

  const dirty = (key: string, current: number) => edits[key] !== undefined && edits[key] !== current;
  const changedKeys = Object.keys(edits).filter(k => {
    const r = rows.find(x => x.key === k);
    return r && edits[k] !== r.value;
  });

  const saveOne = async (row: CalculatorParamRow) => {
    const next = edits[row.key];
    if (next === undefined || next === row.value) return;
    setSaving(row.key);
    const { error } = await supabase
      .from('calculator_params')
      .update({ value: next })
      .eq('id', row.id);
    setSaving(null);
    if (error) {
      toast.error(`Không lưu được: ${error.message}`);
    } else {
      toast.success(`Đã cập nhật "${row.label}"`);
      setEdits(prev => {
        const next = { ...prev };
        delete next[row.key];
        return next;
      });
      reload();
    }
  };

  const saveAll = async () => {
    if (changedKeys.length === 0) return;
    setSaving('__all__');
    let ok = 0, fail = 0;
    for (const key of changedKeys) {
      const row = rows.find(r => r.key === key);
      if (!row) continue;
      const { error } = await supabase
        .from('calculator_params')
        .update({ value: edits[key] })
        .eq('id', row.id);
      if (error) fail++; else ok++;
    }
    setSaving(null);
    setEdits({});
    reload();
    toast.success(`Đã lưu ${ok} tham số${fail ? ` (${fail} lỗi)` : ''}`);
  };

  const reset = () => setEdits({});

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
            <Settings2 className="w-3 h-3 mr-1" /> Cấu hình hệ thống
          </Badge>
          <h1 className="text-3xl font-display font-bold">Tham số máy tính tưới</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chỉnh giá vật tư, hệ số công thức và thông số cây trồng. Áp dụng tức thì cho mọi khách trên web.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset} disabled={changedKeys.length === 0}>
            <RotateCcw className="w-4 h-4 mr-1" /> Bỏ thay đổi
          </Button>
          <Button onClick={saveAll} disabled={changedKeys.length === 0 || saving === '__all__'}>
            {saving === '__all__'
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang lưu...</>
              : <><Save className="w-4 h-4 mr-1" /> Lưu {changedKeys.length} thay đổi</>
            }
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Params editor — 2/3 */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as CalculatorParamRow['category'])}>
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 px-3">
                {(Object.keys(CATEGORY_META) as CalculatorParamRow['category'][]).map(cat => {
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  return (
                    <TabsTrigger key={cat} value={cat} className="gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${meta.tone}`} />
                      {meta.label} <span className="text-[10px] opacity-60">({grouped[cat].length})</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {(Object.keys(CATEGORY_META) as CalculatorParamRow['category'][]).map(cat => (
                <TabsContent key={cat} value={cat} className="m-0">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Đang tải...
                    </div>
                  ) : grouped[cat].length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">Chưa có tham số.</div>
                  ) : (
                    <div className="divide-y">
                      {grouped[cat].map(row => {
                        const editVal = edits[row.key];
                        const isDirty = dirty(row.key, row.value);
                        return (
                          <div key={row.id} className="p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center hover:bg-muted/30">
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{row.label}</p>
                              {row.description && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">{row.description}</p>
                              )}
                              <code className="text-[10px] text-muted-foreground/70">{row.key}</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step={row.category === 'factor' ? 0.01 : 1}
                                value={editVal ?? row.value}
                                onChange={e => setEdits(p => ({ ...p, [row.key]: Number(e.target.value) }))}
                                className={`w-32 text-right tabular-nums ${isDirty ? 'border-warning ring-1 ring-warning/30' : ''}`}
                              />
                              {row.unit && <span className="text-xs text-muted-foreground w-16 shrink-0">{row.unit}</span>}
                              <Button
                                size="sm"
                                variant={isDirty ? 'default' : 'ghost'}
                                disabled={!isDirty || saving === row.key}
                                onClick={() => saveOne(row)}
                                className="h-8"
                              >
                                {saving === row.key
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Save className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>

        {/* Live preview — 1/3 */}
        <Card className="p-5 h-fit sticky top-4 bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">Xem trước báo giá</span>
            {changedKeys.length > 0 && (
              <Badge variant="outline" className="text-[10px] border-warning text-warning">
                Chưa lưu
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Mẫu: 5.000 m² Sầu riêng, phẳng, giếng khoan
          </p>
          <div className="space-y-2 text-sm">
            {preview.lines.map((l, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate mr-2">{l.item}</span>
                <span className="tabular-nums">{formatVND(l.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between items-baseline">
            <span className="font-medium">Tổng dự toán</span>
            <span className="font-display font-bold text-lg text-primary tabular-nums">
              {formatVND(preview.totalCost)}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 grid grid-cols-3 gap-1 pt-2 border-t">
            <div>{preview.nozzleCount} béc</div>
            <div>{preview.pipeMeters} m ống</div>
            <div>{preview.pumpHP} HP</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  // Inline svg to avoid extra import
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
