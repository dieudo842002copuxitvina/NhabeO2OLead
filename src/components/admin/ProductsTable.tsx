'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Package2, Plus, Search, Tag } from 'lucide-react';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  description: string | null;
  createdAt: string | null;
  isActive: boolean | null;
}

interface ProductsTableProps {
  data: ProductListItem[];
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

function getStatusMeta(isActive: boolean | null) {
  if (isActive === true) {
    return {
      label: 'Đang hiển thị',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (isActive === false) {
    return {
      label: 'Đang ẩn',
      className: 'border-slate-200 bg-slate-100 text-slate-700',
    };
  }

  return {
    label: 'Chưa rõ',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  };
}

function getCategoryLabel(product: ProductListItem) {
  if (product.categoryName) {
    return product.categoryName;
  }

  if (product.categoryId) {
    return `ID ${product.categoryId}`;
  }

  return 'Chưa gán danh mục';
}

export default function ProductsTable({ data }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(data.map((product) => getCategoryLabel(product)))).sort((a, b) =>
      a.localeCompare(b, 'vi')
    );
  }, [data]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return data.filter((product) => {
      const categoryLabel = getCategoryLabel(product);
      const statusValue =
        product.isActive === true ? 'active' : product.isActive === false ? 'inactive' : 'unknown';

      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.slug, product.description || '', categoryLabel]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory = categoryFilter === 'all' || categoryLabel === categoryFilter;
      const matchesStatus = statusFilter === 'all' || statusValue === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, data, searchQuery, statusFilter]);

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={Package2}
        title="Kho sản phẩm đang trống"
        description="Supabase chưa trả về bản ghi sản phẩm thật nào. Sau khi bạn TRUNCATE bảng products, màn hình này sẽ chỉ còn hiển thị empty state thay vì dữ liệu giả."
        ctaLabel="Bắt đầu đăng sản phẩm thật ngay"
        ctaHref="/admin/products/new"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên, slug, mô tả hoặc danh mục thật"
            className="h-11 rounded-xl bg-white pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-white">
            <Tag className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
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
            <SelectItem value="active">Đang hiển thị</SelectItem>
            <SelectItem value="inactive">Đang ẩn</SelectItem>
            <SelectItem value="unknown">Chưa rõ</SelectItem>
          </SelectContent>
        </Select>

        <Button asChild className="h-11 rounded-xl bg-[#2E7D32] px-5 hover:bg-[#25672a]">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm thật
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead className="w-[320px]">Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-[140px]">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const status = getStatusMeta(product.isActive);

                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package2 className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{product.name}</p>
                            <p className="truncate text-xs text-slate-500">/{product.slug || product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {getCategoryLabel(product)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[420px] text-sm text-slate-600">
                        <span className="line-clamp-2">
                          {product.description?.trim() || 'Chưa có mô tả cho bản ghi này.'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(product.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-14 text-center">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">Không có kết quả phù hợp</p>
                      <p className="text-sm text-slate-500">
                        Bộ lọc hiện tại chỉ đang áp vào dữ liệu thật vừa nạp từ Supabase.
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
