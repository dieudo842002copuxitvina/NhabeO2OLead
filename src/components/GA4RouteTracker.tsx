"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ga4PageView } from '@/lib/ga4Client';

/** Fires GA4 page_view on every SPA route change. Mount once in Layout. */
export default function GA4RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    ga4PageView(url);
  }, [pathname, searchParams]);

  return null;
}
