'use client';

import { useMap } from 'react-leaflet';
import { Plus, Minus, Crosshair, Maximize2 } from 'lucide-react';

function ControlsInner() {
  const map = useMap();

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="flex items-center justify-center size-9 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
      >
        <Plus className="size-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex items-center justify-center size-9 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
      >
        <Minus className="size-4" />
      </button>
      <button
        onClick={() => map.setView([-26.84, -65.215], 13, { animate: true, duration: 0.5 })}
        className="flex items-center justify-center size-9 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
      >
        <Crosshair className="size-4" />
      </button>
      <button
        onClick={() => map.getContainer().requestFullscreen?.()}
        className="flex items-center justify-center size-9 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
      >
        <Maximize2 className="size-4" />
      </button>
    </div>
  );
}

export default function MapControls() {
  return <ControlsInner />;
}
