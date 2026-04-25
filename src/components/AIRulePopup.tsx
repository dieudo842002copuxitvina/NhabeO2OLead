"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getActivePricePopup, subscribeRules, type PriceRule } from '@/lib/aiRules';
import { topCommodity } from '@/lib/shadowProfile';
import { trackEvent } from '@/lib/tracking';

const SESSION_KEY = 'agriflow_price_popup_shown';

/**
 * Auto-popup driven by AI Rules Manager (Price triggers).
 * Shows once per session if a price rule is triggered AND the user's shadow profile
 * (or geo) matches the rule's target crop region.
 */
export default function AIRulePopup() {
  const [rule, setRule] = useState<PriceRule | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return;
      const r = getActivePricePopup();
      if (!r) return;
      // Audience filter: shadow profile crop matches commodity, or no profile = show to all
      const top = topCommodity();
      const cropMatch =
        !top ||
        (r.commodity.toLowerCase().includes('cà phê') && top === 'ca-phe') ||
        (r.commodity.toLowerCase().includes('sầu riêng') && top === 'sau-rieng') ||
        (r.commodity.toLowerCase().includes('tiêu') && top === 'tieu') ||
        (r.commodity.toLowerCase().includes('lúa') && top === 'lua') ||
        (r.commodity.toLowerCase().includes('cao su') && top === 'cao-su');
      if (!cropMatch) return;
      setRule(r);
      // Delay popup so it doesn't appear instantly on load
      const t = setTimeout(() => {
        setOpen(true);
        if (typeof window !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
        trackEvent('page_view', { source: `ai_rule_popup_${r.id}` });
      }, 3500);
      return () => clearTimeout(t);
    };
    check();
    const unsub = subscribeRules(check);
    return unsub;
  }, []);

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-success" />
          </div>
          <DialogTitle className="text-xl font-display">{rule.popupTitle}</DialogTitle>
          <DialogDescription className="text-base pt-2">{rule.popupBody}</DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          🤖 Gợi ý tự động: Giá <strong>{rule.commodity}</strong> đang tăng &gt; {rule.changePctMin}% — phù hợp cho vùng <strong>{rule.targetCropRegion}</strong>.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>Để sau</Button>
          <Button asChild onClick={() => { setOpen(false); trackEvent('category_click', { category: rule.popupTitle, source: 'ai_rule_popup' }); }}>
            <Link href={rule.popupCtaTo}>{rule.popupCta} <ArrowRight className="ml-1 w-4 h-4" /></Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
