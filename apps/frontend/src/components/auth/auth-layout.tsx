'use client';

import type { ReactNode } from 'react';
import { BrandPanel } from './brand-panel';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-canvas">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
