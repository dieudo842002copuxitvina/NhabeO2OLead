'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
  Eye,
  FilePenLine,
  Link2,
  PackageSearch,
  SendHorizonal,
  Tags,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { saveWikiPage } from '@/actions/wikiActions';
import { cn } from '@/lib/utils';

const INITIAL_MARKDOWN = `# Triển khai Lead Command Center

Đây là nơi team Content có thể viết tài liệu vận hành cho Agri-OS.

## Wiki Link

Liên kết nhanh đến [[Thuật toán Geo-matching]] để tham chiếu scoring logic.

## SKU Embed

/sku:ADL-30

## Ghi chú

- Hỗ trợ Markdown chuẩn
- Cho phép HTML raw khi cần nhúng block nội bộ
`;

function slugify(value: string) {
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function enhanceMarkdown(markdown: string) {
  const withWikiLinks = markdown.replace(/\[\[([^[\]]+)\]\]/g, (_match, rawLabel: string) => {
    const label = rawLabel.trim();
    if (!label) {
      return '';
    }

    const href = `/admin/wiki/${slugify(label)}`;
    return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  });

  return withWikiLinks.replace(
    /(^|\n)\/sku:([A-Za-z0-9-]+)\s*(?=\n|$)/g,
    (_match, leadingBreak: string, rawSku: string) => {
      const sku = escapeHtml(rawSku.trim().toUpperCase());
      return `${leadingBreak}<div class="my-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm"><span class="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">SKU Embed</span><span class="mt-2 block font-medium">Sản phẩm: <span class="font-mono text-[#2E7D32]">${sku}</span> (Mock Preview)</span></div>`;
    }
  );
}

export default function WikiEditor() {
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('lead, geo-matching, docs');
  const [content, setContent] = useState(INITIAL_MARKDOWN);
  const [isSaving, setIsSaving] = useState(false);
  const [lastPayload, setLastPayload] = useState<{
    title: string;
    slug: string;
    content: string;
    tags: string[];
  } | null>(null);

  const slug = slugify(title);
  const tags = parseTags(tagsInput);
  const previewContent = enhanceMarkdown(content);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedTitle = title.trim();
    const cleanedContent = content.trim();

    if (!cleanedTitle || !slug || !cleanedContent) {
      toast({
        title: 'Thiếu dữ liệu bắt buộc',
        description: 'Cần có tiêu đề, slug hợp lệ và nội dung markdown trước khi xuất bản.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      title: cleanedTitle,
      slug,
      content: cleanedContent,
      tags,
    };

    setLastPayload(payload);
    setIsSaving(true);

    try {
      const result = await saveWikiPage(payload);
      console.log('Prepared wiki publish payload:', payload);

      if (!result.success) {
        toast({
          title: 'Lưu bài viết thất bại',
          description: result.error || 'Không thể lưu bài viết wiki vào hệ thống.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Đã lưu bài viết wiki',
        description: `Slug "${result.data.slug}" đã được cập nhật cùng ${result.data.targetSlugs.length} wiki links.`,
      });
    } catch (error) {
      console.error('Wiki publish failed:', error);
      toast({
        title: 'Lỗi hệ thống',
        description: 'Có lỗi không mong muốn khi gọi server action lưu bài viết.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handlePublish}>
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-200/80 bg-gradient-to-r from-[#2E7D32]/[0.08] via-white to-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold text-slate-900">Wiki Composer</CardTitle>
              <CardDescription className="max-w-2xl text-sm text-slate-600">
                Soạn nội dung markdown, kiểm tra wiki-link và SKU embed theo thời gian thực trước khi gọi API nội bộ.
              </CardDescription>
            </div>
            <Button
              disabled={isSaving}
              className="h-11 rounded-xl bg-[#2E7D32] px-5 text-sm font-semibold hover:bg-[#25672a]"
              type="submit"
            >
              <SendHorizonal className="mr-2 h-4 w-4" />
              {isSaving ? 'Đang lưu bài viết...' : 'Xuất bản Bài Viết'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Tiêu đề bài viết
              </label>
              <Input
                className="h-14 rounded-2xl border-slate-200 text-xl font-bold tracking-tight text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-[#2E7D32]"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Hướng dẫn routing lead theo bán kính đại lý"
                value={title}
              />
              <div className="rounded-2xl border border-dashed border-[#2E7D32]/25 bg-[#2E7D32]/[0.06] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E7D32]">
                  Slug tự sinh
                </p>
                <p className="mt-1 font-mono text-sm text-slate-700">
                  {slug || 'slug-se-duoc-tao-tu-tieu-de'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Tags
              </label>
              <Input
                className="h-14 rounded-2xl border-slate-200 text-sm text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:ring-[#2E7D32]"
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="lead, geo-matching, docs"
                value={tagsInput}
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <Tags className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Tags đã parse
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Chưa có tags hợp lệ.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden border-slate-200/80 shadow-none">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/70 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                      <FilePenLine className="h-4 w-4 text-[#2E7D32]" />
                      Markdown Editor
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-slate-500">
                      Dùng markdown thuần, wiki-link dạng <code>[[Tên bài viết]]</code> và SKU dạng{' '}
                      <code>/sku:ADL-30</code>.
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    {wordCount} từ
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Textarea
                  className="min-h-[620px] resize-none rounded-none border-0 bg-transparent px-5 py-5 font-mono text-[15px] leading-7 text-slate-800 shadow-none focus-visible:ring-0"
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Viết markdown ở đây..."
                  value={content}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200/80 shadow-none">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/70 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                      <Eye className="h-4 w-4 text-[#2E7D32]" />
                      Live Preview
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs text-slate-500">
                      Preview render bằng <code>react-markdown</code> + <code>rehype-raw</code>.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      <Link2 className="h-3 w-3 text-[#2E7D32]" />
                      Wiki-link
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                      <PackageSearch className="h-3 w-3 text-[#2E7D32]" />
                      SKU embed
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-h-[620px] bg-white px-5 py-5">
                {content.trim() ? (
                  <article className="prose prose-slate max-w-none prose-headings:tracking-tight prose-a:no-underline prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-slate-800 prose-pre:border prose-pre:border-slate-200 prose-pre:bg-slate-950 prose-pre:text-slate-100">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        a: ({ className, ...props }) => (
                          <a
                            {...props}
                            className={cn(
                              'rounded-md bg-[#2E7D32]/10 px-1.5 py-0.5 font-medium text-[#2E7D32] underline-offset-4 transition-colors hover:underline',
                              className
                            )}
                          />
                        ),
                      }}
                    >
                      {previewContent}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="flex min-h-[580px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                    <div className="max-w-sm space-y-2 px-6">
                      <p className="text-sm font-semibold text-slate-700">Live Preview đang chờ nội dung</p>
                      <p className="text-sm text-slate-500">
                        Markdown ở cột trái sẽ được render HTML ngay khi team Content nhập nội dung.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {lastPayload ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Payload chuẩn bị gọi API
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{JSON.stringify(lastPayload, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}
