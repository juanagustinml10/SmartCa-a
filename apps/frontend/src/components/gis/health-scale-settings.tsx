'use client';

import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { useGis } from './gis-context';
import { DEFAULT_HEALTH_SCALE } from '@/lib/mock-gis';
import type { HealthThreshold } from '@/types/gis';

export default function HealthScaleSettings() {
  const { colorScale, setColorScale, resetColorScale } = useGis();
  const [open, setOpen] = useState(false);

  const update = (index: number, patch: Partial<HealthThreshold>) => {
    const next = colorScale.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    const sorted = [...next].sort((a, b) => b.min - a.min);
    setColorScale(sorted);
  };

  const isCustom =
    JSON.stringify(colorScale) !== JSON.stringify(DEFAULT_HEALTH_SCALE);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Escala de colores"
        className={`flex items-center justify-center size-9 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm transition-colors ${
          open ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Palette className="size-4" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-64 rounded-xl border border-border-default bg-bg-elevated shadow-lg p-3 z-[1000]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              Escala de colores SHI
            </div>
            <button
              onClick={resetColorScale}
              title="Restablecer"
              className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary"
            >
              <RotateCcw className="size-3" />
              {isCustom ? 'Restablecer' : 'Predeterminada'}
            </button>
          </div>

          <div className="space-y-2">
            {colorScale.map((item, i) => (
              <div key={`${item.min}-${item.max}`} className="flex items-center gap-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => update(i, { color: e.target.value })}
                  className="size-7 rounded-md border border-border-default bg-bg-surface cursor-pointer shrink-0"
                  title="Color"
                />
                <span className="text-xs text-text-secondary flex-1">
                  {item.label}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <input
                    type="number"
                    value={item.min}
                    min={0}
                    max={100}
                    onChange={(e) => update(i, { min: Number(e.target.value) })}
                    className="w-10 h-6 px-1 rounded-md border border-border-default bg-bg-surface text-text-primary outline-none"
                  />
                  –
                  <input
                    type="number"
                    value={item.max}
                    min={0}
                    max={100}
                    onChange={(e) => update(i, { max: Number(e.target.value) })}
                    className="w-10 h-6 px-1 rounded-md border border-border-default bg-bg-surface text-text-primary outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
