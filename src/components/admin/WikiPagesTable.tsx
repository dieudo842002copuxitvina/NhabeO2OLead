'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Tags } from 'lucide-react';
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

export interface WikiPageListItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

interface WikiPagesTableProps {
  data: WikiPageListItem[];
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getExcerpt(content: string) {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return 'Bài viết này chưa có phần mô tả ngắn.';
  }

  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
}

export default function WikiPagesTable({ data }: WikiPagesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const tagOptions = useMemo(() => {
    return Array.from(new Set(data.flatMap((page) => page.tags))).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [data]);

  const filteredPages = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return data.filter((page) => {
      const matchesSearch =
        !normalizedSearch ||
        [page.title, page.slug, page.content, page.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesTag = tagFilter === 'all' || page.tags.includes(tagFilter);

      return matchesSearch && matchesTag;
    });
  }, [data, searchQuery, tagFilter]);

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={BookOpen}
        title="Kho tri thức đang trống"
        description="Không còn bài wiki giả nào được render ở đây. Nếu bảng wiki_pages đang rỗng sau khi TRUNCATE, trang này sẽ chỉ hiển thị empty state."
        ctaLabel="Viết bài Wiki thật đầu tiên"
        ctaHref="/admin/wiki/new"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tiêu đề, slug, tags hoặc nội dung thật"
            className="h-11 rounded-xl bg-white pl-9"
          />
        </div>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-white">
            <Tags className="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Lọc tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tags</SelectItem>
            {tagOptions.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button asChild className="h-11 rounded-xl bg-[#2E7D32] px-5 hover:bg-[#25672a]">
          <Link href="/admin/wiki/new">
            <Plus className="mr-2 h-4 w-4" />
            Viết bài Wiki
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead className="w-[300px]">Bài viết</TableHead>
                <TableHead className="w-[220px]">Tags</TableHead>
                <TableHead>Tóm tắt</TableHead>
                <TableHead className="w-[140px]">Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">{page.title}</p>
                        <p className="mt-1 text-xs text-slate-500">/{page.slug || page.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {page.tags.length > 0 ? (
                          page.tags.map((tag) => (
                            <Badge
                              key={`${page.id}-${tag}`}
                              variant="outline"
                              className="border-[#2E7D32]/20 bg-[#2E7D32]/5 text-[#2E7D32]"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">Chưa gắn tag</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[440px] text-sm text-slate-600">
                      <span className="line-clamp-2">{getExcerpt(page.content)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(page.updatedAt || page.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-14 text-center">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">Không có bài viết phù hợp</p>
                      <p className="text-sm text-slate-500">
                        Bộ lọc chỉ đang áp lên dữ liệu thật từ bảng wiki_pages.
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
