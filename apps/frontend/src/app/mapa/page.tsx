'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { GisProvider } from '@/components/gis/gis-context';

const MapLayout = dynamic(() => import('@/components/gis/map-layout'), {
  ssr: false,
});

export default function MapaPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  return (
    <GisProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={sidebarMobile}
          onMobileClose={() => setSidebarMobile(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarMobile(true)} />

          <main className="flex-1 relative overflow-hidden">
            <MapLayout />
          </main>
        </div>
      </div>
    </GisProvider>
  );
}
