'use client';

import 'leaflet/dist/leaflet.css';
import { useCallback } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import type { GeoJsonPolygon } from './types';
import { getHealthScoreColor } from './polygon-utils';

interface MapContainerProps {
  geojson: GeoJsonPolygon[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  layer: 'standard' | 'satellite' | 'terrain';
}

function getTileUrl(layer: string): string {
  switch (layer) {
    case 'satellite':
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    case 'terrain':
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    default:
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  }
}

function getTileAttribution(layer: string): string {
  switch (layer) {
    case 'satellite':
      return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    case 'terrain':
      return '&copy; OpenTopoMap contributors';
    default:
      return '&copy; <a href="https://carto.com/">CARTO</a>';
  }
}

function MapContent({
  geojson,
  selectedFieldId,
  onSelectField,
}: {
  geojson: GeoJsonPolygon[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
}) {
  const map = useMap();

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const polygon = layer as L.Polygon;
      const props = feature.properties as GeoJsonPolygon['properties'];

      polygon.on('click', () => {
        onSelectField(props.id);
        map.flyTo(
          polygon.getBounds().getCenter(),
          Math.max(map.getZoom(), 14),
          { duration: 0.4 },
        );
      });

      polygon.on('mouseover', () => {
        polygon.setStyle({ fillOpacity: 0.4, weight: 2.5 });
      });

      polygon.on('mouseout', () => {
        const sel = props.id === selectedFieldId;
        polygon.setStyle({
          fillOpacity: sel ? 0.35 : 0.25,
          weight: sel ? 2.5 : 1.5,
        });
      });

      polygon.bindTooltip(props.name, {
        sticky: true,
        direction: 'center',
        className: 'map-tooltip',
        offset: [0, 0],
      });
    },
    [map, onSelectField, selectedFieldId],
  );

  return (
    <>
      {geojson.map((feature) => {
        const sel = feature.properties.id === selectedFieldId;
        const score = feature.properties.healthScore;
        const fillColor = getHealthScoreColor(score);

        return (
          <GeoJSON
            key={feature.properties.id}
            data={feature as unknown as GeoJSON.Feature}
            style={{
              color: sel ? '#FFFFFF' : fillColor,
              fillColor,
              fillOpacity: sel ? 0.35 : 0.25,
              weight: sel ? 2.5 : 1.5,
              opacity: sel ? 0.9 : 0.7,
            }}
            onEachFeature={onEachFeature}
          />
        );
      })}
    </>
  );
}

export default function MapContainerComponent({
  geojson,
  selectedFieldId,
  onSelectField,
  layer,
}: MapContainerProps) {
  return (
    <LeafletMap
      center={[-26.84, -65.215]}
      zoom={13}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer url={getTileUrl(layer)} attribution={getTileAttribution(layer)} />
      <MapContent
        geojson={geojson}
        selectedFieldId={selectedFieldId}
        onSelectField={onSelectField}
      />
    </LeafletMap>
  );
}
