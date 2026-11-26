'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password'];
const GUEST_ONLY = ['/login', '/forgot-password', '/reset-password'];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
    const isGuestOnly = GUEST_ONLY.some((r) => pathname === r || pathname.startsWith(r + '/'));

    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isGuestOnly) {
      router.replace('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) return <LoadingScreen />;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const isGuestOnly = GUEST_ONLY.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (!isAuthenticated && !isPublic) return null;
  if (isAuthenticated && isGuestOnly) return null;

  return <>{children}</>;
}
