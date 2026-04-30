'use client';

import { useState, type KeyboardEvent } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Tags, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TagInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
}

function normalizeTagChunk(value: string) {
  return value.trim().replace(/^,+|,+$/g, '');
}

export default function TagInput({
  control,
  name,
  label = 'Tags',
  placeholder = 'Nhập tag rồi nhấn Enter hoặc dấu phẩy',
  description = 'Dùng tags để gom nhóm bài viết theo mùa vụ, cây trồng hoặc loại giải pháp.',
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  return (
    <Controller
      control={control}
      name={name as any}
      render={({ field }) => {
        const tags = Array.isArray(field.value) ? field.value : [];

        const commitDraft = () => {
          const nextTags = draft
            .split(',')
            .map(normalizeTagChunk)
            .filter(Boolean);

          if (nextTags.length === 0) {
            return;
          }

          field.onChange(Array.from(new Set([...tags, ...nextTags])));
          setDraft('');
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key !== 'Enter' && event.key !== ',') {
            return;
          }

          event.preventDefault();
          commitDraft();
        };

        const removeTag = (tagToRemove: string) => {
          field.onChange(tags.filter((tag: string) => tag !== tagToRemove));
        };

        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Tags className="h-4 w-4 text-[#2E7D32]" />
                {label}
              </label>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitDraft}
                placeholder={placeholder}
                className="h-11 border-slate-200 bg-white"
              />
              <p className="text-xs leading-5 text-slate-500">{description}</p>
            </div>

            <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {tags.length > 0 ? (
                tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      'rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm',
                      'hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`Xóa tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có tag nào được thêm cho bài viết này.</p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
