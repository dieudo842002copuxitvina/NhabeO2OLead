import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SpecialtyGroup, slugify } from '@/lib/pim';

interface Props {
  groups: SpecialtyGroup[];
  onChange: () => void;
}

interface DraftGroup {
  key: string;
  label: string;
  icon: string;
  description: string;
}

export default function SpecialtyGroupsManager({ groups, onChange }: Props) {
  const [draft, setDraft] = useState<DraftGroup>({ key: '', label: '', icon: '', description: '' });
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!draft.label.trim()) {
      toast.error('Nhập tên nhóm');
      return;
    }
    const key = draft.key.trim() || slugify(draft.label).replace(/-/g, '_');
    setSavingKey('__new__');
    const { error } = await supabase.from('product_specialty_groups').insert({
      key,
      label: draft.label.trim(),
      icon: draft.icon.trim() || null,
      description: draft.description.trim() || null,
      sort_order: groups.length + 1,
    });
    setSavingKey(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Đã thêm nhóm');
    setDraft({ key: '', label: '', icon: '', description: '' });
    onChange();
  };

  const handleToggle = async (g: SpecialtyGroup) => {
    setSavingKey(g.key);
    const { error } = await supabase
      .from('product_specialty_groups')
      .update({ active: !g.active })
      .eq('id', g.id);
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    onChange();
  };

  const handleDelete = async (g: SpecialtyGroup) => {
    if (!confirm(`Xóa nhóm "${g.label}"? Các sản phẩm đang gán sẽ trở về trạng thái không nhóm.`)) return;
    setSavingKey(g.key);
    const { error } = await supabase.from('product_specialty_groups').delete().eq('id', g.id);
    setSavingKey(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã xóa');
    onChange();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center justify-between">
          Nhóm chuyên môn (O2O matching)
          <Badge variant="outline">{groups.length} nhóm</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Nhóm chuyên môn dùng để gợi ý đại lý có chuyên môn phù hợp khi khách xem sản phẩm
          (vd: Drone → đại lý có thợ bay; IoT → đại lý có thợ điện tử).
        </p>

        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
              <span className="text-xl shrink-0 w-8 text-center">{g.icon || '•'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{g.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{g.key}</p>
              </div>
              <Switch
                checked={g.active}
                onCheckedChange={() => handleToggle(g)}
                disabled={savingKey === g.key}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(g)}
                disabled={savingKey === g.key}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-2 pt-3 border-t">
          <Input
            className="col-span-2"
            placeholder="🔧"
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
          />
          <Input
            className="col-span-4"
            placeholder="Tên nhóm (vd: Drone)"
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
