import { useEffect, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/** Animates from 0 → value with easeOutCubic. */
export default function AnimatedCounter({ value, duration = 1400, format, className }: Props) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format ? format(n) : Math.round(n).toLocaleString('vi-VN')}</span>;
}
