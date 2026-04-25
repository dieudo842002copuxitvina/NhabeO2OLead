import { Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/tracking';
import { pushLead } from '@/lib/leads';
import ThankYouModal from './ThankYouModal';
import { toast } from 'sonner';

interface DealerCTAProps {
  phone: string;
  zalo: string;
  dealerId: string;
  dealerName: string;
  productId?: string;
  productName?: string;
  customerProvince?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

/** Build Zalo deep-link with prefilled message (optionally including customer province) */
export function buildZaloLink(zalo: string, productName?: string, customerProvince?: string): string {
  const cleaned = zalo.replace(/[^0-9]/g, '');
  const productPart = productName ? productName : 'sản phẩm';
  const provincePart = customerProvince ? ` tại khu vực ${customerProvince}` : '';
  const msg = `Tôi quan tâm đến ${productPart}${provincePart} trên Nhà Bè Agri, mong được tư vấn kỹ thuật.`;
  return `https://zalo.me/${cleaned}?body=${encodeURIComponent(msg)}`;
}

export default function DealerCTA({ phone, zalo, dealerId, dealerName, productId, productName, customerProvince, size = 'lg', className = '' }: DealerCTAProps) {
  const [thankYouOpen, setThankYouOpen] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success('Đã sao chép số điện thoại đại lý', { description: phone });
    } catch {
      // Clipboard blocked — silent fallback
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('call_click', { dealerId, dealerName, productId, productName });
    pushLead({
      dealerId, channel: 'call', productId, productName,
      customerHint: `Khách ẩn danh · ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      source: typeof window !== 'undefined' ? window.location.pathname : '',
    });
    void copyPhone();
    // Show ThankYou modal shortly after the tel: handoff so customers see it
    // when they switch back from the dialer (or immediately on desktop).
    setTimeout(() => setThankYouOpen(true), 400);
  };

  const handleZalo = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('zalo_click', { dealerId, dealerName, productId, productName });
    pushLead({
      dealerId, channel: 'zalo', productId, productName,
      customerHint: `Khách ẩn danh · ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      source: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  };

  const isLg = size === 'lg';
  const zaloHref = buildZaloLink(zalo, productName, customerProvince);

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <Button
          size={size}
          className={`flex-1 bg-primary hover:bg-primary/90 ${isLg ? 'h-14 text-base font-semibold' : 'h-11'}`}
          asChild
          onClick={handleCall}
        >
          <a href={`tel:${phone}`}>
            <Phone className={isLg ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-1.5'} />
            Gọi Đại lý
          </a>
        </Button>
        <Button
          size={size}
          variant="outline"
          className={`flex-1 border-primary text-primary hover:bg-primary/5 ${isLg ? 'h-14 text-base font-semibold' : 'h-11'}`}
          asChild
          onClick={handleZalo}
        >
          <a href={zaloHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className={isLg ? 'w-5 h-5 mr-2' : 'w-4 h-4 mr-1.5'} />
            Chat Zalo
          </a>
        </Button>
      </div>
      <ThankYouModal
        open={thankYouOpen}
        onOpenChange={setThankYouOpen}
        dealerName={dealerName}
      />
    </>
  );
}
