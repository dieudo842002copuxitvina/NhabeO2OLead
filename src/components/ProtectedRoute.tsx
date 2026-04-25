"use client";

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  allowedRoles: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, roles, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/auth?from=${encodeURIComponent(pathname)}`);
      } else {
        const ok = allowedRoles.some((r) => roles.includes(r));
        if (!ok) {
          router.replace('/');
        }
      }
    }
  }, [user, roles, loading, pathname, router, allowedRoles]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ok = allowedRoles.some((r) => roles.includes(r));
  if (!ok) return null;

  return <>{children}</>;
}
