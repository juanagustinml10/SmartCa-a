'use client';

import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, BarChart3, PieChart, LineChart, RadarIcon, AlertTriangle, Plus, FileText } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { CostKpiCard } from '@/components/costs/cost-kpi-card';
import { CostFilters } from '@/components/costs/cost-filters';
import { CostBarChart } from '@/components/costs/charts/cost-bar-chart';
import { CostLineChart } from '@/components/costs/charts/cost-line-chart';
import { CostAreaChart } from '@/components/costs/charts/cost-area-chart';
import { CostDonutChart } from '@/components/costs/charts/cost-donut-chart';
import { CostRadarChart } from '@/components/costs/charts/cost-radar-chart';
import { CostAnalysisTable } from '@/components/costs/cost-analysis-table';
import { CostAlerts } from '@/components/costs/cost-alerts';
import { CostForm } from '@/components/costs/cost-form';
import { MOCK_COSTS, MOCK_COST_CATEGORIES, MOCK_SUPPLIERS, computeAnalytics, generateAlerts } from '@/lib/mock-costs';
import type { CostFiltersState, CostView } from '@/types/costs';

const VIEWS: { id: CostView; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Panel', icon: BarChart3 },
  { id: 'byCategory', label: 'Por categoría', icon: PieChart },
  { id: 'byField', label: 'Por campo', icon: RadarIcon },
  { id: 'byMonth', label: 'Por mes', icon: LineChart },
  { id: 'byCampaign', label: 'Por campaña', icon: TrendingUp },
];

const DEFAULT_FILTERS: CostFiltersState = {
  search: '', companyId: '', farmId: '', fieldId: '', categoryId: '', supplierId: '',
  campaignId: '', status: '', userId: '', startDate: '', endDate: '',
};

export default function CostosPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [view, setView] = useState<CostView>('dashboard');
  const [filters, setFilters] = useState<CostFiltersState>(DEFAULT_FILTERS);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_COSTS.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.description?.toLowerCase().includes(q) && !c.fieldName?.toLowerCase().includes(q) && !c.supplier?.name.toLowerCase().includes(q)) return false;
      }
      if (filters.categoryId && c.costCategoryId !== filters.categoryId) return false;
      if (filters.campaignId && c.campaignId !== filters.campaignId) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.supplierId && c.supplierId !== filters.supplierId) return false;
      if (filters.fieldId && c.fieldId !== filters.fieldId) return false;
      return true;
    });
  }, [filters]);

  const analytics = useMemo(() => computeAnalytics(filtered), [filtered]);
  const alerts = useMemo(() => generateAlerts(filtered, analytics), [filtered, analytics]);

  const areaData = useMemo(() => analytics.totalByMonth.map((m) => ({ name: `${m.month.substring(0, 3)} ${m.year}`, total: m.total })), [analytics]);
  const radarData = useMemo(() => analytics.totalByCategory.slice(0, 8).map((c) => ({ category: c.categoryName, amount: c.total })), [analytics]);

  const avgCostPerHa = analytics.costPerHectare;
  const estimatedTons = 12458;
  const costPerTon = estimatedTons > 0 ? Math.round((analytics.totalAmount / estimatedTons) * 100) / 100 : 0;
  const estimatedRevenue = 45000000;
  const grossMargin = estimatedRevenue - analytics.totalAmount;
  const grossMarginPct = estimatedRevenue > 0 ? Math.round((grossMargin / estimatedRevenue) * 10000) / 100 : 0;
  const estimatedOtherCosts = analytics.totalAmount * 0.15;
  const netMargin = grossMargin - estimatedOtherCosts;
  const netMarginPct = estimatedRevenue > 0 ? Math.round((netMargin / estimatedRevenue) * 10000) / 100 : 0;

  const renderContent = () => {
    switch (view) {
      case 'byCategory':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Distribución por categoría</h3>
              <CostDonutChart data={analytics.totalByCategory.map((c) => ({ name: c.categoryName, total: c.total, color: MOCK_COST_CATEGORIES.find(cat => cat.id === c.categoryId)?.color }))} height={350} />
            </div>
            <CostAnalysisTable data={analytics.totalByCategory.map((c) => ({ name: c.categoryName, total: c.total, percentage: c.percentage }))} title="Costo por categoría" />
          </div>
        );
      case 'byField':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campo</h3>
              <CostBarChart data={analytics.totalByField.map((f) => ({ name: f.fieldName, total: f.total }))} color="#3B82F6" height={350} />
            </div>
            <CostAnalysisTable data={analytics.totalByField.map((f) => ({ name: f.fieldName, total: f.total, percentage: f.percentage }))} title="Costo por campo" />
          </div>
        );
      case 'byMonth':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Evolución mensual</h3>
              <CostLineChart data={analytics.totalByMonth} height={350} showCumulative />
            </div>
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Área mensual</h3>
              <CostAreaChart data={areaData} height={350} />
            </div>
          </div>
        );
      case 'byCampaign':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campaña</h3>
              <CostBarChart data={analytics.totalByCampaign.map((c) => ({ name: c.campaignName, total: c.total }))} color="#8B5CF6" height={350} />
            </div>
            <CostAnalysisTable data={analytics.totalByCampaign.map((c) => ({ name: c.campaignName, total: c.total, percentage: analytics.totalAmount > 0 ? Math.round((c.total / analytics.totalAmount) * 100) : 0 }))} title="Costo por campaña" />
          </div>
        );
      default:
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <CostKpiCard label="Costo total" value={analytics.totalAmount} color="#10B981" icon={<DollarSign className="size-4" />} />
              <CostKpiCard label="Costo por hectárea" value={avgCostPerHa} color="#3B82F6" icon={<BarChart3 className="size-4" />} />
              <CostKpiCard label="Costo por tonelada" value={costPerTon} color="#F59E0B" icon={<LineChart className="size-4" />} />
              <CostKpiCard label="Costo mensual promedio" value={analytics.averageMonthlyCost} color="#8B5CF6" icon={<TrendingUp className="size-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              <CostKpiCard label="Rentabilidad estimada" value={grossMarginPct} prefix="" suffix="%" decimals={1} trend={grossMarginPct > 20 ? 'up' : 'down'} trendLabel={`Margen bruto ${grossMarginPct}%`} color="#10B981" icon={<TrendingUp className="size-4" />} />
              <CostKpiCard label="Margen bruto" value={grossMargin} color="#14B8A6" icon={<DollarSign className="size-4" />} trend={grossMargin > 0 ? 'up' : 'down'} trendLabel={`${grossMarginPct}% sobre ingresos`} />
              <CostKpiCard label="Margen neto estimado" value={netMargin} color="#6366F1" icon={<DollarSign className="size-4" />} trend={netMargin > 0 ? 'up' : 'down'} trendLabel={`${netMarginPct}% sobre ingresos`} />
              <CostKpiCard label="Costo acumulado" value={analytics.totalAmount} color="#F97316" icon={<FileText className="size-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Distribución por categoría</h3>
                    <CostDonutChart data={analytics.totalByCategory.slice(0, 10).map((c) => ({ name: c.categoryName, total: c.total, color: MOCK_COST_CATEGORIES.find(cat => cat.id === c.categoryId)?.color }))} height={260} innerRadius={50} />
                  </div>
                  <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Evolución mensual</h3>
                    <CostLineChart data={analytics.totalByMonth} height={260} />
                  </div>
                </div>
                <div className="mt-6 bg-bg-surface border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativa por campo</h3>
                  <CostBarChart data={analytics.totalByField.map((f) => ({ name: f.fieldName, total: f.total }))} color="#10B981" height={250} />
                </div>
              </div>
              <div className="space-y-6">
                <CostAnalysisTable data={analytics.totalByCategory.slice(0, 6).map((c) => ({ name: c.categoryName, total: c.total, percentage: c.percentage }))} title="Top categorías" />
                {alerts.length > 0 && (
                  <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="size-4 text-warning-500" />
                      <h3 className="text-sm font-semibold text-text-primary">Alertas</h3>
                      <span className="text-[10px] text-text-tertiary bg-bg-subtle px-1.5 py-0.5 rounded-full">{alerts.length}</span>
                    </div>
                    <CostAlerts alerts={alerts} />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Radar de categorías</h3>
              <CostRadarChart data={radarData} height={280} color="#10B981" />
            </div>
          </>
        );
    }
  };

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
            <DollarSign className="size-5 text-brand-500" />
            <h1 className="text-lg font-semibold text-text-primary">Costos</h1>
            <span className="text-xs text-text-tertiary">{filtered.length} registros</span>
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
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
              <Plus className="size-3.5" />
              Nuevo
            </button>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-border-default shrink-0">
          <CostFilters filters={filters} onChange={setFilters} categories={MOCK_COST_CATEGORIES} />
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </div>
      </div>
      {showForm && (
        <CostForm
          categories={MOCK_COST_CATEGORIES}
          suppliers={MOCK_SUPPLIERS}
          onSubmit={(data) => console.log('New cost:', data)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
