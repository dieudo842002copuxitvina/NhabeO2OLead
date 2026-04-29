import AdminShell from '@/components/admin/AdminShell';
import WikiPagesTable from '@/components/admin/WikiPagesTable';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const revalidate = 0;

async function getWikiPages() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('wiki_pages')
      .select('id, title, slug, content, tags, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch real wiki pages:', error);
      return [];
    }

    return (data || []).map((page) => ({
      id: String(page.id),
      title: page.title || 'Chưa có tiêu đề',
      slug: page.slug || '',
      content: page.content || '',
      tags: Array.isArray(page.tags) ? page.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      createdAt: page.created_at || null,
      updatedAt: page.updated_at || null,
    }));
  } catch (error) {
    console.error('Unexpected error while loading wiki pages:', error);
    return [];
  }
}

export default async function WikiIndexPage() {
  const pages = await getWikiPages();

  return (
    <AdminShell
      title="Wiki & Tri thức"
      subtitle="Chỉ hiển thị bài viết thật đang nằm trong bảng wiki_pages"
    >
      <WikiPagesTable data={pages} />
    </AdminShell>
  );
}
