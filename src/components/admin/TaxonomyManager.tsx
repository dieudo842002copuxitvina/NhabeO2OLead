import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/pim';

export interface TaxonomyItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

interface Props {
  title: string;
  hint: string;
  table: 'crop_tags' | 'terrain_tags';
  items: TaxonomyItem[];
  onChange: () => void;
  placeholderIcon?: string;
  placeholderLabel?: string;
}

export default function TaxonomyManager({
  title, hint, table, items, onChange,
  placeholderIcon = '🌱', placeholderLabel = 'Tên (vd: Lúa)',
}: Props) {
  const [draft, setDraft] = useState({ key: '', label: '', icon: '' });
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!draft.label.trim()) { toast.error('Nhập tên'); return; }
    const key = draft.key.trim() || slugify(draft.label).replace(/-/g, '_');
    setSavingKey('__new__');
    const { error } = await (supabase as any).from(table).insert({
      key,
      label: draft.label.trim(),
      icon: draft.icon.trim() || null,
      sort_order: items.length + 1,
    });
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã thêm');
    setDraft({ key: '', label: '', icon: '' });
    onChange();
  };

  const handleToggle = async (it: TaxonomyItem) => {
    setSavingKey(it.key);
    const { error } = await (supabase as any).from(table).update({ active: !it.active }).eq('id', it.id);
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    onChange();
  };

  const handleDelete = async (it: TaxonomyItem) => {
    if (!confirm(`Xóa "${it.label}"? Các sản phẩm/bài viết đang gắn tag này sẽ giữ lại key nhưng không hiển thị nhãn.`)) return;
    setSavingKey(it.key);
    const { error } = await (supabase as any).from(table).delete().eq('id', it.id);
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã xóa');
    onChange();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center justify-between">
          {title}
          <Badge variant="outline">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{hint}</p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
              <span className="text-xl shrink-0 w-8 text-center">{it.icon || '•'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{it.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{it.key}</p>
              </div>
              <Switch
                checked={it.active}
                onCheckedChange={() => handleToggle(it)}
                disabled={savingKey === it.key}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(it)}
                disabled={savingKey === it.key}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Chưa có mục nào.</p>
          )}
        </div>

        <div className="grid grid-cols-12 gap-2 pt-3 border-t">
          <Input
            className="col-span-2"
            placeholder={placeholderIcon}
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
          />
          <Input
            className="col-span-4"
            placeholder={placeholderLabel}
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <Input
            className="col-span-4"
            placeholder="key (auto từ tên)"
            value={draft.key}
            onChange={(e) => setDraft({ ...draft, key: e.target.value })}
          />
          <Button
            className="col-span-2"
            onClick={handleAdd}
            disabled={savingKey === '__new__'}
          >
            <Plus className="w-3 h-3 mr-1" /> Thêm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
