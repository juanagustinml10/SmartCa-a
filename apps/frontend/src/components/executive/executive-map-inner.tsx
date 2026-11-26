'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { getHealthScoreColor } from '@/components/map/polygon-utils';
import { MOCK_GEOJSON } from '@/components/map/mock-geojson';

const geoJsonFeatures = MOCK_GEOJSON;

interface FieldSummary {
  id: string; name: string; surfaceHa: number; shiScore: number; healthScore: number;
  status: string; estimatedProduction: number; alerts: number;
  location: { lat: number; lng: number };
}

interface Props {
  fields: FieldSummary[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
}

function MapContent({ fields, selectedFieldId, onSelectField }: Props) {
  const featureMap = new Map(geoJsonFeatures.map((f) => [f.properties?.id, f]));

  return (
    <>
      {fields.map((field) => {
        const feature = featureMap.get(field.id);
        if (!feature) return null;
        const sel = field.id === selectedFieldId;
        const color = getHealthScoreColor(field.shiScore);
        return (
          <GeoJSON
            key={field.id}
            data={feature as unknown as GeoJSON.Feature}
            style={{
              color: sel ? '#FFFFFF' : color,
              fillColor: color,
              fillOpacity: sel ? 0.4 : 0.25,
              weight: sel ? 2.5 : 1.5,
              opacity: sel ? 0.9 : 0.7,
            }}
            onEachFeature={(_, layer) => {
              const polygon = layer as L.Polygon;
              polygon.on('click', () => onSelectField(field.id));
              polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: 0.4, weight: 2.5 }));
              polygon.on('mouseout', () => {
                const isSel = field.id === selectedFieldId;
                polygon.setStyle({ fillOpacity: isSel ? 0.4 : 0.25, weight: isSel ? 2.5 : 1.5 });
              });
              polygon.bindTooltip(`${field.name} — SHI: ${field.shiScore}`, { sticky: true, direction: 'center', className: 'map-tooltip' });
            }}
          />
        );
      })}
    </>
  );
}

export default function ExecutiveMapInner({ fields, selectedFieldId, onSelectField }: Props) {
  return (
    <MapContainer center={[-26.84, -65.215]} zoom={13} className="w-full h-full" zoomControl={false} attributionControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; CARTO"
      />
      <MapContent fields={fields} selectedFieldId={selectedFieldId} onSelectField={onSelectField} />
    </MapContainer>
  );
}
