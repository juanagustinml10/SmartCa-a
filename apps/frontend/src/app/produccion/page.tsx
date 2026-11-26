'use client';

import { useState, useMemo } from 'react';
import { Sprout, TrendingUp, BarChart3, PieChart, LineChart, Combine, Beaker, Droplets } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { HarvestKpiCard } from '@/components/harvests/harvest-kpi-card';
import { HarvestBarChart } from '@/components/harvests/charts/harvest-bar-chart';
import { HarvestLineChart } from '@/components/harvests/charts/harvest-line-chart';
import { HarvestDonutChart } from '@/components/harvests/charts/harvest-donut-chart';
import { HarvestAnalysisTable } from '@/components/harvests/harvest-analysis-table';
import { ShiGauge } from '@/components/harvests/shi-gauge';
import { MOCK_HARVESTS, MOCK_FIELD_SHI, computeHarvestAnalytics } from '@/lib/mock-harvests';
import type { HarvestView, HarvestFiltersState } from '@/types/harvests';

const VIEWS: { id: HarvestView; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Panel', icon: BarChart3 },
  { id: 'byField', label: 'Por campo', icon: PieChart },
  { id: 'byCampaign', label: 'Por campaña', icon: TrendingUp },
  { id: 'byMonth', label: 'Por mes', icon: LineChart },
];

const DEFAULT_FILTERS: HarvestFiltersState = {
  search: '', companyId: '', farmId: '', fieldId: '', campaignId: '', varietyId: '', status: '', startDate: '', endDate: '',
};

export default function ProduccionPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [view, setView] = useState<HarvestView>('dashboard');
  const [filters, setFilters] = useState<HarvestFiltersState>(DEFAULT_FILTERS);
  const filtered = useMemo(() => {
    return MOCK_HARVESTS.filter((h) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!h.fieldName?.toLowerCase().includes(q) && !h.varietyName?.toLowerCase().includes(q) && !h.responsible?.toLowerCase().includes(q)) return false;
      }
      if (filters.fieldId && h.fieldId !== filters.fieldId) return false;
      if (filters.campaignId && h.campaignId !== filters.campaignId) return false;
      if (filters.varietyId && h.varietyId !== filters.varietyId) return false;
      if (filters.status && h.status !== filters.status) return false;
      return true;
    });
  }, [filters]);

  const analytics = useMemo(() => computeHarvestAnalytics(filtered), [filtered]);

  const fieldsWithShi = useMemo(() => {
    return [...MOCK_FIELD_SHI.entries()].map(([fid, shi]) => ({
      fieldId: fid,
      fieldName: MOCK_HARVESTS.find(h => h.fieldId === fid)?.fieldName ?? fid,
      shi,
    })).sort((a, b) => b.shi.score - a.shi.score);
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'byField':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campo</h3>
              <HarvestBarChart data={analytics.totalByField.map((f) => ({ name: f.fieldName, tons: f.tons }))} color="#1DB85E" height={350} />
            </div>
            <HarvestAnalysisTable data={analytics.totalByField.map((f) => ({ name: f.fieldName, tons: f.tons, percentage: f.percentage }))} title="Producción por campo" />
          </div>
        );
      case 'byCampaign':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campaña</h3>
              <HarvestBarChart data={analytics.totalByCampaign.map((c) => ({ name: c.campaignName, tons: c.tons }))} color="#8B5CF6" height={350} />
            </div>
            <HarvestAnalysisTable data={analytics.totalByCampaign.map((c) => ({ name: c.campaignName, tons: c.tons, percentage: analytics.totalTons > 0 ? Math.round((c.tons / analytics.totalTons) * 100) : 0 }))} title="Producción por campaña" />
          </div>
        );
      case 'byMonth':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Evolución mensual</h3>
              <HarvestLineChart data={analytics.totalByMonth.map((m) => ({ name: `${m.month.substring(0, 3)} ${m.year}`, tons: m.tons }))} color="#1DB85E" height={350} />
            </div>
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Distribución mensual</h3>
              <HarvestDonutChart data={analytics.totalByMonth.map((m) => ({ name: `${m.month.substring(0, 3)} ${m.year}`, tons: m.tons }))} height={350} />
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <HarvestKpiCard label="Producción total" value={analytics.totalTons} suffix=" t" color="#1DB85E" icon={<Combine className="size-4" />} />
              <HarvestKpiCard label="Rendimiento promedio" value={analytics.averageTonsPerHectare} suffix=" t/ha" decimals={1} color="#3B82F6" icon={<TrendingUp className="size-4" />} />
              <HarvestKpiCard label="Cosechas registradas" value={analytics.totalHarvests} prefix="" suffix="" decimals={0} color="#F59E0B" icon={<BarChart3 className="size-4" />} />
              <HarvestKpiCard label="Azúcar promedio" value={analytics.averageSucrose} suffix=" %" decimals={1} color="#8B5CF6" icon={<Beaker className="size-4" />} />
            </div>

            {analytics.bestField && analytics.worstField && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HarvestKpiCard label="Mejor campo" value={analytics.bestField.tonsPerHectare} prefix="" suffix=" t/ha" decimals={1} trendLabel={analytics.bestField.fieldName} color="#10B981" icon={<Sprout className="size-4" />} />
                <HarvestKpiCard label="Campo con menor rendimiento" value={analytics.worstField.tonsPerHectare} prefix="" suffix=" t/ha" decimals={1} trendLabel={analytics.worstField.fieldName} color="#EF4444" icon={<Droplets className="size-4" />} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Distribución por campo</h3>
                <HarvestDonutChart data={analytics.totalByField.map((f) => ({ name: f.fieldName, tons: f.tons }))} height={260} />
              </div>
              <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Evolución mensual</h3>
                <HarvestLineChart data={analytics.totalByMonth.map((m) => ({ name: `${m.month.substring(0, 3)} ${m.year}`, tons: m.tons }))} height={260} />
              </div>
              <HarvestAnalysisTable data={analytics.totalByField.slice(0, 6).map((f) => ({ name: f.fieldName, tons: f.tons, percentage: f.percentage }))} title="Top campos" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campaña</h3>
                <HarvestBarChart data={analytics.totalByCampaign.map((c) => ({ name: c.campaignName, tons: c.tons }))} color="#8B5CF6" height={250} />
              </div>
              <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Índice SHI por campo</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fieldsWithShi.slice(0, 6).map((f) => (
                    <div key={f.fieldId} className="flex flex-col items-center p-2 rounded-lg bg-bg-subtle">
                      <span className="text-[10px] text-text-tertiary truncate w-full text-center">{f.fieldName}</span>
                      <ShiGauge result={f.shi} size={80} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  const uniqueFields = useMemo(() => [...new Set(MOCK_HARVESTS.map(h => h.fieldName!))], []);
  const uniqueCampaigns = useMemo(() => [...new Set(MOCK_HARVESTS.map(h => h.campaignName!))], []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarMobile}
        onMobileClose={() => setSidebarMobile(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex items-center justify-between px-6 h-14 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <Combine className="size-5 text-brand-500" />
            <h1 className="text-lg font-semibold text-text-primary">Producción</h1>
            <span className="text-xs text-text-tertiary">{filtered.length} cosechas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-bg-subtle">
              {VIEWS.map((v) => {
                const Icon = v.icon;
                const active = view === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      active ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-border-default shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Buscar campo, variedad..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-8 px-3 rounded-lg bg-bg-subtle border border-border-default text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 w-48"
            />
            <select value={filters.fieldId} onChange={(e) => setFilters({ ...filters, fieldId: e.target.value })} className="h-8 px-2 rounded-lg bg-bg-subtle border border-border-default text-xs text-text-primary focus:outline-none focus:border-brand-500">
              <option value="">Todos los campos</option>
              {uniqueFields.map((f) => (
                <option key={f} value={MOCK_HARVESTS.find(h => h.fieldName === f)?.fieldId}>{f}</option>
              ))}
            </select>
            <select value={filters.campaignId} onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })} className="h-8 px-2 rounded-lg bg-bg-subtle border border-border-default text-xs text-text-primary focus:outline-none focus:border-brand-500">
              <option value="">Todas las campañas</option>
              {uniqueCampaigns.map((c) => (
                <option key={c} value={MOCK_HARVESTS.find(h => h.campaignName === c)?.campaignId}>{c}</option>
              ))}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="h-8 px-2 rounded-lg bg-bg-subtle border border-border-default text-xs text-text-primary focus:outline-none focus:border-brand-500">
              <option value="">Todos los estados</option>
              <option value="completed">Completada</option>
              <option value="in_progress">En progreso</option>
              <option value="planned">Planificada</option>
            </select>
            {(filters.search || filters.fieldId || filters.campaignId || filters.status) && (
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="h-8 px-3 rounded-lg text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle transition-colors">
                Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
