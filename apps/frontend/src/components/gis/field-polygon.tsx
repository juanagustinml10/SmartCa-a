'use client';

import { memo } from 'react';
import { Polygon, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import type { GISFeature, HealthThreshold } from '@/types/gis';
import FieldPopup from './field-popup';
import { getLabelFromScale } from '@/lib/gis-utils';

interface FieldPolygonProps {
  feature: GISFeature;
  selected: boolean;
  color: string;
  colorScale: HealthThreshold[];
  onSelect: (id: string) => void;
  showCentroid: boolean;
}

function FieldPolygonInner({
  feature,
  selected,
  color,
  colorScale,
  onSelect,
  showCentroid,
}: FieldPolygonProps) {
  const p = feature.properties;
  const positions = feature.geometry.coordinates[0].map(
    ([lng, lat]) => [lat, lng] as [number, number],
  );

  return (
    <>
      <Polygon
        positions={positions}
        pathOptions={{
          color: selected ? '#FFFFFF' : color,
          fillColor: color,
          fillOpacity: selected ? 0.45 : 0.3,
          weight: selected ? 2.5 : 1.2,
          opacity: selected ? 1 : 0.8,
        }}
        eventHandlers={{
          click: () => onSelect(p.id),
          mouseover: (e) => e.target.setStyle({ fillOpacity: 0.5, weight: 2.2 }),
          mouseout: (e) =>
            e.target.setStyle({
              fillOpacity: selected ? 0.45 : 0.3,
              weight: selected ? 2.5 : 1.2,
            }),
        }}
      >
        <Tooltip
          sticky
          direction="center"
          className="map-tooltip"
          opacity={0.95}
        >
          <div className="text-xs font-semibold">{p.name}</div>
          <div className="text-[10px] text-text-tertiary">
            {getLabelFromScale(p.healthScore, colorScale)} · {p.healthScore}
          </div>
        </Tooltip>
        <Popup className="gis-popup">
          <FieldPopup
            feature={feature}
            colorScale={colorScale}
            onSelect={onSelect}
          />
        </Popup>
      </Polygon>

      {showCentroid && (
        <CircleMarker
          center={feature.geometry.centroid}
          radius={6}
          pathOptions={{
            color: '#FFFFFF',
            weight: 2,
            fillColor: color,
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]} className="map-tooltip">
            {p.name} · {p.healthScore}
          </Tooltip>
        </CircleMarker>
      )}
    </>
  );
}

const FieldPolygon = memo(FieldPolygonInner, (prev, next) => {
  return (
    prev.feature.properties.id === next.feature.properties.id &&
    prev.selected === next.selected &&
    prev.color === next.color &&
    prev.showCentroid === next.showCentroid
  );
});

export default FieldPolygon;
