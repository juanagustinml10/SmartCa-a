'use client';

import {
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Ruler,
  Shapes,
  RotateCcw,
} from 'lucide-react';
import { useGis } from './gis-context';
import { useState } from 'react';

const DEFAULT_CENTER: [number, number] = [-26.84, -65.215];
const DEFAULT_ZOOM = 13;

export default function MapToolbar() {
  const { mapInstance: map, measurementMode, setMeasurementMode } = useGis();
  const [locating, setLocating] = useState(false);

  if (!map) return null;

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
    map.once('locationfound', () => setLocating(false));
    map.once('locationerror', () => setLocating(false));
  };

  const handleFullscreen = () => {
    const el = map.getContainer();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  const handleReset = () => {
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.5 });
  };

  const toggleMeasurement = (mode: 'distance' | 'area') => {
    setMeasurementMode(measurementMode === mode ? 'none' : mode);
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm p-1">
      <ToolButton title="Acercar" onClick={() => map.zoomIn()}>
        <Plus className="size-4" />
      </ToolButton>
      <ToolButton title="Alejar" onClick={() => map.zoomOut()}>
        <Minus className="size-4" />
      </ToolButton>
      <div className="h-px bg-border-default my-0.5" />
      <ToolButton title="Mi ubicación" onClick={handleLocate} active={locating}>
        <Crosshair className={`size-4 ${locating ? 'animate-pulse text-brand-500' : ''}`} />
      </ToolButton>
      <ToolButton title="Pantalla completa" onClick={handleFullscreen}>
        <Maximize2 className="size-4" />
      </ToolButton>
      <div className="h-px bg-border-default my-0.5" />
      <ToolButton
        title="Medir distancia"
        onClick={() => toggleMeasurement('distance')}
        active={measurementMode === 'distance'}
      >
        <Ruler className="size-4" />
      </ToolButton>
      <ToolButton
        title="Medir superficie"
        onClick={() => toggleMeasurement('area')}
        active={measurementMode === 'area'}
      >
        <Shapes className="size-4" />
      </ToolButton>
      <div className="h-px bg-border-default my-0.5" />
      <ToolButton title="Restablecer vista" onClick={handleReset}>
        <RotateCcw className="size-4" />
      </ToolButton>
    </div>
  );
}

interface ToolButtonProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}

function ToolButton({ title, onClick, active, children }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center size-8 rounded-lg transition-colors ${
        active
          ? 'bg-brand-500 text-white'
          : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}
