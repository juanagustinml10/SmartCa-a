'use client';

import { motion } from 'framer-motion';
import { X, Sprout, ExternalLink, Bot } from 'lucide-react';
import { useGis } from './gis-context';
import type { GISFeature } from '@/types/gis';
import { getColorFromScale, getLabelFromScale, formatHectares } from '@/lib/gis-utils';
import { STATUS_CONFIG } from '@/types/fields';

interface MobileFieldPanelProps {
  feature: GISFeature;
  onClose: () => void;
}

export default function MobileFieldPanel({ feature, onClose }: MobileFieldPanelProps) {
  const { colorScale, iaRecommendations } = useGis();
  const p = feature.properties;
  const status = STATUS_CONFIG[p.status];
  const health = getColorFromScale(p.healthScore, colorScale);
  const healthLabel = getLabelFromScale(p.healthScore, colorScale);
  const fieldIas = iaRecommendations.filter((rec) => rec.fieldId === p.id);

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-x-0 bottom-0 z-[2000]"
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative rounded-t-2xl border-t border-border-default bg-bg-surface shadow-xl px-4 pt-3 pb-6 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sprout className="size-4 text-brand-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary truncate">{p.name}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="size-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ backgroundColor: health }}
          >
            {p.healthScore}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-primary" style={{ color: health }}>
                {healthLabel}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              {formatHectares(p.areaHectares)} · {p.variety} · {p.estimatedProduction.toLocaleString()} t
            </div>
          </div>
        </div>

        {fieldIas.length > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-ai-50 dark:bg-ai-950/20">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ai-500 uppercase tracking-wider mb-1">
              <Bot className="size-3.5" />
              Recomendaciones IA
            </div>
            {fieldIas.slice(0, 2).map((rec) => (
              <div key={rec.id} className="text-[11px] text-text-secondary">
                {rec.title} · Confianza {rec.confidence}%
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <a
            href={`/campos/${p.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-brand-500 text-white text-xs font-medium"
          >
            <ExternalLink className="size-3.5" />
            Ver detalle
          </a>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center h-9 rounded-lg border border-border-default text-xs font-medium text-text-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
