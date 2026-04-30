'use client';

import Link from 'next/link';
import { useMemo, useState, type DragEvent, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  Globe,
  ImageIcon,
  Loader2,
  Save,
  Search,
  SendHorizonal,
  Tag,
  Unplug,
  Workflow,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploadField from '@/components/admin/MediaUploadField';
import { saveWikiPage } from '@/actions/wikiActions';
import { uploadToCmsMedia } from '@/lib/cms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type SaveIntent = 'save-close' | 'publish';

const WIKI_CATEGORIES = [
  { value: 'technical-irrigation', label: 'Kỹ thuật tưới' },
  { value: 'crop-care', label: 'Chăm sóc cây' },
  { value: 'iot', label: 'IoT nông nghiệp' },
  { value: 'operation-playbook', label: 'Quy trình vận hành O2O' },
];

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

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDetectedWikiLinks(content: string) {
  return Array.from(new Set(Array.from(content.matchAll(/\[\[(.*?)\]\]/g)).map((match) => match[1]?.trim()).filter(Boolean)));
}

function getDetectedSkuEmbeds(content: string) {
  return Array.from(new Set(Array.from(content.matchAll(/\/sku:([A-Za-z0-9-]+)/g)).map((match) => match[1]?.trim()).filter(Boolean)));
}

function getSeoTone(length: number, min: number, max: number) {
  if (length === 0) {
    return 'bg-slate-200';
  }

  if (length < min) {
    return 'bg-amber-400';
  }

  if (length <= max) {
    return 'bg-emerald-500';
  }

  return 'bg-rose-500';
}

function getSeoProgress(length: number, max: number) {
  return Math.min((length / max) * 100, 100);
}

function getStatusBadgeClasses(status: 'draft' | 'published') {
  return status === 'published'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700';
}

export default function WikiEditor() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p></p>');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [category, setCategory] = useState<string>(WIKI_CATEGORIES[0].value);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageName, setCoverImageName] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isSaving, setIsSaving] = useState<SaveIntent | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [draggingCover, setDraggingCover] = useState(false);

  const slug = useMemo(() => slugify(title), [title]);
  const detectedWikiLinks = useMemo(() => getDetectedWikiLinks(content), [content]);
  const detectedSkuEmbeds = useMemo(() => getDetectedSkuEmbeds(content), [content]);
  const plainContent = useMemo(() => stripHtml(content), [content]);
  const selectedCategoryLabel = useMemo(
    () => WIKI_CATEGORIES.find((item) => item.value === category)?.label || 'Chưa chọn phân loại',
    [category]
  );

  const seoPreviewTitle = (seoTitle || title || 'Tiêu đề bài viết Wiki').trim();
  const seoPreviewDescription =
    (seoDescription || plainContent || 'Mô tả tóm tắt cho bài viết kỹ thuật sẽ xuất hiện tại đây.')
      .trim()
      .slice(0, 160);

  const handleTagCommit = () => {
    const normalized = tagDraft.trim().replace(/^,+|,+$/g, '');
    if (!normalized) {
      return;
    }

    setTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setTagDraft('');
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleTagCommit();
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const uploadCoverFile = async (file: File) => {
    setIsUploadingCover(true);
    try {
      return await uploadToCmsMedia(file, 'wiki-covers');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const applyUploadedCover = (url: string, file: File) => {
    setCoverImageUrl(url);
    setCoverImageName(file.name);
  };

  const handleCoverDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingCover(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    try {
      const url = await uploadCoverFile(file);
      applyUploadedCover(url, file);
      toast.success('Đã tải ảnh bìa');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải ảnh bìa');
    }
  };

  const validateBeforeSave = () => {
    if (!title.trim()) {
      toast.error('Cần nhập tiêu đề bài viết.');
      return false;
    }

    if (!slug) {
      toast.error('Slug chưa hợp lệ. Hãy kiểm tra lại tiêu đề bài viết.');
      return false;
    }

    if (!plainContent.trim()) {
      toast.error('Nội dung bài viết đang trống.');
      return false;
    }

    return true;
  };

  const persistWikiPage = async (intent: SaveIntent) => {
    if (!validateBeforeSave()) {
      return;
    }

    setIsSaving(intent);

    try {
      const nextStatus = intent === 'publish' ? 'published' : status;
      const result = await saveWikiPage({
        title,
        slug,
        content,
        tags,
        status: nextStatus,
        category,
        coverImage: coverImageUrl,
        seoTitle,
        seoDescription,
      });

      if (!result.success) {
        toast.error(result.error || 'Không thể lưu bài viết wiki.');
        return;
      }

      setStatus(nextStatus);
      toast.success(intent === 'publish' ? 'Bài viết đã được xuất bản.' : 'Đã lưu bản nháp.');

      if (intent === 'save-close') {
        router.push('/admin/wiki');
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đã có lỗi hệ thống khi lưu bài viết.');
    } finally {
      setIsSaving(null);
    }
  };

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => {
    const disabled = Boolean(isSaving || isUploadingCover);

    return (
      <div className={cn('flex items-center gap-3', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row')}>
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-200 bg-white text-slate-700 sm:w-auto"
          disabled={disabled}
          onClick={() => persistWikiPage('save-close')}
        >
          {isSaving === 'save-close' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu & Đóng
        </Button>
        <Button
          type="button"
          className="w-full bg-[#2E7D32] text-white hover:bg-[#276a2a] sm:w-auto"
          disabled={disabled}
          onClick={() => persistWikiPage('publish')}
        >
          {isSaving === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          Xuất bản ngay
        </Button>
      </div>
    );
  };

  return (
    <div className="rounded-[28px] bg-slate-50">
      <div className="sticky top-4 z-20 mb-6 rounded-[24px] border border-slate-200 bg-white/95 px-5 py-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-slate-600">
                <Link href="/admin/wiki">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại danh sách
                </Link>
              </Button>
              <Badge variant="outline" className={cn('border text-xs font-semibold', getStatusBadgeClasses(status))}>
                {status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">
                /wiki/{slug || 'ten-bai-viet'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Knowledge CMS</p>
              <h2 className="text-xl font-semibold text-slate-900">Biên tập bài Wiki cho Agri-OS</h2>
              <p className="text-sm text-slate-500">
                Soạn nội dung, cấu hình taxonomy và hoàn thiện SEO metadata trong cùng một màn hình.
              </p>
            </div>
          </div>

          <ActionButtons />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-3">
                <label htmlFor="wiki-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Tiêu đề bài viết
                </label>
                <Input
                  id="wiki-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ví dụ: Quy trình bố trí béc tưới cho sầu riêng 2ha"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-4xl font-bold tracking-tight text-slate-900 shadow-none placeholder:text-slate-300 focus-visible:ring-0"
                />
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <Workflow className="h-4 w-4 text-[#2E7D32]" />
                  <span>Slug tự sinh: </span>
                  <code className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {slug || 'slug-se-duoc-tao-tu-tieu-de'}
                  </code>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nội dung bài viết</p>
                    <p className="text-sm text-slate-500">
                      Hỗ trợ tốt việc nhập token O2O như <code>/sku:ABC-123</code> hoặc <code>[[Tên bài viết]]</code>.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                    Editor chuẩn WYSIWYG
                  </Badge>
                </div>
                <div className="p-5">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Viết bài kỹ thuật, SOP triển khai hoặc note vận hành cho đại lý tại đây..."
                    toolbarPreset="full"
                    minHeightClassName="min-h-[520px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-slate-200 bg-slate-50 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                      <BookOpenText className="h-4 w-4 text-[#2E7D32]" />
                      Mạng lưới Wiki Link
                    </CardTitle>
                    <CardDescription>Những liên kết dạng [[Tên bài viết]] hệ thống vừa bắt được.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex min-h-[92px] flex-wrap gap-2">
                    {detectedWikiLinks.length > 0 ? (
                      detectedWikiLinks.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                        >
                          [[{item}]]
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Chưa có wiki-link nào được phát hiện trong nội dung.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-50 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                      <Unplug className="h-4 w-4 text-[#2E7D32]" />
                      SKU Embed Preview
                    </CardTitle>
                    <CardDescription>Các token /sku đang được giữ lại để resolver nội dung sau khi xuất bản.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {detectedSkuEmbeds.length > 0 ? (
                      detectedSkuEmbeds.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          Sản phẩm: <span className="font-semibold text-slate-900">{item}</span> (Mock Preview)
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Chưa có block nhúng SKU nào trong bài viết.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <Accordion type="multiple" defaultValue={['publish', 'taxonomy', 'cover', 'seo']} className="space-y-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <AccordionItem value="publish" className="border-none">
                <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-slate-900 hover:no-underline">
                  Trạng thái & Xuất bản
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                      <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                        <SelectTrigger className="h-11 border-slate-200 bg-white">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Đã xuất bản</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {status === 'published'
                        ? 'Bài viết đang ở trạng thái public. Các thay đổi tiếp theo sẽ ghi đè nội dung đang hiển thị.'
                        : 'Bản nháp sẽ được lưu để đội nội dung tiếp tục hoàn thiện trước khi phát hành.'}
                    </div>

                    <ActionButtons compact />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <AccordionItem value="taxonomy" className="border-none">
                <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-slate-900 hover:no-underline">
                  Phân loại
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Danh mục Wiki</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11 border-slate-200 bg-white">
                          <SelectValue placeholder="Chọn danh mục wiki" />
                        </SelectTrigger>
                        <SelectContent>
                          {WIKI_CATEGORIES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Tag className="h-4 w-4 text-[#2E7D32]" />
                        Tags
                      </label>
                      <Input
                        value={tagDraft}
                        onChange={(event) => setTagDraft(event.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={handleTagCommit}
                        placeholder="Nhập tag rồi nhấn Enter"
                        className="h-11 border-slate-200 bg-white"
                      />
                      <div className="flex flex-wrap gap-2">
                        {tags.length > 0 ? (
                          tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                            >
                              <span>{tag}</span>
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">Chưa có tag nào được thêm cho bài viết này.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Danh mục hiện tại: <span className="font-semibold text-slate-900">{selectedCategoryLabel}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <AccordionItem value="cover" className="border-none">
                <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-slate-900 hover:no-underline">
                  Ảnh bìa
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDraggingCover(true);
                      }}
                      onDragLeave={() => setDraggingCover(false)}
                      onDrop={handleCoverDrop}
                      className={cn(
                        'rounded-3xl border border-dashed px-4 py-5 transition',
                        draggingCover
                          ? 'border-[#2E7D32] bg-emerald-50/80'
                          : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                      )}
                    >
                      {coverImageUrl ? (
                        <div className="space-y-4">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <img src={coverImageUrl} alt={coverImageName || 'Ảnh bìa'} className="h-48 w-full object-cover" />
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">{coverImageName || 'cover-image.jpg'}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{coverImageUrl}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2E7D32] shadow-sm">
                            {isUploadingCover ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Kéo thả ảnh bìa vào đây</p>
                            <p className="text-sm text-slate-500">Hoặc dùng nút upload có sẵn để chọn ảnh từ máy.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <MediaUploadField
                        label={coverImageUrl ? 'Thay ảnh bìa' : 'Tải ảnh bìa'}
                        uploadFn={uploadCoverFile}
                        onUploaded={applyUploadedCover}
                        size="default"
                      />
                      {coverImageUrl ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-slate-600"
                          onClick={() => {
                            setCoverImageUrl('');
                            setCoverImageName('');
                          }}
                        >
                          Xóa ảnh
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <AccordionItem value="seo" className="border-none">
                <AccordionTrigger className="px-6 py-5 text-left text-base font-semibold text-slate-900 hover:no-underline">
                  Tối ưu SEO
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label className="font-medium text-slate-700">SEO Title</label>
                        <span className="text-slate-500">{seoTitle.length}/60</span>
                      </div>
                      <Input
                        value={seoTitle}
                        onChange={(event) => setSeoTitle(event.target.value.slice(0, 60))}
                        placeholder="Tiêu đề SEO tối ưu cho Google"
                        className="h-11 border-slate-200 bg-white"
                      />
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full transition-all', getSeoTone(seoTitle.length, 35, 60))}
                          style={{ width: `${getSeoProgress(seoTitle.length, 60)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label className="font-medium text-slate-700">SEO Description</label>
                        <span className="text-slate-500">{seoDescription.length}/160</span>
                      </div>
                      <Textarea
                        value={seoDescription}
                        onChange={(event) => setSeoDescription(event.target.value.slice(0, 160))}
                        placeholder="Mô tả ngắn 140-160 ký tự cho kết quả tìm kiếm"
                        className="min-h-[108px] resize-none border-slate-200 bg-white"
                      />
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full transition-all', getSeoTone(seoDescription.length, 110, 160))}
                          style={{ width: `${getSeoProgress(seoDescription.length, 160)}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Search className="h-4 w-4 text-[#2E7D32]" />
                        Google Search Preview
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="line-clamp-2 text-lg font-medium leading-6 text-[#1a0dab]">{seoPreviewTitle}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-emerald-700">
                          <Globe className="h-3.5 w-3.5" />
                          <span>nhabeagri.vn/wiki/{slug || 'ten-bai-viet'}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{seoPreviewDescription}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      SEO title chuẩn nhất khi nằm trong khoảng 35-60 ký tự, còn meta description nên giữ trong mức 110-160 ký tự.
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          </Accordion>

          <Card className="border-slate-200 bg-slate-900 text-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Checklist trước khi xuất bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', title.trim() ? 'bg-emerald-400' : 'bg-slate-600')} />
                <span>Tiêu đề rõ ràng và slug đã sẵn sàng.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', plainContent ? 'bg-emerald-400' : 'bg-slate-600')} />
                <span>Nội dung chính đã được điền trong editor.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', coverImageUrl ? 'bg-emerald-400' : 'bg-slate-600')} />
                <span>Ảnh bìa đã có để tăng CTR và chia sẻ tốt hơn.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', seoTitle || seoDescription ? 'bg-emerald-400' : 'bg-slate-600')} />
                <span>Metadata SEO đã được tối ưu cho kết quả tìm kiếm.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
