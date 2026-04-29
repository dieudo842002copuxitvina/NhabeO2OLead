import Link from 'next/link';
import { FolderTree, Blocks, ArrowRight, Tags } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Quản lý Danh mục | Agri-OS',
};

export default function AdminCategoriesPage() {
  return (
    <AdminShell
      title="Quản lý Danh mục"
      subtitle="Điểm vào tập trung cho taxonomy, schema danh mục và cấu trúc sản phẩm."
    >
      <div className="mx-auto grid max-w-6xl gap-6 py-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4 text-[#2E7D32]" />
              Taxonomy Danh mục
            </CardTitle>
            <CardDescription>
              Quản lý nhóm danh mục, logic hiển thị và cấu trúc điều hướng cho sản phẩm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dùng màn hình này làm điểm vào cho các công cụ quản trị category hiện có trong hệ thống.
            </p>
            <Button asChild className="bg-[#2E7D32] hover:bg-[#25672a]">
              <Link href="/admin/category-schema">
                Đi tới Category Schema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Blocks className="h-4 w-4 text-[#2E7D32]" />
              Schema Builder
            </CardTitle>
            <CardDescription>
              Điều chỉnh field động, cấu trúc JSONB và thuộc tính kỹ thuật theo từng danh mục.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dành cho trường hợp cần thay đổi định nghĩa dữ liệu hoặc form nhập liệu sản phẩm.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/schema-builder">
                Mở Schema Builder
                <Tags className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
