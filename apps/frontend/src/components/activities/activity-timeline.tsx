'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, DollarSign, Timer, Sprout, Droplets, FlaskConical, SprayCan, Shield, Cylinder, Wrench, Combine, ClipboardCheck, Radar, Leaf, ClipboardList } from 'lucide-react';
import type { ActivityItem } from '@/types/activities';
import { ACTIVITY_TYPE_CONFIG, STATUS_CONFIG } from '@/types/activities';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  onSelect: (id: string) => void;
}

const ICON_MAP: Record<string, typeof Sprout> = { Sprout, Droplets, FlaskConical, SprayCan, Shield, Cylinder, Wrench, Combine, ClipboardCheck, Radar, Leaf, ClipboardList };

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(dateStr);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((today.getTime() - dateDay.getTime()) / 86400000);

  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff <= 7) return 'Esta semana';
  if (diff <= 30) return 'Este mes';
  return 'Anterior';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function formatCurrency(n: number): string {
  return `$${(n / 1000).toFixed(1)}k`;
}

export default function ActivityTimeline({ activities, onSelect }: ActivityTimelineProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    for (const act of activities) {
      const group = getDateGroup(act.date);
      if (!groups[group]) groups[group] = [];
      groups[group].push(act);
    }
    const order = ['Hoy', 'Ayer', 'Esta semana', 'Este mes', 'Anterior'];
    return order.filter((g) => groups[g]).map((g) => ({ label: g, items: groups[g] }));
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
        <div className="size-12 rounded-full bg-bg-subtle flex items-center justify-center mb-3">
          <Clock className="size-6" />
        </div>
        <p className="text-sm">No hay actividades que coincidan con los filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{group.label}</h3>
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-[10px] text-text-tertiary">{group.items.length} actividades</span>
          </div>

          <div className="space-y-2">
            {group.items.map((act, i) => {
              const typeCfg = ACTIVITY_TYPE_CONFIG[act.type];
              const statusCfg = STATUS_CONFIG[act.status];

              return (
                <motion.button
                  key={act.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  onClick={() => onSelect(act.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-subtle transition-colors">
                    <div className={`size-9 rounded-full ${typeCfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      {(() => { const Icon = ICON_MAP[typeCfg.icon]; return Icon ? <Icon className={`size-4 ${typeCfg.color}`} /> : null; })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">{act.title}</span>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusCfg.color} ${statusCfg.bg}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                        <span>{act.fieldName}</span>
                        <span>{formatDate(act.date)} {act.startTime}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-1.5 text-[10px] text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <User className="size-3" /> {act.responsible}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="size-3" /> {act.duration} min
                        </span>
                        {act.estimatedCost > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3" /> {formatCurrency(act.estimatedCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
