'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, DollarSign, Activity, Calendar, Filter, Search } from 'lucide-react';
import { MOCK_TIMELINE_EVENTS } from '@/lib/mock-executive';
import { useExecutive } from '@/contexts/executive-context';

const eventIcons: Record<string, React.ElementType> = {
  activity: Activity, cost: DollarSign, harvest: Calendar,
  alert: AlertTriangle, event: Calendar, ia_query: Clock,
};

const eventColors: Record<string, string> = {
  activity: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20',
  cost: 'text-warning-500 bg-warning-50 dark:bg-warning-950/20',
  harvest: 'text-accent-500 bg-accent-50 dark:bg-accent-950/20',
  alert: 'text-error-500 bg-error-50 dark:bg-error-950/20',
  event: 'text-info-500 bg-info-50 dark:bg-info-950/20',
  ia_query: 'text-ai-500 bg-ai-50 dark:bg-ai-950/20',
};

const severityColors: Record<string, string> = {
  low: 'border-l-info-500',
  medium: 'border-l-warning-500',
  high: 'border-l-error-500',
  critical: 'border-l-error-600',
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const FILTER_TYPES = [
  { id: null, label: 'Todos' },
  { id: 'activity', label: 'Actividades' },
  { id: 'cost', label: 'Costos' },
  { id: 'harvest', label: 'Cosechas' },
  { id: 'alert', label: 'Alertas' },
  { id: 'ia_query', label: 'IA' },
] as const;

const SEVERITY_FILTERS = [
  { id: null, label: 'Todas' },
  { id: 'critical', label: 'Críticas' },
  { id: 'high', label: 'Altas' },
  { id: 'medium', label: 'Medias' },
] as const;

export function ExecutiveTimeline() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sync } = useExecutive();

  const events = useMemo(() => {
    let list = MOCK_TIMELINE_EVENTS;
    if (typeFilter) list = list.filter((e) => e.type === typeFilter);
    if (severityFilter) list = list.filter((e) => e.severity === severityFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (sync.selectedFieldId) {
      list = list.filter((e) => e.fieldId === sync.selectedFieldId);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
  }, [typeFilter, severityFilter, searchQuery, sync.selectedFieldId]);

  const activeFilters = [typeFilter, severityFilter, sync.selectedFieldId].filter(Boolean).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Clock className="h-3.5 w-3.5 text-text-secondary" />
        <span className="text-xs font-semibold text-text-primary">Timeline</span>
        <div className="relative flex-1 max-w-[140px]">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-6 rounded-md border border-border-default bg-bg-surface pl-6 pr-2 text-[10px] text-text-primary outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-0.5">
          <Filter className="h-3 w-3 text-text-tertiary" />
          {activeFilters > 0 && (
            <span className="text-[9px] font-medium text-brand-500">{activeFilters}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2 shrink-0 flex-wrap">
        {FILTER_TYPES.map((t) => (
          <button
            key={String(t.id)}
            onClick={() => setTypeFilter(t.id)}
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
              typeFilter === t.id ? 'bg-brand-500 text-white' : 'text-text-tertiary hover:text-text-primary hover:bg-bg-subtle'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="text-[9px] text-border-strong mx-1">|</span>
        {SEVERITY_FILTERS.map((s) => (
          <button
            key={String(s.id)}
            onClick={() => setSeverityFilter(s.id)}
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
              severityFilter === s.id ? 'bg-brand-500 text-white' : 'text-text-tertiary hover:text-text-primary hover:bg-bg-subtle'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[10px] text-text-tertiary">No se encontraron eventos</p>
          </div>
        ) : (
          events.map((event, i) => {
            const Icon = eventIcons[event.type] || Calendar;
            const colors = eventColors[event.type] || eventColors.event;
            const severityClass = event.severity ? severityColors[event.severity] || '' : '';
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-start gap-2 rounded-lg p-2 hover:bg-bg-subtle transition-colors cursor-pointer group border-l-2 ${severityClass || 'border-l-transparent'}`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${colors} mt-0.5`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-text-primary leading-snug">{event.title}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 line-clamp-1">{event.description}</p>
                  {event.fieldName && (
                    <span className="text-[9px] text-brand-500 mt-0.5 block">{event.fieldName}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-text-tertiary block">{formatTime(event.timestamp)}</span>
                  {event.amount && (
                    <span className="text-[9px] font-mono text-text-secondary">${event.amount.toLocaleString()}</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
