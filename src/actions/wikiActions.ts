'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const WIKI_LINK_PATTERN = /\[\[(.*?)\]\]/g;

export interface SaveWikiPagePayload {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  status?: 'draft' | 'published';
  category?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Thiếu cấu hình Supabase server client trong biến môi trường.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function slugifyWikiValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function extractWikiLinks(content: string) {
  const uniqueSlugs = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = WIKI_LINK_PATTERN.exec(content)) !== null) {
    const rawTitle = match[1]?.trim();
    if (!rawTitle) {
      continue;
    }

    const slug = slugifyWikiValue(rawTitle);
    if (slug) {
      uniqueSlugs.add(slug);
    }
  }

  return Array.from(uniqueSlugs);
}

export async function saveWikiPage(payload: SaveWikiPagePayload) {
  try {
    const title = payload.title.trim();
    const slug = slugifyWikiValue(payload.slug || payload.title);
    const content = payload.content.trim();
    const tags = normalizeTags(payload.tags);
    const status = payload.status === 'published' ? 'published' : 'draft';
    const category = payload.category?.trim() || 'technical-irrigation';
    const coverImage = payload.coverImage?.trim() || null;
    const seoTitle = payload.seoTitle?.trim() || null;
    const seoDescription = payload.seoDescription?.trim() || null;

    if (!title || !slug || !content) {
      return {
        success: false,
        error: 'Thiếu dữ liệu bắt buộc để lưu bài viết wiki.',
      };
    }

    const supabase = createSupabaseServerClient();

    const { data: savedPage, error: upsertError } = await supabase
      .from('wiki_pages')
      .upsert(
        {
          title,
          slug,
          content,
          tags,
          status,
          category,
          cover_image: coverImage,
          seo_title: seoTitle,
          seo_description: seoDescription,
        },
        {
          onConflict: 'slug',
        }
      )
      .select('id, slug')
      .single();

    if (upsertError || !savedPage?.id) {
      console.error('saveWikiPage upsert error:', upsertError);
      return {
        success: false,
        error: upsertError?.message || 'Không thể lưu bài viết wiki.',
      };
    }

    const sourcePageId = savedPage.id;
    const targetSlugs = extractWikiLinks(content);

    const { error: deleteLinksError } = await supabase
      .from('wiki_links')
      .delete()
      .eq('source_page_id', sourcePageId);

    if (deleteLinksError) {
      console.error('saveWikiPage delete wiki_links error:', deleteLinksError);
      return {
        success: false,
        error: deleteLinksError.message || 'Không thể đồng bộ wiki links cũ.',
      };
    }

    if (targetSlugs.length > 0) {
      const linkRows = targetSlugs.map((targetSlug) => ({
        source_page_id: sourcePageId,
        target_page_slug: targetSlug,
      }));

      const { error: insertLinksError } = await supabase.from('wiki_links').insert(linkRows);

      if (insertLinksError) {
        console.error('saveWikiPage insert wiki_links error:', insertLinksError);
        return {
          success: false,
          error: insertLinksError.message || 'Không thể tạo wiki links mới.',
        };
      }
    }

    revalidatePath('/admin/wiki');
    revalidatePath('/admin/wiki/new');
    revalidatePath(`/admin/wiki/${slug}`);

    return {
      success: true,
      data: {
        id: sourcePageId,
        slug,
        status,
        category,
        targetSlugs,
      },
    };
  } catch (error) {
    console.error('saveWikiPage fatal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã có lỗi hệ thống khi lưu bài viết wiki.',
    };
  }
}
