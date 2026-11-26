'use client';

import { useState, type ReactNode } from 'react';
import { ExecutiveProvider } from '@/contexts/executive-context';
import { ExecutiveHeader } from './executive-header';
import { CompactSidebar } from './executive-sidebar';
import { GlobalFilters } from './global-filters';
import { DetailPanel } from './detail-panel';
import { WidgetSettings } from './widget-settings';
import { ExportModal } from './export-modal';
import { useExecutive } from '@/contexts/executive-context';

function ExecutiveShell({ children }: { children: ReactNode }) {
  const { layout } = useExecutive();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  if (layout.fullscreen) {
    return (
      <div className="h-screen w-screen bg-bg-canvas overflow-hidden fixed inset-0 z-50 flex flex-col">
        <ExecutiveHeader />
        <GlobalFilters />
        <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5">
          {children}
        </main>
        <WidgetSettings />
        <ExportModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-canvas">
      <CompactSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <ExecutiveHeader />
        <GlobalFilters />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5">
            {children}
          </main>
          <DetailPanel />
        </div>
      </div>
      <WidgetSettings />
      <ExportModal />
    </div>
  );
}

export function ExecutiveLayout({ children }: { children: ReactNode }) {
  return (
    <ExecutiveProvider>
      <ExecutiveShell>{children}</ExecutiveShell>
    </ExecutiveProvider>
  );
}
