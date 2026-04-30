'use client';

import { Controller, useWatch, type Control } from 'react-hook-form';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SeoSettingsProps {
  control: Control<any>;
  titleName: string;
  descriptionName: string;
  slug: string;
}

const SEO_TITLE_LIMIT = 60;
const SEO_DESCRIPTION_LIMIT = 160;

export default function SeoSettings({
  control,
  titleName,
  descriptionName,
  slug,
}: SeoSettingsProps) {
  const seoTitle = useWatch({ control, name: titleName as any }) || '';
  const seoDescription = useWatch({ control, name: descriptionName as any }) || '';
  const isTitleOverflow = seoTitle.length > SEO_TITLE_LIMIT;
  const isDescriptionOverflow = seoDescription.length > SEO_DESCRIPTION_LIMIT;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-slate-700">SEO Title</label>
          <span className={cn('font-medium', isTitleOverflow ? 'text-rose-600' : 'text-slate-500')}>
            {seoTitle.length}/{SEO_TITLE_LIMIT}
          </span>
        </div>
        <Controller
          control={control}
          name={titleName as any}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Tiêu đề SEO cho Google"
              className={cn('h-11 bg-white', isTitleOverflow ? 'border-rose-300 text-rose-700' : 'border-slate-200')}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-slate-700">SEO Description</label>
          <span className={cn('font-medium', isDescriptionOverflow ? 'text-rose-600' : 'text-slate-500')}>
            {seoDescription.length}/{SEO_DESCRIPTION_LIMIT}
          </span>
        </div>
        <Controller
          control={control}
          name={descriptionName as any}
          render={({ field }) => (
            <Textarea
              {...field}
              value={field.value || ''}
              placeholder="Mô tả SEO ngắn gọn cho kết quả tìm kiếm"
              className={cn(
                'min-h-[112px] resize-none bg-white',
                isDescriptionOverflow ? 'border-rose-300 text-rose-700' : 'border-slate-200'
              )}
            />
          )}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Search className="h-4 w-4 text-[#2E7D32]" />
          Google SERP Preview
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            nhabeagri.vn &gt; wiki &gt; {slug || 'slug-bai-viet'}
          </p>
          <p className="mt-2 text-lg font-medium leading-6 text-blue-600 transition hover:underline">
            {seoTitle.trim() || 'Tiêu đề bài viết sẽ hiển thị ở đây...'}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {seoDescription.trim() || 'Mô tả SEO sẽ hiển thị tại đây khi bạn bắt đầu nhập nội dung tối ưu.'}
          </p>
        </div>
      </div>
    </div>
  );
}
