'use client';

import { useMemo, useState } from 'react';
import { Inbox, MapPin, Search, Sprout, UserRoundCheck, Users } from 'lucide-react';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface LeadListItem {
  id: string;
  customerName: string;
  customerPhone: string;
  province: string;
  district: string;
  cropType: string;
  areaM2: number | null;
  assignedDealerId: string | null;
  status: string | null;
  createdAt: string | null;
}

interface LeadsTableProps {
  data: LeadListItem[];
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Chưa có ngày';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatArea(areaM2: number | null) {
  if (!areaM2 || Number.isNaN(areaM2)) {
    return 'Chưa có dữ liệu';
  }

  const hectares = areaM2 / 10000;
  return hectares >= 1 ? `${hectares.toFixed(2)} ha` : `${areaM2.toLocaleString('vi-VN')} m²`;
}

function getStatusLabel(status: string | null) {
  if (!status) {
    return 'Chưa gán trạng thái';
  }

  return status
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClasses(status: string | null) {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('new')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (normalized.includes('pending') || normalized.includes('processing')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (normalized.includes('closed') || normalized.includes('won')) {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function LeadsTable({ data }: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const provinceOptions = useMemo(() => {
    return Array.from(new Set(data.map((lead) => lead.province).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'vi')
    );
  }, [data]);

  const cropOptions = useMemo(() => {
    return Array.from(new Set(data.map((lead) => lead.cropType).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'vi')
    );
  }, [data]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(data.map((lead) => lead.status || 'unknown')));
  }, [data]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return data.filter((lead) => {
      const normalizedStatus = lead.status || 'unknown';
      const matchesSearch =
        !normalizedSearch ||
        [
          lead.customerName,
          lead.customerPhone,
          lead.province,
          lead.district,
          lead.cropType,
          normalizedStatus,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesProvince = provinceFilter === 'all' || lead.province === provinceFilter;
      const matchesCrop = cropFilter === 'all' || lead.cropType === cropFilter;
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      return matchesSearch && matchesProvince && matchesCrop && matchesStatus;
    });
  }, [cropFilter, data, provinceFilter, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const assigned = data.filter((lead) => Boolean(lead.assignedDealerId)).length;
    const provinces = new Set(data.map((lead) => lead.province).filter(Boolean)).size;

    return {
      total: data.length,
      assigned,
      unassigned: data.length - assigned,
      provinces,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={Inbox}
        title="Lead thật hiện chưa có"
        description="Trang này chỉ còn đọc dữ liệu thật từ bảng leads. Nếu nguồn thu lead chưa đẩy bản ghi nào vào Supabase, bạn sẽ thấy empty state thay vì mock rows."
        ctaLabel="Bắt đầu đăng sản phẩm thật ngay"
        ctaHref="/admin/products/new"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2E7D32]/10">
              <Users className="h-5 w-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Tổng lead thật</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100">
              <UserRoundCheck className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.assigned}</p>
              <p className="text-xs text-slate-500">Đã gán đại lý</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
              <Inbox className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.unassigned}</p>
              <p className="text-xs text-slate-500">Chưa gán đại lý</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
              <MapPin className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.provinces}</p>
              <p className="text-xs text-slate-500">Tỉnh thành có lead</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên, số điện thoại, khu vực hoặc cây trồng"
            className="h-11 rounded-xl bg-white pl-9"
          />
        </div>

        <Select value={provinceFilter} onValueChange={setProvinceFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-white">
            <MapPin className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Tỉnh thành" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
            {provinceOptions.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cropFilter} onValueChange={setCropFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-white">
            <Sprout className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Cây trồng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cây trồng</SelectItem>
            {cropOptions.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'unknown' ? 'Chưa gán trạng thái' : getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead className="w-[260px]">Khách hàng</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Cây trồng</TableHead>
                <TableHead>Diện tích</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đại lý</TableHead>
                <TableHead className="w-[140px]">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">{lead.customerName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.customerPhone || 'Chưa có số điện thoại'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {[lead.district, lead.province].filter(Boolean).join(', ') || 'Chưa có khu vực'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {lead.cropType || 'Chưa có cây trồng'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{formatArea(lead.areaM2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusClasses(lead.status)}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {lead.assignedDealerId ? 'Đã gán' : 'Chưa gán'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">Không có lead phù hợp</p>
                      <p className="text-sm text-slate-500">
                        Tìm kiếm và bộ lọc hiện chỉ đang chạy trên dữ liệu thật vừa nạp từ Supabase.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
