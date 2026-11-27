"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
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
import { api } from "@/lib/api";
import type {
  DashboardOverview,
  DashboardTrend,
  KpiData,
} from "@/types/dashboard";

function trendToKpi(trend: DashboardTrend | null): Pick<KpiData, "trend" | "trendValue"> {
  if (!trend || trend.percent === null) {
    return { trend: "neutral", trendValue: "Sin datos previos" };
  }
  if (trend.percent === 0) return { trend: "neutral", trendValue: "0% vs período anterior" };
  return {
    trend: trend.percent > 0 ? "up" : "down",
    trendValue: `${trend.percent > 0 ? "+" : ""}${trend.percent}% vs período anterior`,
  };
}

function buildKpis(data: DashboardOverview): KpiData[] {
  const { metrics, trends } = data;
  return [
    {
      id: "farms",
      label: "Establecimientos",
      value: metrics.farms,
      unit: "",
      trend: "neutral",
      trendValue: "Registrados",
      icon: "Sprout",
      color: "brand",
      decimals: 0,
    },
    {
      id: "fields",
      label: "Campos",
      value: metrics.fields,
      unit: "",
      trend: "neutral",
      trendValue: `${metrics.farms} establecimientos`,
      icon: "Crop",
      color: "brand",
      decimals: 0,
    },
    {
      id: "area",
      label: "Superficie Total",
      value: metrics.areaHectares,
      unit: "ha",
      trend: "neutral",
      trendValue: "Administrada",
      icon: "Crop",
      color: "info",
      decimals: 1,
    },
    {
      id: "activities",
      label: "Actividades Registradas",
      value: metrics.activities,
      unit: "",
      ...trendToKpi(trends.activities),
      icon: "Clock",
      color: "warning",
      decimals: 0,
    },
    {
      id: "costs",
      label: "Costo Acumulado",
      value: metrics.costsTotal,
      unit: "$",
      ...trendToKpi(trends.costsTotal),
      icon: "Wallet",
      color: "warning",
      decimals: 0,
    },
    {
      id: "production",
      label: "Producción Registrada",
      value: metrics.productionTons,
      unit: "t",
      ...trendToKpi(trends.productionTons),
      icon: "Truck",
      color: "accent",
      decimals: 0,
    },
    {
      id: "alerts",
      label: "Alertas Activas",
      value: metrics.activeAlerts,
      unit: "",
      ...trendToKpi(trends.activeAlerts),
      icon: "Bell",
      color: "error",
      decimals: 0,
    },
    {
      id: "shi",
      label: "Índice SHI",
      value: metrics.averageShi ?? 0,
      unit: "/100",
      trend: "neutral",
      trendValue: metrics.averageShi === null ? "Sin datos" : "Promedio de campos",
      icon: "Gauge",
      color: "brand",
      decimals: 0,
    },
  ];
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : "";
      const response = await api.get<DashboardOverview>(`/dashboard${query}`);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCampaign = data?.campaigns.find((item) => item.id === campaignId);
  const periodLabel = activeCampaign
    ? `Campaña ${activeCampaign.code}`
    : "Todas las campañas registradas";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarMobile}
        onMobileClose={() => setSidebarMobile(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarMobile(true)}
          campaigns={data?.campaigns ?? []}
          campaignId={campaignId}
          onCampaignChange={setCampaignId}
          alertCount={data?.metrics.activeAlerts ?? 0}
          loading={loading}
        />

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
                Resumen ejecutivo · {periodLabel}
              </p>
            </motion.div>

            {loading && !data && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-10 text-center">
                <RefreshCw className="mx-auto size-5 animate-spin text-brand-500" />
                <p className="mt-3 text-sm text-text-secondary">Cargando datos reales…</p>
              </div>
            )}

            {error && (
              <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-error-500/30 bg-error-50 p-5 dark:bg-error-950/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-error-500" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      No se pudo cargar el Dashboard
                    </p>
                    <p className="text-xs text-text-secondary">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => void load()}
                  className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-subtle"
                >
                  Reintentar
                </button>
              </div>
            )}

            {data && (
              <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {buildKpis(data).map((kpi, i) => (
                    <KpiCard key={kpi.id} data={kpi} index={i} />
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <MapPlaceholder
                      fields={data.fields}
                      areaHectares={data.metrics.areaHectares}
                      fieldStatus={data.fieldStatus}
                    />
                  </div>
                  <Alerts alerts={data.alerts} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ProductionChart data={data.productionByCampaign} />
                  </div>
                  <ShiWidget fields={data.fields} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <CostsChart
                    total={data.metrics.costsTotal}
                    costPerHectare={data.metrics.costPerHectare}
                    byCategory={data.costByCategory}
                    byMonth={data.costByMonth}
                  />
                </div>

                <div className="mt-6">
                  <AiCenter />
                </div>

                <div className="mt-6">
                  <ActivityTimeline activities={data.activities} />
                </div>
              </div>
            )}

            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
