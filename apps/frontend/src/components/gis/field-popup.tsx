'use client';

import type { GISFeature } from '@/types/gis';
import { STATUS_CONFIG } from '@/types/fields';
import {
  getColorFromScale,
  getLabelFromScale,
  formatHectares,
  formatMeters,
} from '@/lib/gis-utils';
import type { HealthThreshold } from '@/types/gis';

interface FieldPopupProps {
  feature: GISFeature;
  colorScale: HealthThreshold[];
  onSelect: (id: string) => void;
}

export default function FieldPopup({
  feature,
  colorScale,
  onSelect,
}: FieldPopupProps) {
  const p = feature.properties;
  const color = getColorFromScale(p.healthScore, colorScale);
  const label = getLabelFromScale(p.healthScore, colorScale);
  const status = STATUS_CONFIG[p.status];

  return (
    <div className="min-w-[220px] font-sans">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">
            {p.name}
          </div>
          <div className="text-[11px] text-text-tertiary">
            {p.alias ?? 'Lote'} · {p.variety}
          </div>
        </div>
        <div
          className="flex items-center justify-center size-8 rounded-full text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {p.healthScore}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <Metric label="Área" value={formatHectares(p.areaHectares)} />
        <Metric label="Perím." value={formatMeters(p.perimeterMeters)} />
        <Metric label="Prod." value={`${p.estimatedProduction.toLocaleString()} t`} />
      </div>

      <button
        onClick={() => onSelect(p.id)}
        className="mt-2.5 w-full h-7 rounded-md bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors"
      >
        Ver detalle completo
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-subtle px-1.5 py-1">
      <div className="text-[9px] text-text-tertiary uppercase tracking-wider">{label}</div>
      <div className="text-[11px] font-semibold text-text-primary truncate">{value}</div>
    </div>
  );
}
