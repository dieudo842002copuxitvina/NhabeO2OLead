import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code2, Minus,
} from 'lucide-react';
import { uploadToCmsMedia } from '@/lib/cms';
import { toast } from 'sonner';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg my-3 max-w-full' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Bắt đầu viết bài…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[280px] focus:outline-none px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. when loading existing article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL liên kết:', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const onPickImage = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCmsMedia(file, 'articles');
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success('Đã chèn ảnh');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      e.target.value = '';
    }
  };

  const Btn = ({ on, active, children, label }: any) => (
    <Button
      type="button" size="icon" variant={active ? 'secondary' : 'ghost'}
      className="h-8 w-8" onClick={on} title={label}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex items-center gap-0.5 flex-wrap border-b bg-muted/40 p-1">
        <Btn label="Bold" active={editor.isActive('bold')} on={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </Btn>
        <Btn label="Italic" active={editor.isActive('italic')} on={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="H2" active={editor.isActive('heading', { level: 2 })}
          on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </Btn>
        <Btn label="H3" active={editor.isActive('heading', { level: 3 })}
          on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="Bullet list" active={editor.isActive('bulletList')}
          on={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </Btn>
        <Btn label="Ordered list" active={editor.isActive('orderedList')}
          on={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </Btn>
        <Btn label="Quote" active={editor.isActive('blockquote')}
          on={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </Btn>
        <Btn label="Code block" active={editor.isActive('codeBlock')}
          on={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="w-4 h-4" />
        </Btn>
        <Btn label="Divider" on={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="Link" active={editor.isActive('link')} on={setLink}>
          <LinkIcon className="w-4 h-4" />
        </Btn>
        <Btn label="Insert image" on={onPickImage}>
          <ImageIcon className="w-4 h-4" />
        </Btn>
        <span className="flex-1" />
        <Btn label="Undo" on={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </Btn>
        <Btn label="Redo" on={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
    </div>
  );
}
