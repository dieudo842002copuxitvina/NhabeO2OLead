import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  accept?: string;
  label?: string;
  uploadFn: (file: File) => Promise<string>;
  onUploaded: (url: string, file: File) => void;
  size?: 'sm' | 'default';
}

export default function MediaUploadField({
  accept = 'image/*', label = 'Upload', uploadFn, onUploaded, size = 'sm',
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadFn(file);
      onUploaded(url, file);
      toast.success('Đã upload');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <Button
        type="button" size={size} variant="outline"
        onClick={() => ref.current?.click()} disabled={busy}
      >
        {busy
          ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          : <Upload className="w-3.5 h-3.5 mr-1" />}
        {label}
      </Button>
      <input ref={ref} type="file" accept={accept} hidden onChange={handle} />
    </>
  );
}
