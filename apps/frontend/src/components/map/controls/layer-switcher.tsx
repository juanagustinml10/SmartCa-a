'use client';

import { Layers, Map as MapIcon, Satellite, Mountain } from 'lucide-react';
import { useState } from 'react';

interface LayerSwitcherProps {
  current: 'standard' | 'satellite' | 'terrain';
  onChange: (layer: 'standard' | 'satellite' | 'terrain') => void;
}

const LAYERS: { id: 'standard' | 'satellite' | 'terrain'; label: string; icon: typeof MapIcon }[] = [
  { id: 'standard', label: 'Estándar', icon: MapIcon },
  { id: 'satellite', label: 'Satelital', icon: Satellite },
  { id: 'terrain', label: 'Relieve', icon: Mountain },
];

export default function LayerSwitcher({ current, onChange }: LayerSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center size-9 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <Layers className="size-4" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-36 rounded-lg border border-border-default bg-bg-elevated shadow-lg overflow-hidden">
          {LAYERS.map((l) => {
            const Icon = l.icon;
            const isActive = l.id === current;
            return (
              <button
                key={l.id}
                onClick={() => {
                  onChange(l.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-500'
                    : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                }`}
              >
                <Icon className="size-4" />
                {l.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
