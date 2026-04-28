'use client';

import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Listens to Supabase Realtime for new 'hot' leads in calculator_leads table.
 * Displays a toast notification with sound alert.
 */
export default function RealtimeLeadNotifier() {
  useEffect(() => {
    const channel = supabase
      .channel('admin-hot-leads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calculator_leads' },
        (payload) => {
          const lead = payload.new as any;
          // Check if lead is "hot" (recently created or status is 'hot')
          const isHot = lead.status === 'hot' || lead.status === 'new';
          if (!isHot) return;

          // Play alert sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+MkZOWkpGOi4eFgHx5eHl7f4KFiIuNj5CRkZGQj42LiIWCf3x5d3Z2d3l7foCDhYiKjI2Oj4+PjoyKiIWDgH57eHZ1dXZ3eXt+gIOFiIqMjY6Pj4+OjIqIhYOAfnt4dnV1dnd5e36Ag4WIioyNjo+Pj46MioiFg4B+e3h2dXV2d3l7foCDhYiKjI2Oj4+PjoyKiIWDgH57eHZ1dXZ3eXt+gIOFiIqMjY6Pj4+OjIqIhYOAfnt4dnV1');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}

          toast({
            title: `🔥 Lead mới: ${lead.customer_name || 'Khách hàng mới'}`,
            description: `${lead.crop || 'N/A'} · ${lead.customer_province || 'Chưa xác định'} · ${lead.area_m2 ? (lead.area_m2 / 10000).toFixed(1) + ' ha' : ''}`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
