import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Users, Shield, Loader2, UserCog } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { AppRole } from '@/contexts/AuthContext';

interface StaffRow {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  roles: AppRole[];
}

const ASSIGNABLE_ROLES: { role: AppRole; label: string; description: string }[] = [
  { role: 'admin', label: 'Quản trị toàn quyền', description: 'Toàn quyền hệ thống' },
  { role: 'bi_viewer', label: 'Chỉ xem BI', description: 'Xem dashboard analytics, tracking' },
  { role: 'ai_editor', label: 'Chỉ sửa AI Rules', description: 'Cấu hình AI Rules' },
  { role: 'dealer', label: 'Đại lý', description: 'Truy cập portal đại lý' },
  { role: 'technician', label: 'Kỹ thuật / Thợ', description: 'Portal kỹ thuật' },
];

const ROLE_VARIANT: Record<AppRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  admin: 'default', bi_viewer: 'secondary', ai_editor: 'secondary',
  dealer: 'outline', technician: 'outline', customer: 'outline',
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, phone'),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const map = new Map<string, StaffRow>();
    (profiles ?? []).forEach((p) => {
      map.set(p.user_id, { user_id: p.user_id, display_name: p.display_name, phone: p.phone, roles: [] });
    });
    (rolesData ?? []).forEach((r) => {
      const row = map.get(r.user_id);
      if (row) row.roles.push(r.role as AppRole);
      else map.set(r.user_id, { user_id: r.user_id, display_name: null, phone: null, roles: [r.role as AppRole] });
    });
    // Filter to staff only (anyone non-customer)
    const arr = Array.from(map.values()).filter((r) =>
      r.roles.some((role) => role !== 'customer')
    );
    setStaff(arr);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (userId: string, role: AppRole, enabled: boolean) => {
    setSavingRole(true);
    if (enabled) {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (error && !error.message.includes('duplicate')) {
        toast.error('Lỗi: ' + error.message); setSavingRole(false); return;
      }
    } else {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
      if (error) { toast.error('Lỗi: ' + error.message); setSavingRole(false); return; }
    }
    toast.success('Đã cập nhật quyền');
    setSavingRole(false);
    await load();
    if (editing) {
      const refreshed = staff.find((s) => s.user_id === userId);
      if (refreshed) setEditing(refreshed);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" /> Quản lý Nhân sự (RBAC)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cấp/thu hồi quyền cho các tài khoản nhân viên. Khách hàng không hiển thị ở đây.
        </p>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6 text-sm">
          <p className="font-medium mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Cách thêm nhân sự mới</p>
          <ol className="text-muted-foreground space-y-1 list-decimal pl-5">
            <li>Nhân sự đăng ký tại <code>/auth</code> bằng email công ty</li>
            <li>Vào trang này, tìm tài khoản và tick các quyền cần cấp</li>
            <li>Hệ thống tự động áp dụng RLS theo quyền đã chọn</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" /> Danh sách nhân sự ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Chưa có nhân sự nào</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tài khoản</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Quyền hiện tại</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.user_id}>
                    <TableCell>
                      <p className="font-medium">{s.display_name ?? 'Chưa đặt tên'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s.user_id.slice(0, 8)}…</p>
                    </TableCell>
                    <TableCell className="text-sm">{s.phone ?? '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {s.roles.map((r) => (
                          <Badge key={r} variant={ROLE_VARIANT[r]}>{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog onOpenChange={(open) => { if (open) setEditing(s); else setEditing(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Cấp quyền</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{s.display_name ?? 'Nhân sự'}</DialogTitle>
                            <DialogDescription>Tick để cấp / bỏ tick để thu hồi quyền</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            {ASSIGNABLE_ROLES.map((r) => {
                              const checked = (editing?.roles ?? s.roles).includes(r.role);
                              return (
                                <label key={r.role} className="flex items-start gap-3 p-3 rounded border hover:bg-muted/40 cursor-pointer">
                                  <Checkbox
                                    checked={checked}
                                    disabled={savingRole}
                                    onCheckedChange={(v) => toggleRole(s.user_id, r.role, !!v)}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{r.label}</p>
                                    <p className="text-xs text-muted-foreground">{r.description}</p>
                                  </div>
                                  <Badge variant={ROLE_VARIANT[r.role]} className="text-[10px]">{r.role}</Badge>
                                </label>
                              );
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
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
