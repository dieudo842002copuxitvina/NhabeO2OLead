'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Blocks,
  Plus,
  Trash2,
  GripVertical,
  Save,
  RefreshCw,
  Edit3,
  ListTree
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────
type FieldType = 'text' | 'number' | 'select' | 'boolean';

interface SchemaAttribute {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  unit: string;
  required: boolean;
  order: number;
}

const CATEGORY_OPTIONS = [
  { value: 'van', label: 'Van (Valves)' },
  { value: 'pipe', label: 'Ống (Pipes)' },
  { value: 'pump', label: 'Máy bơm (Pumps)' },
  { value: 'nozzle', label: 'Béc tưới (Nozzles)' },
  { value: 'sensor', label: 'Cảm biến (Sensors)' },
  { value: 'fertilizer', label: 'Phân bón (Fertilizers)' },
];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Văn bản (Text)' },
  { value: 'number', label: 'Số (Number)' },
  { value: 'select', label: 'Lựa chọn (Select)' },
  { value: 'boolean', label: 'Đúng/Sai (Boolean)' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Main Component ──────────────────────────────────────────────────
export default function CategorySchemaManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_OPTIONS[0].value);
  const [attributes, setAttributes] = useState<SchemaAttribute[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<SchemaAttribute | null>(null);

  // Form State
  const [formLabel, setFormLabel] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formType, setFormType] = useState<FieldType>('text');
  const [formUnit, setFormUnit] = useState('');
  const [formRequired, setFormRequired] = useState(false);

  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ─── Fetch Data ───
  useEffect(() => {
    async function loadSchema() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('category_schemas')
          .select('attributes')
          .eq('category_id', selectedCategory)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching schema:', error);
          // Fallback to app_settings if category_schemas doesn't exist
          const { data: altData } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', `schema_${selectedCategory}`)
            .maybeSingle();
            
          if (altData?.value) {
            setAttributes((altData.value as SchemaAttribute[]).sort((a, b) => a.order - b.order));
          } else {
            setAttributes([]);
          }
        } else if (data?.attributes) {
          // ensure data is parsed and sorted
          const attrs = (data.attributes as SchemaAttribute[]).sort((a, b) => a.order - b.order);
          setAttributes(attrs);
        } else {
          setAttributes([]);
        }
      } catch (err) {
        console.error('Failed to load schema', err);
        setAttributes([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadSchema();
  }, [selectedCategory]);

  // ─── Handlers ───
  const handleOpenAdd = () => {
    setEditingAttr(null);
    setFormLabel('');
    setFormKey('');
    setFormType('text');
    setFormUnit('');
    setFormRequired(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (attr: SchemaAttribute) => {
    setEditingAttr(attr);
    setFormLabel(attr.label);
    setFormKey(attr.key);
    setFormType(attr.type);
    setFormUnit(attr.unit);
    setFormRequired(attr.required);
    setDialogOpen(true);
  };

  const handleSaveAttribute = () => {
    if (!formLabel.trim() || !formKey.trim()) {
      toast({ title: '⚠️ Lỗi nhập liệu', description: 'Vui lòng nhập Tên hiển thị và Khóa DB.', variant: 'destructive' });
      return;
    }

    if (!editingAttr && attributes.some(a => a.key === formKey.trim())) {
      toast({ title: '⚠️ Trùng lặp', description: `Khóa '${formKey}' đã tồn tại trong category này.`, variant: 'destructive' });
      return;
    }

    const newAttr: SchemaAttribute = {
      id: editingAttr?.id || generateId(),
      key: formKey.trim(),
      label: formLabel.trim(),
      type: formType,
      unit: formUnit.trim(),
      required: formRequired,
      order: editingAttr ? editingAttr.order : attributes.length,
    };

    if (editingAttr) {
      setAttributes(prev => prev.map(a => a.id === editingAttr.id ? newAttr : a));
      toast({ title: '✅ Đã cập nhật thuộc tính' });
    } else {
      setAttributes(prev => [...prev, newAttr]);
      toast({ title: '✅ Đã thêm thuộc tính mới' });
    }

    setDialogOpen(false);
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => {
      const updated = prev.filter(a => a.id !== id);
      // Reassign order
      return updated.map((a, i) => ({ ...a, order: i }));
    });
    toast({ title: '🗑 Đã xóa thuộc tính' });
  };

  // ─── Drag & Drop Sorting ───
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const _attributes = [...attributes];
    const draggedItemContent = _attributes.splice(dragItem.current, 1)[0];
    _attributes.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    // Update order values
    const reordered = _attributes.map((attr, index) => ({ ...attr, order: index }));
    setAttributes(reordered);
  };

  // ─── Save to DB ───
  const handleSaveToDB = async () => {
    setSaving(true);
    try {
      const payload = {
        category_id: selectedCategory,
        attributes: attributes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('category_schemas')
        .upsert(payload, { onConflict: 'category_id' });

      if (error) {
        // Fallback to app_settings if category_schemas doesn't exist
        console.warn('category_schemas table might not exist, trying app_settings', error);
        const altError = await supabase
          .from('app_settings')
          .upsert({
            key: `schema_${selectedCategory}`,
            value: attributes as any,
            description: `Schema for category: ${selectedCategory}`,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
          
        if (altError.error) throw altError.error;
      }

      toast({
        title: '✅ Lưu cấu hình thành công',
        description: `Đã cập nhật Schema cho danh mục ${CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}.`,
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

  return (
    <AdminShell title="Category Schema Manager" subtitle="Quản lý cấu trúc dữ liệu thuộc tính kỹ thuật động cho từng danh mục sản phẩm">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header & Controls */}
        <Card className="border-border/50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <ListTree className="h-5 w-5 text-[#2E7D32]" />
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Chọn danh mục</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[240px] font-medium border-border/50 shadow-sm rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-border/50"
                onClick={handleOpenAdd}
              >
                <Plus className="mr-2 h-4 w-4 text-[#2E7D32]" />
                Thêm thuộc tính
              </Button>
              <Button
                className="rounded-xl text-white"
                style={{ backgroundColor: '#2E7D32' }}
                onClick={handleSaveToDB}
                disabled={saving || loading}
              >
                {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu cấu hình
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attributes List */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Blocks className="h-4 w-4 text-[#2E7D32]" />
                Danh sách thuộc tính hiển thị
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-[#2E7D32]/30 text-[#2E7D32]">
                {attributes.length} trường dữ liệu
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Kéo thả (<GripVertical className="inline h-3 w-3" />) để thay đổi thứ tự hiển thị trên form PIM Editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center">
                <RefreshCw className="h-6 w-6 animate-spin mb-2 text-[#2E7D32]" />
                Đang tải dữ liệu...
              </div>
            ) : attributes.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground border-t border-border/30 border-dashed">
                Chưa có thuộc tính nào cho danh mục này.<br/> Nhấn "Thêm thuộc tính" để bắt đầu.
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground border-b border-border/30">
                  <div className="col-span-1 text-center">STT</div>
                  <div className="col-span-3">Nhãn hiển thị (Label)</div>
                  <div className="col-span-2">Khóa (Key DB)</div>
                  <div className="col-span-2">Kiểu dữ liệu</div>
                  <div className="col-span-2">Đơn vị / Bắt buộc</div>
                  <div className="col-span-2 text-right">Thao tác</div>
                </div>
                <div className="flex flex-col divide-y divide-border/30">
                  {attributes.map((attr, index) => (
                    <div
                      key={attr.id}
                      draggable
                      onDragStart={() => (dragItem.current = index)}
                      onDragEnter={() => (dragOverItem.current = index)}
                      onDragEnd={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                      className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-card hover:bg-muted/20 transition-colors cursor-move group"
                    >
                      <div className="col-span-1 flex items-center justify-center text-muted-foreground/50 group-hover:text-foreground">
                        <GripVertical className="h-4 w-4 mr-1" />
                        <span className="text-xs font-mono">{index + 1}</span>
                      </div>
                      
                      <div className="col-span-3 flex flex-col">
                        <span className="text-sm font-medium text-foreground">{attr.label}</span>
                      </div>
                      
                      <div className="col-span-2">
                        <Badge variant="secondary" className="font-mono text-[10px] bg-muted">
                          {attr.key}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 flex items-center">
                        <Badge variant="outline" className="text-[10px] border-[#2E7D32]/20 text-[#2E7D32] bg-[#2E7D32]/5">
                          {FIELD_TYPES.find(t => t.value === attr.type)?.label || attr.type}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 flex flex-col items-start gap-1">
                        {attr.unit && <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50">{attr.unit}</span>}
                        {attr.required && <span className="text-[10px] text-red-500 font-medium">* Bắt buộc</span>}
                      </div>
                      
                      <div className="col-span-2 flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenEdit(attr); }}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAttr ? 'Chỉnh sửa thuộc tính' : 'Thêm thuộc tính mới'}</DialogTitle>
            <DialogDescription>
              Thuộc tính này sẽ được hiển thị khi thêm/sửa sản phẩm thuộc danh mục {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tên hiển thị (Label) <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="VD: Đường kính ống" 
                value={formLabel} 
                onChange={e => setFormLabel(e.target.value)} 
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Khóa cơ sở dữ liệu (Key) <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="VD: outer_diameter" 
                value={formKey} 
                onChange={e => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                className="font-mono text-sm rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">Chỉ sử dụng chữ thường, số và gạch dưới.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kiểu dữ liệu</Label>
                <Select value={formType} onValueChange={(v: FieldType) => setFormType(v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Đơn vị (Không bắt buộc)</Label>
                <Input 
                  placeholder="VD: mm, HP, m³/h" 
                  value={formUnit} 
                  onChange={e => setFormUnit(e.target.value)} 
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl mt-2 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm">Trường bắt buộc</Label>
                <p className="text-[11px] text-muted-foreground">Admin bắt buộc phải nhập trường này</p>
              </div>
              <Switch checked={formRequired} onCheckedChange={setFormRequired} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveAttribute} className="rounded-xl bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white">
              {editingAttr ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
