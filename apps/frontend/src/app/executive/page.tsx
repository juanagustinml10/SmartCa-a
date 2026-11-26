'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ExecutiveLayout } from '@/components/executive/executive-layout';
import { ExecutiveKpiCard } from '@/components/executive/executive-kpi';
import { IaPanel } from '@/components/executive/ia-panel';
import { ExecutiveTimeline } from '@/components/executive/executive-timeline';
import { ChartGrid } from '@/components/executive/chart-grid';
import { WidgetWrapper } from '@/components/executive/widget-wrapper';
import { MOCK_EXECUTIVE_KPIS } from '@/lib/mock-executive';
import { useExecutive } from '@/contexts/executive-context';
import { Bell, AlertTriangle } from 'lucide-react';
import { MOCK_ALERTS } from '@/lib/mock-data';

const ExecutiveMapWidget = dynamic(
  () => import('@/components/executive/executive-map-widget').then((m) => m.ExecutiveMapWidget),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-xs text-text-tertiary">Cargando mapa...</div> },
);

const priorityColors: Record<string, string> = {
  critical: 'border-l-error-500 bg-error-50/30 dark:bg-error-950/10',
  high: 'border-l-warning-500 bg-warning-50/30 dark:bg-warning-950/10',
  medium: 'border-l-info-500 bg-info-50/30 dark:bg-info-950/10',
  low: 'border-l-text-tertiary',
};

function ExecutiveContent() {
  const { filters, layout } = useExecutive();

  const filteredKpis = useMemo(() => {
    if (!filters.category) return MOCK_EXECUTIVE_KPIS;
    return MOCK_EXECUTIVE_KPIS.filter((k) => k.category === filters.category);
  }, [filters.category]);

  const visibleWidgets = layout.widgets;

  return (
    <div className="space-y-3 md:space-y-4">
      {visibleWidgets.kpis.visible && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
          {filteredKpis.map((kpi, i) => (
            <ExecutiveKpiCard key={kpi.id} kpi={kpi} index={i} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        {visibleWidgets.map.visible && (
          <div className="lg:col-span-2 lg:row-span-2 min-h-[300px] md:min-h-[400px]">
            <WidgetWrapper id="map" title="GIS — Mapa de Campos">
              <div className="h-full min-h-[250px]">
                <ExecutiveMapWidget />
              </div>
            </WidgetWrapper>
          </div>
        )}

        {visibleWidgets.ia.visible && (
          <div className="lg:col-span-1 min-h-[300px] md:min-h-[400px]">
            <WidgetWrapper id="ia" title="Panel IA">
              <IaPanel />
            </WidgetWrapper>
          </div>
        )}

        {visibleWidgets.timeline.visible && (
          <div className="lg:col-span-1 min-h-[300px] md:min-h-[400px]">
            <WidgetWrapper id="timeline" title="Timeline">
              <ExecutiveTimeline />
            </WidgetWrapper>
          </div>
        )}
      </div>

      {visibleWidgets.charts.visible && (
        <WidgetWrapper id="charts" title="Tablero de Gráficos">
          <div className="h-[280px] sm:h-[320px] md:h-[380px]">
            <ChartGrid />
          </div>
        </WidgetWrapper>
      )}

      {visibleWidgets.alerts.visible && (
        <WidgetWrapper id="alerts" title="Alertas">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {MOCK_ALERTS.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-20">
                <p className="text-xs text-text-tertiary">No hay alertas activas</p>
              </div>
            ) : (
              MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 rounded-lg border-l-2 p-2.5 ${priorityColors[alert.priority]}`}
                >
                  <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                    alert.priority === 'critical' ? 'text-error-500' :
                    alert.priority === 'high' ? 'text-warning-500' :
                    'text-text-tertiary'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{alert.description}</p>
                  </div>
                  <Bell className="h-3 w-3 text-text-tertiary shrink-0 mt-0.5" />
                </div>
              ))
            )}
          </div>
        </WidgetWrapper>
      )}
    </div>
  );
}

export default function ExecutivePage() {
  return (
    <ExecutiveLayout>
      <ExecutiveContent />
    </ExecutiveLayout>
  );
}
