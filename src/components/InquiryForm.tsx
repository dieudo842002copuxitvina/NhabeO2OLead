/**
 * InquiryForm.tsx
 * Compact "Hỏi giá nhanh" form — dùng trên ProductDetailPage, NearbyDealers, v.v.
 * Tích hợp Zero-Friction Engine: react-hook-form + Zod + phone auto-format + Smart Memory.
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { quickInquirySchema, type QuickInquiryFormData, formatPhoneInput } from '@/lib/formSchemas';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { trackEvent } from '@/lib/tracking';
import { Card, CardContent } from '@/components/ui/card';

interface InquiryFormProps {
  productId?: string;
  productName?: string;
  dealerId?: string;
  dealerName?: string;
}

const INPUT_CLS =
  'w-full h-12 px-4 rounded-xl border-2 border-border bg-background text-sm font-medium ' +
  'placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#2D5A27] ' +
  'transition-colors duration-200';

const INPUT_ERR = 'border-destructive focus:border-destructive';

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] text-destructive mt-1 flex items-center gap-1"
        >
          <span className="w-1 h-1 rounded-full bg-destructive shrink-0" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function InquiryForm({ productId, productName, dealerId, dealerName }: InquiryFormProps) {
  const { profile, updateProfile, isLoaded } = useFarmerProfile();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<QuickInquiryFormData>({
    resolver: zodResolver(quickInquirySchema),
    mode: 'onChange',
    defaultValues: { name: '', phone: '' },
  });

  // Smart Memory pre-fill
  useEffect(() => {
    if (!isLoaded) return;
    if (profile.name)  setValue('name', profile.name);
    if (profile.phone) setValue('phone', profile.phone);
  }, [isLoaded, profile, setValue]);

  const onSubmit = async (data: QuickInquiryFormData) => {
    updateProfile({ name: data.name, phone: data.phone });
    await new Promise(r => setTimeout(r, 600));
    trackEvent('inquiry_submit', { productId, productName, dealerId, dealerName });
    toast.success('Yêu cầu đã gửi! Đại lý sẽ liên hệ bạn sớm.', {
      description: `Chúng tôi sẽ gọi lại số ${data.phone}.`,
    });
  };

  if (isSubmitSuccessful) {
    return (
      <Card className="border-[#2D5A27]/20 bg-[#2D5A27]/5">
        <CardContent className="p-5 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#2D5A27] mx-auto mb-3" />
          <p className="font-semibold text-[#2D5A27]">Đã gửi yêu cầu!</p>
          <p className="text-sm text-muted-foreground mt-1">Đại lý liên hệ lại trong 30 phút</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 md:p-5">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
          📋 Hỏi giá nhanh
          {productName && (
            <span className="text-xs font-normal text-muted-foreground">— {productName}</span>
          )}
        </h4>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          {/* Name */}
          <div>
            <input
              {...register('name', {
                onChange: e => updateProfile({ name: e.target.value }),
              })}
              type="text"
              autoComplete="name"
              placeholder="Họ tên *"
              className={`${INPUT_CLS} ${errors.name ? INPUT_ERR : ''}`}
            />
            <FieldError msg={errors.name?.message} />
          </div>

          {/* Phone */}
          <div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Số điện thoại * (090 123 4567)"
                  className={`${INPUT_CLS} ${errors.phone ? INPUT_ERR : ''}`}
                  onChange={e => {
                    const f = formatPhoneInput(e.target.value);
                    field.onChange(f);
                    updateProfile({ phone: f });
                  }}
                />
              )}
            />
            <FieldError msg={errors.phone?.message} />
          </div>

          {/* Product context */}
          {productName && (
            <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              Sản phẩm: <span className="font-medium text-foreground">{productName}</span>
            </p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full h-12 rounded-xl text-sm font-bold text-white
              flex items-center justify-center gap-2 transition-all
              ${isSubmitting
                ? 'bg-[#FF6B00]/70 cursor-not-allowed'
                : 'bg-[#FF6B00] hover:bg-[#E55C00] shadow-md shadow-[#FF6B00]/25'
              }
            `}
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
              : <><Send className="w-4 h-4" /> Gửi yêu cầu</>
            }
          </motion.button>
        </form>
      </CardContent>
    </Card>
  );
}
