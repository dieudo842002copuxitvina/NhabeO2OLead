'use client';

import React, { useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Blocks,
  Plus,
  Trash2,
  GripVertical,
  Save,
  RefreshCw,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Ruler,
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  Settings2,
  Box,
  Tag,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────
interface SpecFieldDef {
  id: string;
  key: string;
  label: string;
  unit: string;
  icon: string;
  required: boolean;
}

interface CategorySchema {
  categoryKey: string;
  categoryLabel: string;
  fields: SpecFieldDef[];
}

// ─── Available Icons ─────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: 'Ruler', label: 'Ruler', icon: Ruler },
  { value: 'Thermometer', label: 'Thermometer', icon: Thermometer },
  { value: 'Gauge', label: 'Gauge', icon: Gauge },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Droplets', label: 'Droplets', icon: Droplets },
  { value: 'Settings2', label: 'Settings2', icon: Settings2 },
  { value: 'Box', label: 'Box', icon: Box },
  { value: 'Tag', label: 'Tag', icon: Tag },
  { value: 'CircleDot', label: 'CircleDot', icon: CircleDot },
];

function getIconComponent(iconName: string) {
  return ICON_OPTIONS.find((i) => i.value === iconName)?.icon ?? Ruler;
}

// ─── Default Schema ──────────────────────────────────────────────────
const DEFAULT_SCHEMAS: CategorySchema[] = [
  {
    categoryKey: 'van',
    categoryLabel: 'Van',
    fields: [
      { id: '1', key: 'nominal_diameter', label: 'Đường kính danh định', unit: 'mm', icon: 'Ruler', required: true },
      { id: '2', key: 'max_pressure', label: 'Áp suất tối đa', unit: 'bar', icon: 'Gauge', required: true },
      { id: '3', key: 'material', label: 'Chất liệu', unit: '', icon: 'Box', required: false },
      { id: '4', key: 'connection_type', label: 'Kiểu kết nối', unit: '', icon: 'Settings2', required: false },
    ],
  },
  {
    categoryKey: 'pipe',
    categoryLabel: 'Ống',
    fields: [
      { id: '5', key: 'outer_diameter', label: 'Đường kính ngoài', unit: 'mm', icon: 'Ruler', required: true },
      { id: '6', key: 'wall_thickness', label: 'Độ dày thành ống', unit: 'mm', icon: 'Ruler', required: true },
      { id: '7', key: 'material', label: 'Chất liệu', unit: '', icon: 'Box', required: false },
      { id: '8', key: 'pressure_rating', label: 'Cấp áp suất', unit: 'bar', icon: 'Gauge', required: true },
      { id: '9', key: 'roll_length', label: 'Chiều dài cuộn', unit: 'm', icon: 'Ruler', required: false },
    ],
  },
  {
    categoryKey: 'pump',
    categoryLabel: 'Máy bơm',
    fields: [
      { id: '10', key: 'power', label: 'Công suất', unit: 'HP', icon: 'Zap', required: true },
      { id: '11', key: 'max_flow', label: 'Lưu lượng tối đa', unit: 'm³/h', icon: 'Droplets', required: true },
      { id: '12', key: 'max_head', label: 'Cột áp tối đa', unit: 'm', icon: 'Gauge', required: true },
      { id: '13', key: 'voltage', label: 'Điện áp', unit: 'V', icon: 'Zap', required: false },
    ],
  },
  {
    categoryKey: 'nozzle',
    categoryLabel: 'Béc tưới',
    fields: [
      { id: '14', key: 'flow_rate', label: 'Lưu lượng', unit: 'L/h', icon: 'Droplets', required: true },
      { id: '15', key: 'spray_radius', label: 'Bán kính phun', unit: 'm', icon: 'CircleDot', required: true },
      { id: '16', key: 'spray_angle', label: 'Góc phun', unit: '°', icon: 'Settings2', required: false },
    ],
  },
  {
    categoryKey: 'sensor',
    categoryLabel: 'Cảm biến',
    fields: [
      { id: '17', key: 'measurement_range', label: 'Phạm vi đo', unit: '', icon: 'Gauge', required: true },
      { id: '18', key: 'accuracy', label: 'Độ chính xác', unit: '', icon: 'CircleDot', required: true },
      { id: '19', key: 'protocol', label: 'Giao thức', unit: '', icon: 'Settings2', required: false },
    ],
  },
];

let nextId = 100;
function genId() {
  return String(++nextId);
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<CategorySchema[]>(DEFAULT_SCHEMAS);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_SCHEMAS[0].categoryKey);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editField, setEditField] = useState<SpecFieldDef | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formKey, setFormKey] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formIcon, setFormIcon] = useState('Ruler');
  const [formRequired, setFormRequired] = useState(false);

  const activeSchema = schemas.find((s) => s.categoryKey === selectedCategory);
  const activeFields = activeSchema?.fields ?? [];

  const openAddField = () => {
    setEditField(null);
    setFormKey('');
    setFormLabel('');
    setFormUnit('');
    setFormIcon('Ruler');
    setFormRequired(false);
    setDrawerOpen(true);
  };

  const openEditField = (field: SpecFieldDef) => {
    setEditField(field);
    setFormKey(field.key);
    setFormLabel(field.label);
    setFormUnit(field.unit);
    setFormIcon(field.icon);
    setFormRequired(field.required);
    setDrawerOpen(true);
  };

  const handleSaveField = () => {
    if (!formKey.trim() || !formLabel.trim()) {
      toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập Key và Label.', variant: 'destructive' });
      return;
    }

    // Check duplicate key
    if (!editField && activeFields.some((f) => f.key === formKey.trim())) {
      toast({ title: '⚠️ Key đã tồn tại', description: `Key "${formKey}" đã có trong danh mục này.`, variant: 'destructive' });
      return;
    }

    setSchemas((prev) =>
      prev.map((schema) => {
        if (schema.categoryKey !== selectedCategory) return schema;

        const newField: SpecFieldDef = {
          id: editField?.id ?? genId(),
          key: formKey.trim(),
          label: formLabel.trim(),
          unit: formUnit.trim(),
          icon: formIcon,
          required: formRequired,
        };

        if (editField) {
          return {
            ...schema,
            fields: schema.fields.map((f) => (f.id === editField.id ? newField : f)),
          };
        } else {
          return {
            ...schema,
            fields: [...schema.fields, newField],
          };
        }
      })
    );

    setDrawerOpen(false);
    toast({
      title: editField ? '✅ Đã cập nhật trường' : '✅ Đã thêm trường mới',
      description: `${formLabel} (${formKey}) → ${activeSchema?.categoryLabel}`,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setSchemas((prev) =>
      prev.map((schema) => {
        if (schema.categoryKey !== selectedCategory) return schema;
        return { ...schema, fields: schema.fields.filter((f) => f.id !== fieldId) };
      })
    );
    toast({ title: '🗑 Đã xóa trường' });
  };

  const handleSaveToSupabase = async () => {
    setSaving(true);
    try {
      const schemaValue = schemas.reduce((acc, s) => {
        acc[s.categoryKey] = s.fields;
        return acc;
      }, {} as Record<string, SpecFieldDef[]>);

      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'product_spec_schema',
            value: schemaValue as any,
            description: 'Schema Builder — Cấu trúc trường JSONB specifications theo danh mục sản phẩm',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast({
        title: '✅ Đã lưu Schema vào hệ thống',
        description: 'Form nhập liệu sản phẩm sẽ tự động cập nhật các trường mới.',
      });
    } catch (err: any) {
      toast({
        title: '❌ Lỗi khi lưu',
        description: err?.message || 'Không thể lưu schema.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Preview: how the product form would render these fields
  const previewFields = activeFields;

  return (
    <AdminShell title="Schema Builder" subtitle="Định nghĩa cấu trúc dữ liệu JSONB cho từng danh mục sản phẩm">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Schema Editor */}
        <div className="space-y-5 xl:col-span-7">
          {/* Category Tabs */}
          <Card className="border-border/50">
            <CardContent className="flex flex-wrap items-center gap-2 p-4">
              {schemas.map((s) => (
                <button
                  key={s.categoryKey}
                  onClick={() => setSelectedCategory(s.categoryKey)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    selectedCategory === s.categoryKey
                      ? 'bg-[#2E7D32] text-white shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {s.categoryLabel}
                  <Badge
                    variant="outline"
                    className={cn(
                      'ml-2 text-[9px]',
                      selectedCategory === s.categoryKey
                        ? 'border-white/30 text-white/80'
                        : 'border-border/50'
                    )}
                  >
                    {s.fields.length}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Fields Table */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  Trường dữ liệu — {activeSchema?.categoryLabel}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={openAddField}
                  className="rounded-xl"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Thêm trường
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="text-xs">Icon</TableHead>
                    <TableHead className="text-xs">Label</TableHead>
                    <TableHead className="text-xs font-mono">Key (DB)</TableHead>
                    <TableHead className="text-xs">Đơn vị</TableHead>
                    <TableHead className="text-xs">Bắt buộc</TableHead>
                    <TableHead className="w-[80px] text-right text-xs">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeFields.map((field, i) => {
                    const IconComp = getIconComponent(field.icon);
                    return (
                      <TableRow key={field.id} className="border-border/30">
                        <TableCell className="text-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50">
                            <IconComp className="h-3.5 w-3.5" style={{ color: '#2E7D32' }} />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{field.label}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{field.key}</TableCell>
                        <TableCell>
                          {field.unit ? (
                            <Badge variant="outline" className="text-[10px]">{field.unit}</Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Tùy chọn</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditField(field)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {activeFields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        Chưa có trường nào. Nhấn "Thêm trường" để bắt đầu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveToSupabase}
            disabled={saving}
            className="w-full rounded-xl py-5 text-sm font-bold"
            style={{ backgroundColor: '#2E7D32' }}
          >
            {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu Schema vào hệ thống
          </Button>
        </div>

        {/* Right: Live Preview */}
        <div className="xl:col-span-5">
          <Card className="sticky top-20 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Blocks className="h-4 w-4" style={{ color: '#2E7D32' }} />
                Preview — Form nhập liệu
              </CardTitle>
              <CardDescription className="text-[11px]">
                Khi Admin cập nhật Schema, form sản phẩm tự động render các trường tương ứng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Danh mục: {activeSchema?.categoryLabel}
                </p>
                <div className="space-y-3">
                  {previewFields.map((field) => {
                    const IconComp = getIconComponent(field.icon);
                    return (
                      <div key={field.id}>
                        <Label className="mb-1 flex items-center gap-1.5 text-xs">
                          <IconComp className="h-3 w-3" style={{ color: '#2E7D32' }} />
                          {field.label}
                          {field.unit && (
                            <span className="text-muted-foreground">({field.unit})</span>
                          )}
                          {field.required && (
                            <span className="text-red-400">*</span>
                          )}
                        </Label>
                        <Input
                          placeholder={`Nhập ${field.label.toLowerCase()}...`}
                          className="rounded-lg text-xs"
                          disabled
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {previewFields.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-[11px] leading-relaxed text-amber-400">
                    💡 Khi lưu Schema, trang PIM Editor sẽ tự động hiển thị {previewFields.length} trường
                    này cho mỗi sản phẩm thuộc danh mục <strong>{activeSchema?.categoryLabel}</strong>.
                    Dữ liệu được lưu vào cột <code className="mx-0.5 rounded bg-amber-500/10 px-1">specifications</code> (JSONB).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Field Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md" side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5" style={{ color: '#2E7D32' }} />
              {editField ? 'Chỉnh sửa trường' : 'Thêm trường mới'}
            </SheetTitle>
            <SheetDescription>
              Định nghĩa trường dữ liệu cho danh mục {activeSchema?.categoryLabel}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div>
              <Label className="text-xs">Label (Nhãn hiển thị) *</Label>
              <Input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="vd: Đường kính danh định"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs">Key (Khóa DB) *</Label>
              <Input
                value={formKey}
                onChange={(e) => setFormKey(e.target.value.replace(/[^a-z0-9_]/g, ''))}
                placeholder="vd: nominal_diameter"
                className="mt-1 rounded-xl font-mono text-xs"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Chỉ chứa chữ thường, số và dấu gạch dưới
              </p>
            </div>

            <div>
              <Label className="text-xs">Đơn vị (Unit)</Label>
              <Input
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                placeholder="vd: mm, bar, L/h"
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs">Icon (Lucide React)</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" style={{ color: '#2E7D32' }} />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium">Bắt buộc</p>
                <p className="text-[11px] text-muted-foreground">
                  Trường này phải có giá trị khi lưu sản phẩm
                </p>
              </div>
              <Switch checked={formRequired} onCheckedChange={setFormRequired} />
            </div>

            <Separator />

            <Button
              onClick={handleSaveField}
              className="w-full rounded-xl"
              style={{ backgroundColor: '#2E7D32' }}
            >
              <Save className="mr-2 h-4 w-4" />
              {editField ? 'Cập nhật trường' : 'Thêm trường'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
