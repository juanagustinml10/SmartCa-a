'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useGis } from './gis-context';
import type { MapLayerId } from '@/types/gis';

const LAYERS: { id: MapLayerId; label: string; color: string }[] = [
  { id: 'fields', label: 'Campos', color: '#1DB85E' },
  { id: 'alerts', label: 'Alertas', color: '#EF4444' },
  { id: 'activities', label: 'Actividades', color: '#3B82F6' },
  { id: 'production', label: 'Producción', color: '#F97316' },
  { id: 'costs', label: 'Costos', color: '#EC4899' },
  { id: 'weather', label: 'Clima', color: '#FACC15' },
];

export default function LayerSelector() {
  const { visibleLayers, toggleLayer } = useGis();
  const [open, setOpen] = useState(true);

  return (
    <div className="w-56 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 h-9"
      >
        <span className="text-xs font-medium text-text-secondary">Capas</span>
        <ChevronDown
          className={`size-3.5 text-text-tertiary transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>

      {open && (
        <div className="px-2 pb-2 space-y-0.5">
          {LAYERS.map((layer) => {
            const enabled = visibleLayers[layer.id];
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-bg-subtle transition-colors"
              >
                <span
                  className="size-2.5 rounded-sm shrink-0 transition-opacity"
                  style={{ backgroundColor: layer.color, opacity: enabled ? 1 : 0.25 }}
                />
                <span
                  className={`flex-1 text-left text-xs transition-colors ${
                    enabled ? 'text-text-primary' : 'text-text-tertiary'
                  }`}
                >
                  {layer.label}
                </span>
                <span
                  className={`relative w-7 h-4 rounded-full transition-colors ${
                    enabled ? 'bg-brand-500' : 'bg-bg-subtle'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
