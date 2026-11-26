'use client';

import { motion } from 'framer-motion';
import { X, Sprout, MapPin, ExternalLink, Activity, AlertTriangle, Ruler, Calendar, Droplets } from 'lucide-react';
import type { FieldData } from '@/types/fields';
import { getHealthScoreConfig } from '@/types/fields';

interface FieldSidebarProps {
  field: FieldData;
  onClose: () => void;
}

export default function FieldSidebar({ field, onClose }: FieldSidebarProps) {
  const health = getHealthScoreConfig(field.healthScore);

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute top-4 right-4 bottom-4 w-80 z-[1000] rounded-xl border border-border-default bg-bg-surface/95 backdrop-blur-md shadow-xl flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sprout className="size-4 text-brand-500 shrink-0" />
          <span className="text-sm font-semibold text-text-primary truncate">{field.name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-subtle">
          <div
            className="size-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: health.bg, color: health.color.replace('text-', '') }}
          >
            {field.healthScore}
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{health.label}</div>
            <div className="text-xs text-text-tertiary">Health Score</div>
          </div>
        </div>

        <div className="space-y-2">
          <DetailRow icon={MapPin} label={field.alias ?? 'Sin lote'} />
          <DetailRow icon={Ruler} label={`${field.surfaceHa.toFixed(1)} ha`} />
          <DetailRow icon={Calendar} label={`${field.variety} · ${field.campaign}`} />
          <DetailRow icon={Droplets} label={field.soilType} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg border border-border-default">
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Producción</div>
            <div className="text-sm font-semibold text-text-primary mt-0.5">
              {field.estimatedProduction.toLocaleString()} t
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-border-default">
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Siembra</div>
            <div className="text-sm font-semibold text-text-primary mt-0.5">
              {new Date(field.plantingDate).toLocaleDateString('es-AR')}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
            <Activity className="size-3.5" />
            Últimas actividades
          </div>
          <div className="space-y-1.5">
            {field.activities.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="size-1.5 rounded-full bg-brand-500/50 shrink-0" />
                <span className="truncate">{a.title}</span>
              </div>
            ))}
          </div>
        </div>

        {field.alerts.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
              <AlertTriangle className="size-3.5" />
              Alertas
            </div>
            <div className="space-y-1.5">
              {field.alerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                    a.priority === 'critical'
                      ? 'bg-error-50 text-error-600 dark:bg-error-950/20 dark:text-error-500'
                      : a.priority === 'high'
                        ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-500'
                        : 'bg-bg-subtle text-text-secondary'
                  }`}
                >
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border-default shrink-0">
        <a
          href={`/campos/${field.id}`}
          className="flex items-center justify-center gap-2 h-9 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <ExternalLink className="size-4" />
          Ver detalle completo
        </a>
      </div>
    </motion.aside>
  );
}

function DetailRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <Icon className="size-4 text-text-tertiary shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
