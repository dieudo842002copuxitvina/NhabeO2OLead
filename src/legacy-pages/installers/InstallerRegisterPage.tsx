import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hammer, Upload, X, CheckCircle2, IdCard, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitInstaller, SPECIALTY_META, type InstallerSpecialty } from '@/lib/installers';
import { fileToDataURL } from '@/lib/imageUtils';
import { useApp } from '@/contexts/AppContext';

const VN_PROVINCES = ['Đồng Nai', 'Lâm Đồng', 'Tây Ninh', 'Bình Phước', 'Đắk Lắk', 'Đắk Nông', 'Gia Lai', 'Kon Tum', 'Bình Dương', 'TP.HCM', 'Long An', 'Tiền Giang', 'Cần Thơ', 'An Giang', 'Kiên Giang'];

const schema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(100),
  phone: z.string().trim().regex(/^(0|\+84)\d{9,10}$/, 'SĐT không hợp lệ'),
  zalo: z.string().trim().regex(/^(0|\+84)\d{9,10}$/, 'Zalo không hợp lệ'),
  province: z.string().min(1, 'Chọn tỉnh/thành'),
  experienceYears: z.number().min(0).max(50),
});

export default function InstallerRegisterPage() {
  const { userLocation } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', phone: '', zalo: '', province: 'Đồng Nai', experienceYears: 1 });
  const [specs, setSpecs] = useState<InstallerSpecialty[]>([]);
  const [cccd, setCccd] = useState<string>('');
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleCccd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { setCccd(await fileToDataURL(f, 600, 0.7)); }
    finally { setUploading(false); }
  };

  const handlePortfolio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - portfolio.length);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => fileToDataURL(f, 800, 0.6)));
      setPortfolio(p => [...p, ...urls].slice(0, 5));
    } finally { setUploading(false); }
  };

  const removePortfolio = (i: number) => setPortfolio(p => p.filter((_, idx) => idx !== i));

  const toggleSpec = (s: InstallerSpecialty) => {
    setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = () => {
    const parsed = schema.safeParse(form);
    const errs: Record<string, string> = {};
    if (!parsed.success) parsed.error.errors.forEach(e => { errs[e.path[0] as string] = e.message; });
    if (specs.length === 0) errs.specs = 'Chọn ít nhất 1 chuyên môn';
    if (!cccd) errs.cccd = 'Vui lòng upload ảnh CCCD';
    if (portfolio.length < 1) errs.portfolio = 'Upload ít nhất 1 ảnh công trình';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ title: 'Hồ sơ chưa đủ', description: 'Vui lòng kiểm tra các trường còn thiếu', variant: 'destructive' });
      return;
    }
    submitInstaller(
      { ...form, specialties: specs, cccdImage: cccd, portfolioImages: portfolio },
      userLocation,
    );
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container py-12 max-w-xl">
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Đã gửi hồ sơ!</h2>
            <p className="text-muted-foreground mb-6">
              Tổ QA của Nhà Bè Agri sẽ thẩm định trong 24-48h và liên hệ qua Zalo. Cảm ơn bạn đã tham gia mạng lưới!
            </p>
            <Button onClick={() => navigate('/')} className="w-full h-12">Về trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Hammer className="w-8 h-8 text-primary" /> Đăng ký Đội thợ thi công
        </h1>
        <p className="text-muted-foreground mt-1">
          Tham gia mạng lưới thi công Nhà Bè Agri — nhận đơn lắp đặt từ khách hàng gần bạn.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin cá nhân</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Họ và tên" error={errors.fullName}>
            <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-11" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Số điện thoại" error={errors.phone}>
              <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11" placeholder="0901234567" />
            </Field>
            <Field label="Zalo" error={errors.zalo}>
              <Input type="tel" value={form.zalo} onChange={e => setForm({ ...form, zalo: e.target.value })} className="h-11" placeholder="0901234567" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tỉnh/Thành" error={errors.province}>
              <select
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {VN_PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Số năm kinh nghiệm" error={errors.experienceYears}>
              <Input type="number" min={0} max={50} value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: Number(e.target.value) || 0 })} className="h-11" />
            </Field>
          </div>

          <Field label="Chuyên môn (chọn ít nhất 1)" error={errors.specs}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(SPECIALTY_META) as InstallerSpecialty[]).map(s => (
                <button
                  key={s} type="button" onClick={() => toggleSpec(s)}
                  className={`p-2.5 rounded-lg border-2 transition-all text-center text-xs font-medium ${
                    specs.includes(s) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="text-xl mb-1">{SPECIALTY_META[s].emoji}</div>
                  {SPECIALTY_META[s].label}
                </button>
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle className="flex items-center gap-2"><IdCard className="w-5 h-5" /> Hồ sơ KYC</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* CCCD */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Ảnh CCCD (mặt trước)</Label>
            {cccd ? (
              <div className="relative w-fit">
                <img src={cccd} alt="CCCD" className="w-48 h-32 object-cover rounded-lg border" />
                <button type="button" onClick={() => setCccd('')} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Tải ảnh CCCD</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCccd} />
              </label>
            )}
            {errors.cccd && <p className="text-sm text-destructive mt-1.5">{errors.cccd}</p>}
          </div>

          {/* Portfolio */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Ảnh công trình đã thi công ({portfolio.length}/5)
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {portfolio.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={url} alt={`Công trình ${i+1}`} className="w-full h-full object-cover rounded-lg border" />
                  <button type="button" onClick={() => removePortfolio(i)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {portfolio.length < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolio} />
                </label>
              )}
            </div>
            {errors.portfolio && <p className="text-sm text-destructive mt-1.5">{errors.portfolio}</p>}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={uploading} size="lg" className="w-full h-14 mt-4 text-base font-semibold">
        {uploading ? 'Đang tải ảnh...' : 'Gửi hồ sơ đăng ký'}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Bằng cách gửi hồ sơ, bạn đồng ý cho Nhà Bè Agri sử dụng thông tin để xét duyệt và phân phối đơn hàng.
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
