'use client';

import { useState } from 'react';
import { Layers, Map as MapIcon, Satellite, Mountain, Layers3 } from 'lucide-react';
import { useGis } from './gis-context';
import type { BaseLayerId } from '@/types/gis';

interface BaseLayerOption {
  id: BaseLayerId;
  label: string;
  icon: typeof MapIcon;
  swatch: string;
}

const OPTIONS: BaseLayerOption[] = [
  { id: 'osm', label: 'Callejero', icon: MapIcon, swatch: '#A8E6A1' },
  { id: 'satellite', label: 'Satélite', icon: Satellite, swatch: '#2E4B3F' },
  { id: 'topographic', label: 'Topográfico', icon: Mountain, swatch: '#D9C8A9' },
  { id: 'hybrid', label: 'Híbrido', icon: Layers3, swatch: '#A8E6A1' },
];

export default function BaseLayerSwitcher() {
  const { baseLayer, setBaseLayer } = useGis();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Cambiar mapa base"
        className="flex items-center justify-center size-9 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <Layers className="size-4" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-44 rounded-xl border border-border-default bg-bg-elevated shadow-lg p-1 overflow-hidden z-[1000]">
          <div className="px-3 py-1.5 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
            Mapa base
          </div>
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.id === baseLayer;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setBaseLayer(opt.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-500'
                    : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                }`}
              >
                <span
                  className="flex items-center justify-center size-6 rounded-md border border-border-default"
                  style={{ backgroundColor: opt.swatch }}
                >
                  <Icon className="size-3.5" />
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
