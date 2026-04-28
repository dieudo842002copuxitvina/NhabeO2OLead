'use client';

import React, { useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  PanelTop,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  RotateCcw,
  Monitor,
  Smartphone,
  Settings2,
  Newspaper,
  TrendingUp,
  Droplets,
  MapPin,
  Package,
  Zap,
  BarChart3,
  Users,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────
type DensityLevel = 'compact' | 'normal' | 'spacious';

interface SectionConfig {
  id: string;
  label: string;
  icon: any;
  visible: boolean;
  order: number;
}

interface LayoutConfig {
  density: DensityLevel;
  sections: SectionConfig[];
}

const DENSITY_OPTIONS: Array<{
  value: DensityLevel;
  label: string;
  description: string;
  gap: string;
  padding: string;
}> = [
  { value: 'compact', label: 'Compact', description: 'Mật độ cao, padding nhỏ', gap: '8px', padding: '12px' },
  { value: 'normal', label: 'Normal', description: 'Cân bằng, dễ đọc', gap: '16px', padding: '20px' },
  { value: 'spacious', label: 'Spacious', description: 'Thoáng, nhiều khoảng trắng', gap: '24px', padding: '32px' },
];

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Hero Banner', icon: Monitor, visible: true, order: 0 },
  { id: 'featured-products', label: 'Sản phẩm nổi bật', icon: Package, visible: true, order: 1 },
  { id: 'market-prices', label: 'Giá nông sản hôm nay', icon: TrendingUp, visible: true, order: 2 },
  { id: 'tech-news', label: 'Tin tức kỹ thuật', icon: Newspaper, visible: true, order: 3 },
  { id: 'irrigation-tools', label: 'Công cụ dự toán tưới', icon: Droplets, visible: true, order: 4 },
  { id: 'dealer-network', label: 'Mạng lưới đại lý', icon: MapPin, visible: true, order: 5 },
  { id: 'roi-calculator', label: 'Bảng tính ROI', icon: BarChart3, visible: true, order: 6 },
  { id: 'testimonials', label: 'Đánh giá khách hàng', icon: Users, visible: false, order: 7 },
  { id: 'promo-banner', label: 'Banner khuyến mãi', icon: Zap, visible: false, order: 8 },
];

const DEFAULT_CONFIG: LayoutConfig = {
  density: 'normal',
  sections: DEFAULT_SECTIONS,
};

// ─── Main Page ───────────────────────────────────────────────────────
export default function PortalLayoutPage() {
  const [config, setConfig] = useState<LayoutConfig>({ ...DEFAULT_CONFIG });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);

  const setDensity = (density: DensityLevel) => {
    setConfig((prev) => ({ ...prev, density }));
  };

  const toggleVisibility = (sectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === sorted.length - 1) return prev;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const newSections = sorted.map((s, i) => {
        if (i === idx) return { ...s, order: swapIdx };
        if (i === swapIdx) return { ...s, order: idx };
        return { ...s, order: i };
      });

      return { ...prev, sections: newSections };
    });
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG, sections: DEFAULT_SECTIONS.map((s) => ({ ...s })) });
    toast({ title: '↩️ Đã khôi phục mặc định' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const layoutValue = {
        density: config.density,
        sections: sortedSections.map((s) => ({
          id: s.id,
          label: s.label,
          visible: s.visible,
          order: s.order,
        })),
      };

      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'portal_layout_config',
            value: layoutValue as any,
            description: 'Cấu hình bố cục trang chủ Portal — Density + Section order',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast({
        title: '✅ Đã lưu bố cục Portal',
        description: 'Trang chủ sẽ tự động render theo cấu hình mới.',
      });
    } catch (err: any) {
      toast({
        title: '❌ Lỗi khi lưu',
        description: err?.message || 'Không thể lưu.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const densityMeta = DENSITY_OPTIONS.find((d) => d.value === config.density)!;

  return (
    <AdminShell title="Bố cục Portal" subtitle="Quản lý Density, thứ tự Section và hiển thị trang chủ">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Controls */}
        <div className="space-y-5 xl:col-span-7">
          {/* Density Level */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Density Level</CardTitle>
              <CardDescription className="text-[11px]">
                Thay đổi khoảng cách (--gap) và padding (--padding) cho toàn bộ trang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {DENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDensity(opt.value)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all',
                      config.density === opt.value
                        ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-sm'
                        : 'border-border/50 hover:border-border hover:bg-muted/30'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{opt.label}</span>
                      {config.density === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-[#2E7D32]" />
                      )}
                    </div>
                    <p className="mb-2 text-[10px] text-muted-foreground">{opt.description}</p>
                    {/* Visual density indicator */}
                    <div className="space-y-0.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded bg-muted"
                          style={{
                            height: opt.value === 'compact' ? 4 : opt.value === 'normal' ? 6 : 8,
                            marginBottom: opt.value === 'compact' ? 2 : opt.value === 'normal' ? 4 : 6,
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-[9px]">gap: {opt.gap}</Badge>
                      <Badge variant="outline" className="text-[9px]">pad: {opt.padding}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Reorder */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Thứ tự Section</CardTitle>
                  <CardDescription className="text-[11px]">
                    Kéo hoặc dùng nút mũi tên để sắp xếp các khối trên trang chủ
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {config.sections.filter((s) => s.visible).length}/{config.sections.length} hiển thị
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 p-3">
              {sortedSections.map((section, i) => {
                const IconComp = section.icon;
                return (
                  <div
                    key={section.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 transition-all',
                      section.visible
                        ? 'border-border/50 bg-card'
                        : 'border-border/20 bg-muted/20 opacity-50'
                    )}
                  >
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/40" />

                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted/50">
                      <IconComp
                        className="h-4 w-4"
                        style={{ color: section.visible ? '#2E7D32' : undefined }}
                      />
                    </div>

                    <div className="flex-1">
                      <p className={cn(
                        'text-sm font-medium',
                        section.visible ? 'text-foreground' : 'text-muted-foreground line-through'
                      )}>
                        {section.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Vị trí: #{i + 1}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={i === 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={i === sortedSections.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleVisibility(section.id)}
                      >
                        {section.visible ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl py-5 text-sm font-bold"
              style={{ backgroundColor: '#2E7D32' }}
            >
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu cấu hình bố cục
            </Button>
            <Button variant="outline" onClick={handleReset} className="rounded-xl px-6 py-5">
              <RotateCcw className="mr-2 h-4 w-4" />
              Mặc định
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="xl:col-span-5">
          <Card className="sticky top-20 border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <PanelTop className="h-4 w-4" style={{ color: '#2E7D32' }} />
                  Preview
                </CardTitle>
                <div className="flex rounded-lg border border-border/50 p-0.5">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={cn(
                      'rounded-md px-2 py-1 transition-colors',
                      previewMode === 'desktop' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={cn(
                      'rounded-md px-2 py-1 transition-colors',
                      previewMode === 'mobile' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <CardDescription className="text-[10px]">
                Density: <strong>{densityMeta.label}</strong> · Gap: {densityMeta.gap} · Padding: {densityMeta.padding}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'mx-auto overflow-hidden rounded-xl border border-border/50 bg-[#F9FAFB]',
                  previewMode === 'desktop' ? 'w-full' : 'w-[200px]'
                )}
                style={{
                  '--preview-gap': densityMeta.gap,
                  '--preview-padding': densityMeta.padding,
                } as React.CSSProperties}
              >
                {/* Mini preview of sections */}
                <div
                  className="space-y-0"
                  style={{ padding: `var(--preview-padding, 16px)`, gap: `var(--preview-gap, 12px)`, display: 'flex', flexDirection: 'column' }}
                >
                  {sortedSections
                    .filter((s) => s.visible)
                    .map((section, i) => {
                      const IconComp = section.icon;
                      return (
                        <div
                          key={section.id}
                          className="rounded-lg border border-slate-200 bg-white transition-all"
                          style={{
                            padding: config.density === 'compact' ? '6px 8px' : config.density === 'normal' ? '8px 10px' : '12px 14px',
                            marginBottom: config.density === 'compact' ? '4px' : config.density === 'normal' ? '8px' : '12px',
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <IconComp
                              className="flex-shrink-0"
                              style={{
                                color: '#2E7D32',
                                width: config.density === 'compact' ? 10 : 12,
                                height: config.density === 'compact' ? 10 : 12,
                              }}
                            />
                            <span
                              className="truncate font-medium text-slate-700"
                              style={{ fontSize: config.density === 'compact' ? 8 : config.density === 'normal' ? 9 : 10 }}
                            >
                              {section.label}
                            </span>
                          </div>
                          {/* Content placeholder bars */}
                          <div className="mt-1 space-y-0.5">
                            <div className="h-1 w-full rounded bg-slate-100" />
                            <div className="h-1 w-3/4 rounded bg-slate-100" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* JSON Export Preview */}
              <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  JSON Config (lưu vào DB)
                </p>
                <pre className="max-h-[160px] overflow-auto text-[10px] leading-relaxed text-muted-foreground">
{JSON.stringify(
  {
    density: config.density,
    sections: sortedSections
      .filter((s) => s.visible)
      .map((s) => ({ id: s.id, order: s.order })),
  },
  null,
  2
)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
