'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { MapFiltersState, SearchResult } from './types';
import { MOCK_GEOJSON } from './mock-geojson';
import { MOCK_FIELDS } from '@/lib/mock-fields';
import { MOCK_VARIETIES, MOCK_CAMPAIGNS } from '@/lib/mock-fields';
import type { FieldStatus } from '@/types/fields';

const MapContainer = dynamic(
  () => import('./map-container'),
  { ssr: false },
);

const FieldSidebar = dynamic(
  () => import('./panels/field-sidebar'),
  { ssr: false },
);

const MobilePanel = dynamic(
  () => import('./panels/mobile-panel'),
  { ssr: false },
);

const MapSearch = dynamic(
  () => import('./controls/map-search'),
  { ssr: false },
);

const MapControls = dynamic(
  () => import('./controls/map-controls'),
  { ssr: false },
);

const LayerSwitcher = dynamic(
  () => import('./controls/layer-switcher'),
  { ssr: false },
);

const MapFilters = dynamic(
  () => import('./controls/map-filters'),
  { ssr: false },
);

const MapLegend = dynamic(
  () => import('./controls/map-legend'),
  { ssr: false },
);

export default function MapView() {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [layer, setLayer] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [filters, setFilters] = useState<MapFiltersState>({
    status: 'all',
    campaign: '',
    variety: '',
    healthRange: [0, 100],
    search: '',
  });

  const allFields = useMemo(() => MOCK_FIELDS, []);
  const geojson = useMemo(() => MOCK_GEOJSON, []);

  const filteredGeojson = useMemo(() => {
    return geojson.filter((f) => {
      if (filters.status !== 'all' && f.properties.status !== filters.status) return false;
      if (filters.campaign && f.properties.campaign !== filters.campaign) return false;
      if (filters.variety && f.properties.variety !== filters.variety) return false;
      if (f.properties.healthScore < filters.healthRange[0] || f.properties.healthScore > filters.healthRange[1]) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!f.properties.name.toLowerCase().includes(q) && !f.properties.farmName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [geojson, filters]);

  const selectedField = useMemo(
    () => allFields.find((f) => f.id === selectedFieldId) ?? null,
    [allFields, selectedFieldId],
  );

  const handleSelectField = useCallback((id: string | null) => {
    setSelectedFieldId(id);
  }, []);

  const handleSearchResult = useCallback((result: SearchResult) => {
    setSelectedFieldId(result.id);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedFieldId(null);
  }, []);

  const uniqueStatuses = useMemo(
    () => [...new Set(allFields.map((f) => f.status))] as FieldStatus[],
    [allFields],
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        geojson={filteredGeojson}
        selectedFieldId={selectedFieldId}
        onSelectField={handleSelectField}
        layer={layer}
      />

      <div className="absolute top-4 left-4 z-[1000] w-72 max-w-[calc(100vw-2rem)]">
        <MapSearch fields={allFields} onSelect={handleSearchResult} />
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <LayerSwitcher current={layer} onChange={setLayer} />
      </div>

      <div className="absolute bottom-24 right-4 z-[1000]">
        <MapControls />
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] hidden md:block">
        <MapLegend />
      </div>

      <div className="absolute top-20 left-4 z-[1000] w-72 max-w-[calc(100vw-2rem)] hidden md:block">
        <MapFilters
          filters={filters}
          onChange={setFilters}
          statuses={uniqueStatuses}
          varieties={MOCK_VARIETIES}
          campaigns={MOCK_CAMPAIGNS}
        />
      </div>

      <div className="absolute top-20 left-4 z-[1000] md:hidden">
        <MapFilters
          filters={filters}
          onChange={setFilters}
          statuses={uniqueStatuses}
          varieties={MOCK_VARIETIES}
          campaigns={MOCK_CAMPAIGNS}
        />
      </div>

      {selectedField && (
        <>
          <div className="hidden lg:block">
            <FieldSidebar field={selectedField} onClose={handleCloseSidebar} />
          </div>
          <div className="lg:hidden">
            <MobilePanel field={selectedField} onClose={handleCloseSidebar} />
          </div>
        </>
      )}
    </div>
  );
}
