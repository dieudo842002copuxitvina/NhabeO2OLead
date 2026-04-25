import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, Music2 } from 'lucide-react';

interface ThankYouModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealerName?: string;
}

/**
 * Thank-you confirmation shown after a customer taps "Gọi Đại lý".
 * Includes social CTAs to keep the customer in the Nhà Bè Agri ecosystem.
 */
export default function ThankYouModal({ open, onOpenChange, dealerName }: ThankYouModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>
          <DialogTitle className="font-display text-xl">Cảm ơn bạn đã tin tưởng Nhà Bè Agri!</DialogTitle>
          <DialogDescription className="text-base">
            {dealerName ? `${dealerName} sẽ` : 'Đại lý sẽ'} sớm liên hệ lại với bạn để tư vấn chi tiết.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <Button
            asChild
            size="lg"
            className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold"
          >
            <a
              href="https://zalo.me/g/nongdan40"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Tham gia nhóm Zalo Nông dân 4.0
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-12 border-primary/40 text-primary hover:bg-primary/5 font-semibold"
          >
            <a
              href="https://www.tiktok.com/@dieudo.nhabeagri"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Music2 className="w-5 h-5 mr-2" />
              Xem kỹ thuật trên TikTok Điểu Đơ
            </a>
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-1">
          Phản hồi trong vòng 30 phút trong giờ hành chính
        </p>
      </DialogContent>
    </Dialog>
  );
}
