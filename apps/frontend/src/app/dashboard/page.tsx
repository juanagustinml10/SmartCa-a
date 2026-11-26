"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { CostsChart } from "@/components/dashboard/costs-chart";
import { Alerts } from "@/components/dashboard/alerts";
import { AiCenter } from "@/components/dashboard/ai-center";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { ShiWidget } from "@/components/dashboard/shi-widget";
import { MOCK_KPIS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarMobile}
        onMobileClose={() => setSidebarMobile(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
              <p className="text-sm text-text-tertiary">
                Resumen ejecutivo · Campaña 2025/2026
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {MOCK_KPIS.map((kpi, i) => (
                <KpiCard key={kpi.id} data={kpi} index={i} />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MapPlaceholder />
              </div>
              <div className="lg:col-span-1">
                <Alerts />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ProductionChart />
              </div>
              <ShiWidget />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CostsChart />
            </div>

            <div className="mt-6">
              <AiCenter />
            </div>

            <div className="mt-6">
              <ActivityTimeline />
            </div>

            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
