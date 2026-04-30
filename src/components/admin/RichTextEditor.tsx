'use client';

import { useEffect, useRef, type ChangeEvent, type ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCmsMedia } from '@/lib/cms';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  toolbarPreset?: 'basic' | 'full';
  minHeightClassName?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  toolbarPreset = 'full',
  minHeightClassName,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isBasicToolbar = toolbarPreset === 'basic';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#2E7D32] underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'my-3 max-w-full rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Bắt đầu nhập nội dung...',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none px-4 py-3 text-sm leading-7 text-slate-700 focus:outline-none',
          '[&_a]:text-[#2E7D32] [&_a]:underline [&_a]:underline-offset-4',
          '[&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900',
          '[&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900',
          '[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6',
          minHeightClassName ?? 'min-h-[280px]'
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL liên kết:', previousUrl ?? 'https://');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const onPickImage = () => fileRef.current?.click();

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageUrl = await uploadToCmsMedia(file, 'articles');
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
      toast.success('Đã chèn ảnh');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload ảnh thất bại');
    } finally {
      event.target.value = '';
    }
  };

  const ToolbarButton = ({
    active = false,
    label,
    onClick,
    children,
  }: {
    active?: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
  }) => (
    <Button
      type="button"
      size="icon"
      variant={active ? 'secondary' : 'ghost'}
      className={cn(
        'h-9 w-9 rounded-xl border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        active ? 'border-slate-200 bg-white text-slate-900 shadow-sm' : undefined
      )}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        {!isBasicToolbar ? (
          <>
            <ToolbarButton
              label="Quote"
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Code block"
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-4 w-4" />
            </ToolbarButton>
          </>
        ) : null}

        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton label="Insert link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {!isBasicToolbar ? (
          <ToolbarButton label="Insert image" onClick={onPickImage}>
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        ) : null}

        <span className="flex-1" />

        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {!isBasicToolbar ? (
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
      ) : null}
    </div>
  );
}
