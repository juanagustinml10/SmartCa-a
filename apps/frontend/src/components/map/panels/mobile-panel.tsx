'use client';

import { X, Sprout, ExternalLink } from 'lucide-react';
import type { FieldData } from '@/types/fields';
import { getHealthScoreConfig } from '@/types/fields';

interface MobilePanelProps {
  field: FieldData;
  onClose: () => void;
}

export default function MobilePanel({ field, onClose }: MobilePanelProps) {
  const health = getHealthScoreConfig(field.healthScore);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000]">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative rounded-t-2xl border-t border-border-default bg-bg-surface shadow-xl px-4 pt-3 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sprout className="size-4 text-brand-500" />
            <span className="text-sm font-semibold text-text-primary">{field.name}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-text-tertiary hover:text-text-primary">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div
            className="size-9 rounded-full flex items-center justify-center text-base font-bold"
            style={{ backgroundColor: health.bg, color: health.color.replace('text-', '') }}
          >
            {field.healthScore}
          </div>
          <div className="text-xs text-text-secondary">
            <span className="font-medium text-text-primary">{health.label}</span> · {field.surfaceHa.toFixed(1)} ha · {field.variety}
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={`/campos/${field.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-brand-500 text-white text-xs font-medium"
          >
            <ExternalLink className="size-3.5" />
            Ver detalle
          </a>
        </div>
      </div>
    </div>
  );
}
