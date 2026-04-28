'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Package, 
  Edit3, 
  Trash2,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  base_price: number;
  image_url: string;
  category_id?: string;
  categories?: { name: string };
}

interface ProductsTableProps {
  data: ProductData[];
}

export default function ProductsTable({ data }: ProductsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const router = useRouter();

  const columns: ColumnDef<ProductData>[] = [
    {
      accessorKey: 'image_url',
      header: 'Hình ảnh',
      cell: ({ row }) => {
        const url = row.getValue('image_url') as string;
        return (
          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {url ? (
              <img src={url} alt="Thumbnail" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-slate-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => {
        return <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">{row.getValue('sku')}</Badge>;
      },
    },
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
      cell: ({ row }) => {
        return <span className="font-bold text-slate-900">{row.getValue('name')}</span>;
      },
    },
    {
      id: 'category',
      accessorFn: (row) => row.categories?.name || row.category_id || 'N/A',
      header: 'Danh mục',
      cell: ({ row }) => {
        return <span className="text-sm text-slate-600">{row.getValue('category')}</span>;
      },
    },
    {
      accessorKey: 'base_price',
      header: 'Giá bán',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('base_price'));
        const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        return <span className="font-bold text-[#2E7D32]">{formatted}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
                <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" /> Xóa sản phẩm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const sku = String(row.getValue('sku') || '').toLowerCase();
      const name = String(row.getValue('name') || '').toLowerCase();
      return sku.includes(searchValue) || name.includes(searchValue);
    }
  });

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo SKU hoặc tên sản phẩm..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 rounded-xl bg-white"
          />
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-border/50 bg-white overflow-hidden shadow-sm">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Box className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Chưa có sản phẩm nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Bạn chưa thêm sản phẩm nào vào hệ thống PIM. Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên.
            </p>
            <Link href="/admin/products/new">
              <Button variant="outline" className="mt-4 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 rounded-xl">
                Thêm sản phẩm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-slate-50/80">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-bold text-slate-600">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-slate-50/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Không tìm thấy kết quả nào phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border/30 bg-slate-50/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg h-8 text-xs"
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg h-8 text-xs"
              >
                Trang tiếp
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
