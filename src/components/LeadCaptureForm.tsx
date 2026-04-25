/**
 * LeadCaptureForm.tsx
 * "Zero-Friction" Lead Capture — tích hợp toàn bộ Form Engine:
 *   ✓ react-hook-form (no re-render)
 *   ✓ Zod validation real-time
 *   ✓ useFarmerProfile (pre-fill + auto-save)
 *   ✓ CropPicker (visual grid, no dropdown)
 *   ✓ SmartLocationPicker (offline-first + navigator.geolocation)
 *   ✓ Phone auto-format (090 123 4567)
 *   ✓ Area input: inputMode="decimal"
 *   ✓ High-contrast UI for outdoor visibility
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2, User, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { leadCaptureSchema, type LeadCaptureFormData, formatPhoneInput } from '@/lib/formSchemas';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import CropPicker from '@/components/CropPicker';
import SmartLocationPicker from '@/components/SmartLocationPicker';
import { CROP_OPTIONS } from '@/components/CropPicker';
import { trackEvent } from '@/lib/tracking';

// ─── Shared input styling ─────────────────────────────────────────────────────
const INPUT_BASE =
  'w-full h-13 px-4 rounded-xl border-2 border-border bg-background text-base ' +
  'font-medium placeholder:text-muted-foreground/60 ' +
  'focus:outline-none focus:border-[#2D5A27] ' +
  'transition-colors duration-200 ';

const INPUT_ERROR = 'border-destructive focus:border-destructive';

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 text-xs text-destructive mt-1"
        >
          <span className="w-1 h-1 rounded-full bg-destructive shrink-0" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

interface Props {
  /** Context: which page is this form on */
  source?: string;
  /** Show compact version (no location, no crop) */
  compact?: boolean;
  onSuccess?: () => void;
}

export default function LeadCaptureForm({ source = 'homepage', compact = false, onSuccess }: Props) {
  const { profile, updateProfile, isLoaded } = useFarmerProfile();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    mode: 'onChange', // real-time validation
    defaultValues: {
      name: '',
      phone: '',
      cropKey: '',
      areHa: undefined,
      provinceCode: '',
      districtCode: '',
      message: '',
    },
  });

  // Pre-fill from Smart Memory once loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (profile.name)         setValue('name', profile.name);
    if (profile.phone)        setValue('phone', profile.phone);
    if (profile.cropKey)      setValue('cropKey', profile.cropKey);
    if (profile.areHa)        setValue('areHa', profile.areHa);
    if (profile.provinceCode) setValue('provinceCode', profile.provinceCode);
    if (profile.districtCode) setValue('districtCode', profile.districtCode);
  }, [isLoaded, profile, setValue]);

  const onSubmit = async (data: LeadCaptureFormData) => {
    // Persist to Smart Memory
    const crop = CROP_OPTIONS.find(c => c.key === data.cropKey);
    updateProfile({
      name: data.name,
      phone: data.phone,
      cropKey: data.cropKey,
      cropName: crop?.name ?? '',
      areHa: data.areHa,
      provinceCode: data.provinceCode,
      districtCode: data.districtCode,
    });

    // Simulate API call
    await new Promise(r => setTimeout(r, 700));

    trackEvent('lead_submit', {
      source,
      cropKey: data.cropKey,
      province: data.provinceCode,
    });

    toast.success('✅ Đã nhận yêu cầu! Đại lý sẽ liên hệ trong 30 phút.', {
      description: `Chúng tôi sẽ gọi lại số ${data.phone}.`,
    });

    onSuccess?.();
  };

  if (isSubmitSuccessful) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 px-6 text-center rounded-2xl bg-[#2D5A27]/5 border-2 border-[#2D5A27]/20"
      >
        <CheckCircle2 className="w-14 h-14 text-[#2D5A27] mb-4" />
        <h3 className="font-display text-xl font-bold text-[#2D5A27]">Đã gửi thành công!</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Đại lý gần bạn nhất sẽ liên hệ trong vòng 30 phút (giờ hành chính).
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* ── Tên nông dân ── */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Họ tên <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register('name', {
              onChange: e => updateProfile({ name: e.target.value }),
            })}
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            className={`${INPUT_BASE} pl-10 ${errors.name ? INPUT_ERROR : ''}`}
          />
        </div>
        <FieldError msg={errors.name?.message} />
      </div>

      {/* ── Số điện thoại ── */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Số điện thoại <span className="text-destructive">*</span>
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="090 123 4567"
              className={`${INPUT_BASE} ${errors.phone ? INPUT_ERROR : ''}`}
              onChange={e => {
                const formatted = formatPhoneInput(e.target.value);
                field.onChange(formatted);
                updateProfile({ phone: formatted });
              }}
            />
          )}
        />
        <FieldError msg={errors.phone?.message} />
      </div>

      {!compact && (
        <>
          {/* ── Loại cây trồng ── */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Loại cây trồng chính <span className="text-destructive">*</span>
            </label>
            <Controller
              name="cropKey"
              control={control}
              render={({ field }) => (
                <CropPicker
                  value={field.value}
                  onChange={(key, name) => {
                    field.onChange(key);
                    updateProfile({ cropKey: key, cropName: name });
                  }}
                  error={errors.cropKey?.message}
                  mobileCols={2}
                />
              )}
            />
          </div>

          {/* ── Diện tích ── */}
          <div>
            <label htmlFor="areHa" className="block text-sm font-semibold mb-1.5">
              Diện tích canh tác <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="areHa"
                {...register('areHa', {
                  valueAsNumber: true,
                  onChange: e => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) updateProfile({ areHa: v });
                  },
                })}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.1"
                max="10000"
                placeholder="VD: 2.5"
                className={`${INPUT_BASE} pl-10 ${errors.areHa ? INPUT_ERROR : ''}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                ha
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">1 ha = 10.000 m²</p>
            <FieldError msg={errors.areHa?.message} />
          </div>

          {/* ── Địa điểm ── */}
          <div>
            <p className="text-sm font-semibold mb-2">
              Khu vực canh tác <span className="text-destructive">*</span>
            </p>
            <Controller
              name="provinceCode"
              control={control}
              render={({ field: pField }) => (
                <Controller
                  name="districtCode"
                  control={control}
                  render={({ field: dField }) => (
                    <SmartLocationPicker
                      provinceCode={pField.value}
                      districtCode={dField.value}
                      wardCode=""
                      onProvinceChange={(code, name) => {
                        pField.onChange(code);
                        setValue('districtCode', '');
                        updateProfile({ provinceCode: code, provinceName: name, districtCode: '', districtName: '' });
                      }}
                      onDistrictChange={(code, name) => {
                        dField.onChange(code);
                        updateProfile({ districtCode: code, districtName: name });
                      }}
                      onWardChange={() => {}}
                      onGeoSuccess={(lat, lng) => updateProfile({ lat, lng })}
                      provinceError={errors.provinceCode?.message}
                      districtError={errors.districtCode?.message}
                      showWard={false}
                    />
                  )}
                />
              )}
            />
          </div>

          {/* ── Nội dung (optional) ── */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold mb-1.5">
              Nội dung cần tư vấn <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
            </label>
            <textarea
              id="message"
              {...register('message')}
              rows={3}
              placeholder="Mô tả nhu cầu của bạn, ví dụ: cần lắp tưới nhỏ giọt cho 2ha sầu riêng..."
              className={`${INPUT_BASE} h-auto py-3 resize-none`}
            />
            <FieldError msg={errors.message?.message} />
          </div>
        </>
      )}

      {/* ── Submit ── */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full h-14 rounded-xl text-base font-bold text-white
          flex items-center justify-center gap-2
          transition-all duration-200 shadow-lg
          ${isSubmitting
            ? 'bg-[#FF6B00]/70 cursor-not-allowed'
            : 'bg-[#FF6B00] hover:bg-[#E55C00] active:scale-[0.99] shadow-[#FF6B00]/30'
          }
        `}
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</>
        ) : (
          <><Send className="w-5 h-5" /> Gửi yêu cầu tư vấn</>
        )}
      </motion.button>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Thông tin của bạn được bảo mật. Chúng tôi không chia sẻ với bên thứ ba.
      </p>
    </form>
  );
}
