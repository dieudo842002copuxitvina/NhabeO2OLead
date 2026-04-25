import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lightweight CSS-only page transition wrapper.
 * Triggers fade-in on every pathname change, no extra deps.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [key, setKey] = useState(pathname);
  useEffect(() => { setKey(pathname); }, [pathname]);
  return (
    <div key={key} className="animate-fade-in">
      {children}
    </div>
  );
}
