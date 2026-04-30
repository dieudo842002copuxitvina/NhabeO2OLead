import AdminShell from '@/components/admin/AdminShell';
import WikiEditor from '@/components/admin/WikiEditor';

export const metadata = {
  title: 'Tạo bài wiki mới | Agri-OS',
};

export default function NewWikiPage() {
  return (
    <AdminShell
      title="Studio Wiki Agri-OS"
      subtitle="Không gian biên tập theo kiểu headless CMS để soạn nội dung, gắn taxonomy và tối ưu SEO trong một màn hình."
    >
      <div className="mx-auto w-full max-w-[1680px] py-4">
        <WikiEditor />
      </div>
    </AdminShell>
  );
}
