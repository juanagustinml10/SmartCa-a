'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import {
  Search, Download, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Filter, X,
} from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-audit';
import type { AuditAction, AuditEntity } from '@/types/audit';

const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  export: 'Exportación',
  error: 'Error',
  token_refresh: 'Refresco de token',
};

const ACTION_COLORS: Record<AuditAction, string> = {
  login: 'bg-success-50 text-success-500',
  logout: 'bg-bg-subtle text-text-secondary',
  create: 'bg-info-50 text-info-500',
  update: 'bg-brand-50 text-brand-600',
  delete: 'bg-error-50 text-error-500',
  export: 'bg-ai-50 text-ai-500',
  error: 'bg-error-50 text-error-500',
  token_refresh: 'bg-warning-50 text-warning-500',
};

const ENTITY_LABELS: Record<AuditEntity, string> = {
  User: 'Usuario',
  Company: 'Empresa',
  Field: 'Campo',
  Cost: 'Costo',
  Harvest: 'Cosecha',
  Activity: 'Actividad',
  Role: 'Rol',
  Session: 'Sesión',
  Permission: 'Permiso',
};

type SortField = 'createdAt' | 'userName' | 'action' | 'entity' | 'entityId' | 'ipAddress';
type SortDir = 'asc' | 'desc';
const ITEMS_PER_PAGE = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [entityFilter, setEntityFilter] = useState<AuditEntity | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [actionOpen, setActionOpen] = useState(false);
  const [entityOpen, setEntityOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...MOCK_AUDIT_LOGS];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.userName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.entityId.toLowerCase().includes(q) ||
          e.ipAddress.toLowerCase().includes(q) ||
          ACTION_LABELS[e.action].toLowerCase().includes(q) ||
          ENTITY_LABELS[e.entity].toLowerCase().includes(q),
      );
    }
    if (actionFilter) result = result.filter((e) => e.action === actionFilter);
    if (entityFilter) result = result.filter((e) => e.entity === entityFilter);
    if (dateFrom) result = result.filter((e) => e.createdAt >= dateFrom);
    if (dateTo) result = result.filter((e) => e.createdAt <= dateTo + 'T23:59:59');
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [search, actionFilter, entityFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  }

  function clearFilters() {
    setSearch(''); setActionFilter(''); setEntityFilter('');
    setDateFrom(''); setDateTo(''); setPage(1);
  }

  const hasFilters = search || actionFilter || entityFilter || dateFrom || dateTo;

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 text-text-tertiary" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-brand-500" />
      : <ChevronDown className="h-3 w-3 text-brand-500" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={sidebarMobile} onMobileClose={() => setSidebarMobile(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Auditoría</h1>
                <p className="text-sm text-text-secondary">Registro de todas las acciones del sistema</p>
              </div>
              <button disabled className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary opacity-60 cursor-not-allowed">
                <Download className="h-4 w-4" />
                Exportar
                <span className="ml-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-600">Próximamente</span>
              </button>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input type="text" placeholder="Buscar por usuario, acción, entidad, IP..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="h-10 w-full rounded-lg border border-border-default bg-bg-subtle pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30" />
                </div>

                <div className="relative">
                  <button onClick={() => { setActionOpen(!actionOpen); setEntityOpen(false); }}
                    className="flex h-10 items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-secondary hover:bg-bg-subtle transition-colors">
                    <Filter className="h-4 w-4" />
                    {actionFilter ? ACTION_LABELS[actionFilter] : 'Acción'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <AnimatePresence>
                    {actionOpen && (
                      <motion.div initial={{ opacity: 0, y: -4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }} transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full z-10 mt-1 w-52 rounded-lg border border-border-default bg-bg-elevated p-1 shadow-lg">
                        <button onClick={() => { setActionFilter(''); setActionOpen(false); setPage(1); }}
                          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${!actionFilter ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'}`}>Todas</button>
                        {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
                          <button key={a} onClick={() => { setActionFilter(a); setActionOpen(false); setPage(1); }}
                            className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${actionFilter === a ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'}`}>{ACTION_LABELS[a]}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button onClick={() => { setEntityOpen(!entityOpen); setActionOpen(false); }}
                    className="flex h-10 items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-secondary hover:bg-bg-subtle transition-colors">
                    <Filter className="h-4 w-4" />
                    {entityFilter ? ENTITY_LABELS[entityFilter] : 'Entidad'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <AnimatePresence>
                    {entityOpen && (
                      <motion.div initial={{ opacity: 0, y: -4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }} transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-border-default bg-bg-elevated p-1 shadow-lg">
                        <button onClick={() => { setEntityFilter(''); setEntityOpen(false); setPage(1); }}
                          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${!entityFilter ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'}`}>Todas</button>
                        {(Object.keys(ENTITY_LABELS) as AuditEntity[]).map((ent) => (
                          <button key={ent} onClick={() => { setEntityFilter(ent); setEntityOpen(false); setPage(1); }}
                            className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${entityFilter === ent ? 'bg-brand-50 text-brand-600' : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'}`}>{ENTITY_LABELS[ent]}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-text-secondary whitespace-nowrap">Desde</label>
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="h-9 rounded-lg border border-border-default bg-bg-subtle px-3 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-text-secondary whitespace-nowrap">Hasta</label>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="h-9 rounded-lg border border-border-default bg-bg-subtle px-3 text-sm text-text-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30" />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </button>
                )}
                <span className="ml-auto text-xs text-text-tertiary">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-default bg-bg-subtle/50">
                      {[
                        { field: 'createdAt' as SortField, label: 'Fecha' },
                        { field: 'userName' as SortField, label: 'Usuario' },
                        { field: 'action' as SortField, label: 'Acción' },
                        { field: 'entity' as SortField, label: 'Entidad' },
                        { field: 'entityId' as SortField, label: 'ID Entidad' },
                        { field: 'ipAddress' as SortField, label: 'IP' },
                      ].map(({ field, label }) => (
                        <th key={field} className="px-4 py-3 text-left">
                          <button onClick={() => handleSort(field)} className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors">
                            {label} <SortIcon field={field} />
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((entry, i) => (
                      <motion.tr key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="border-b border-border-default last:border-0 hover:bg-bg-subtle/30 transition-colors">
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                        <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{entry.userName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_COLORS[entry.action]}`}>{ACTION_LABELS[entry.action]}</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{ENTITY_LABELS[entry.entity]}</td>
                        <td className="px-4 py-3 font-mono text-xs text-text-tertiary whitespace-nowrap">{entry.entityId}</td>
                        <td className="px-4 py-3 font-mono text-xs text-text-secondary whitespace-nowrap">{entry.ipAddress}</td>
                        <td className="px-4 py-3 text-text-secondary max-w-xs truncate">{entry.description}</td>
                      </motion.tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-text-tertiary">No se encontraron registros con los filtros aplicados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
                  <span className="text-xs text-text-tertiary">Página {page} de {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'text-text-secondary hover:bg-bg-subtle'}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
