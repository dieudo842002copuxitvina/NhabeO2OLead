"use client";

import { useCallback, useEffect, useState } from 'react';

/**
 * useLayoutMetrics — Measures the heights of the sticky Header and the fixed
 * BottomNav, then exposes them as CSS variables on <html>:
 *
 *   --header-h         → total visible header height (px)
 *   --bottomnav-h      → total visible bottomnav height (px) — 0 on desktop
 *   --safe-top         → env(safe-area-inset-top) shim
 *   --safe-bottom      → env(safe-area-inset-bottom) shim
 *   --content-min-h    → 100dvh − header − bottomnav (use for full-bleed pages)
 *
 * Elements opt-in via data attributes:
 *   data-app-header="true"     on the sticky header wrapper
 *   data-app-bottomnav="true"  on the fixed bottom nav wrapper
 *
 * Uses ResizeObserver so values update on viewport resize, ticker show/hide,
 * mobile-menu open, etc. Falls back to sensible defaults if the elements are
 * absent (e.g. portal pages without bottom nav).
 */
export function useLayoutMetrics() {
  useEffect(() => {
    const root = document.documentElement;

    const setVar = (name: string, value: string) => {
      root.style.setProperty(name, value);
    };

    const measure = () => {
      const header = document.querySelector<HTMLElement>('[data-app-header="true"]');
      const bottom = document.querySelector<HTMLElement>('[data-app-bottomnav="true"]');

      const headerH = header?.getBoundingClientRect().height ?? 0;

      // BottomNav is mobile-only (display: none on md+). Treat hidden as 0.
      const bottomH =
        bottom && bottom.offsetParent !== null
          ? bottom.getBoundingClientRect().height
          : 0;

      setVar('--header-h', `${Math.round(headerH)}px`);
      setVar('--bottomnav-h', `${Math.round(bottomH)}px`);
    };

    // Safe-area: env() can't be read directly; copy via a probe element.
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;' +
      'top:env(safe-area-inset-top);bottom:env(safe-area-inset-bottom);';
    document.body.appendChild(probe);
    const safeTop = parseFloat(getComputedStyle(probe).top) || 0;
    const safeBottom = parseFloat(getComputedStyle(probe).bottom) || 0;
    setVar('--safe-top', `${safeTop}px`);
    setVar('--safe-bottom', `${safeBottom}px`);
    document.body.removeChild(probe);

    measure();

    const ro = new ResizeObserver(measure);
    const header = document.querySelector('[data-app-header="true"]');
    const bottom = document.querySelector('[data-app-bottomnav="true"]');
    if (header) ro.observe(header);
    if (bottom) ro.observe(bottom);
    ro.observe(document.body);

    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    // Re-measure shortly after mount to catch late-loaded fonts / images.
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
}
