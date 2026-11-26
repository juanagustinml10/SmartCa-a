'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useGis } from './gis-context';
import BaseLayerSwitcher from './base-layer-switcher';
import HealthScaleSettings from './health-scale-settings';
import MapLegend from './map-legend';
import MapFilters from './map-filters';
import LayerSelector from './layer-selector';
import WeatherOverlay from './weather-overlay';
import { useMeasurementResult } from './measurement-tool';
import { formatMeters, formatHectares } from '@/lib/gis-utils';

const GisMapContainer = dynamic(() => import('./map-container'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-canvas">
      <div className="text-sm text-text-tertiary animate-pulse">Cargando mapa GIS...</div>
    </div>
  ),
});

const MapToolbar = dynamic(() => import('./map-toolbar'), { ssr: false });
const FieldSidePanel = dynamic(() => import('./field-side-panel'), { ssr: false });
const MobileFieldPanel = dynamic(() => import('./mobile-field-panel'), { ssr: false });

export default function MapLayout() {
  const { selectedFeature, setSelectedFieldId, measurementMode } = useGis();
  const { distanceMeters, areaHectares } = useMeasurementResult();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <GisMapContainer />

      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 w-64 max-w-[calc(100vw-1.5rem)]">
        <MapFilters />
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <BaseLayerSwitcher />
          <HealthScaleSettings />
        </div>
        <LayerSelector />
        <WeatherOverlay />
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] hidden md:block">
        <MapToolbar />
      </div>

      <div className="absolute bottom-3 right-14 z-[1000] md:hidden">
        <MapToolbar />
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] hidden lg:block">
        <MapLegend />
      </div>

      <AnimatePresence>
        {measurementMode !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[1300] rounded-lg border border-border-default bg-bg-surface/95 backdrop-blur-sm shadow-lg px-4 py-2 flex items-center gap-4"
          >
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              {measurementMode === 'distance' ? 'Distancia' : 'Superficie'}
            </span>
            <span className="text-sm font-semibold text-text-primary">
              {measurementMode === 'distance'
                ? formatMeters(distanceMeters)
                : areaHectares !== null
                  ? formatHectares(areaHectares)
                  : 'Haz clic para agregar vértices'}
            </span>
            <span className="text-[10px] text-text-tertiary">
              Doble clic para terminar
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFeature && (
        <>
          <div className="hidden lg:block">
            <FieldSidePanel
              feature={selectedFeature}
              onClose={() => setSelectedFieldId(null)}
            />
          </div>
          <div className="lg:hidden">
            <MobileFieldPanel
              feature={selectedFeature}
              onClose={() => setSelectedFieldId(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}
