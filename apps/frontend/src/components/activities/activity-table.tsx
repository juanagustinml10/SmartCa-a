'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { ActivityItem } from '@/types/activities';
import { ACTIVITY_TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/activities';

interface ActivityTableProps {
  activities: ActivityItem[];
  onSelect: (id: string) => void;
}

type SortKey = 'date' | 'title' | 'fieldName' | 'type' | 'responsible' | 'status' | 'priority' | 'estimatedCost';

export default function ActivityTable({ activities, onSelect }: ActivityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 20;

  const sorted = useMemo(() => {
    const arr = [...activities];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'fieldName': cmp = a.fieldName.localeCompare(b.fieldName); break;
        case 'type': cmp = a.type.localeCompare(b.type); break;
        case 'responsible': cmp = a.responsible.localeCompare(b.responsible); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'priority': {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0);
          break;
        }
        case 'estimatedCost': cmp = a.estimatedCost - b.estimatedCost; break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [activities, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData = sorted.slice(page * perPage, (page + 1) * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  };

  function SortIcon({ currentKey }: { currentKey: SortKey }) {
    if (sortKey !== currentKey) return <ChevronsUpDown className="size-3 text-text-tertiary" />;
    return sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />;
  }

  function formatCurrency(n: number) {
    return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  }

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: 'date', label: 'Fecha' },
    { key: 'title', label: 'Actividad' },
    { key: 'fieldName', label: 'Campo' },
    { key: 'type', label: 'Tipo' },
    { key: 'responsible', label: 'Responsable' },
    { key: 'status', label: 'Estado' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'estimatedCost', label: 'Costo', className: 'text-right' },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors ${col.className ?? 'text-left'}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon currentKey={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((act) => {
              const typeCfg = ACTIVITY_TYPE_CONFIG[act.type];
              const statusCfg = STATUS_CONFIG[act.status];
              const priorityCfg = PRIORITY_CONFIG[act.priority];

              return (
                <tr
                  key={act.id}
                  onClick={() => onSelect(act.id)}
                  className="border-b border-border-default hover:bg-bg-subtle transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3 text-xs text-text-secondary whitespace-nowrap">
                    {new Date(act.date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`size-6 rounded-full ${typeCfg.bg} flex items-center justify-center`}>
                        <span className={`text-[10px] ${typeCfg.color}`}>●</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{act.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary whitespace-nowrap">{act.fieldName}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-medium ${typeCfg.color}`}>{typeCfg.name}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary whitespace-nowrap">{act.responsible}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusCfg.color} ${statusCfg.bg}`}>
                      <span className={`size-1 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-medium ${priorityCfg.color}`}>{priorityCfg.label}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary text-right whitespace-nowrap">
                    {formatCurrency(act.estimatedCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-3 border-t border-border-default">
          <span className="text-xs text-text-tertiary">
            {page * perPage + 1}-{Math.min((page + 1) * perPage, sorted.length)} de {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
