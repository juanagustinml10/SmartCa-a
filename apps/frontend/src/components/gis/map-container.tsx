'use client';

import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  ZoomControl,
  CircleMarker,
  Marker,
  Tooltip,
  LayerGroup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useGis } from './gis-context';
import FieldPolygon from './field-polygon';
import AiIndicator from './ai-indicator';
import MeasurementTool from './measurement-tool';
import type { BaseLayerId } from '@/types/gis';
import { WEATHER_CODE_CONFIG } from '@/lib/mock-gis';

const DEFAULT_CENTER: [number, number] = [-26.84, -65.215];
const DEFAULT_ZOOM = 13;

function getTileUrl(layer: BaseLayerId): string {
  switch (layer) {
    case 'satellite':
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    case 'topographic':
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    case 'hybrid':
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    default:
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }
}

function getTileAttribution(layer: BaseLayerId): string {
  switch (layer) {
    case 'satellite':
      return '&copy; Esri, Maxar, Earthstar Geographics';
    case 'topographic':
      return '&copy; OpenTopoMap contributors';
    case 'hybrid':
      return '&copy; Esri, Maxar &copy; OpenStreetMap contributors';
    default:
      return '&copy; OpenStreetMap contributors';
  }
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59A00',
  low: '#3B82F6',
};

const ACTIVITY_COLOR: Record<string, string> = {
  harvest: '#1DB85E',
  fertilization: '#8B5CF6',
  irrigation: '#3B82F6',
  control: '#F97316',
  soil: '#06B6D4',
};

function makeDotIcon(color: string, size = 12): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapLayers() {
  const {
    filteredFeatures,
    selectedFieldId,
    setSelectedFieldId,
    visibleLayers,
    thematicColor,
    colorScale,
    alerts,
    activities,
    iaRecommendations,
    measurementMode,
  } = useGis();

  const handleSelect = useMemo(
    () => (id: string) => {
      if (measurementMode === 'none') setSelectedFieldId(id);
    },
    [measurementMode, setSelectedFieldId],
  );

  const showCentroid = visibleLayers.fields;

  const alertIcons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    for (const severity of Object.keys(SEVERITY_COLOR)) {
      map[severity] = makeDotIcon(SEVERITY_COLOR[severity]);
    }
    return map;
  }, []);

  const activityIcons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    for (const type of Object.keys(ACTIVITY_COLOR)) {
      map[type] = makeDotIcon(ACTIVITY_COLOR[type]);
    }
    return map;
  }, []);

  return (
    <>
      {visibleLayers.fields &&
        filteredFeatures.map((feature) => {
          const p = feature.properties;
          return (
            <FieldPolygon
              key={p.id}
              feature={feature}
              selected={selectedFieldId === p.id}
              color={thematicColor(
                p.healthScore,
                p.estimatedProduction,
                p.costPerHectare,
              )}
              colorScale={colorScale}
              onSelect={handleSelect}
              showCentroid={showCentroid}
            />
          );
        })}

      {visibleLayers.alerts && (
        <LayerGroup>
          {alerts.map((alert) => (
            <Marker
              key={alert.id}
              position={alert.position}
              icon={alertIcons[alert.severity] ?? alertIcons.medium}
              eventHandlers={{ click: () => handleSelect(alert.fieldId) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="map-tooltip">
                <div className="text-[11px] max-w-[200px]">
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-text-tertiary">{alert.description}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {visibleLayers.activities && (
        <LayerGroup>
          {activities.map((activity) => (
            <Marker
              key={activity.id}
              position={activity.position}
              icon={
                activityIcons[activity.type] ??
                makeDotIcon('#94A3B8')
              }
              eventHandlers={{ click: () => handleSelect(activity.fieldId) }}
            >
              <Tooltip direction="top" offset={[0, -8]} className="map-tooltip">
                <div className="text-[11px] max-w-[200px]">
                  <div className="font-semibold">{activity.title}</div>
                  <div className="text-text-tertiary">{activity.date}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {visibleLayers.weather && <WeatherStations />}

      {visibleLayers.fields &&
        iaRecommendations.map((rec) => (
          <AiIndicator
            key={rec.id}
            recommendation={rec}
            features={filteredFeatures}
            onSelect={handleSelect}
          />
        ))}
    </>
  );
}

function WeatherStations() {
  const { weather } = useGis();

  return (
    <LayerGroup>
      {weather.forecast.map((day, i) => {
        const config = WEATHER_CODE_CONFIG[day.code] ?? WEATHER_CODE_CONFIG.clear;
        const position: [number, number] = [
          -26.84 + (i - 2) * 0.015,
          -65.215 - (i - 2) * 0.01,
        ];
        return (
          <CircleMarker
            key={day.time}
            center={position}
            radius={8}
            pathOptions={{
              color: '#FFFFFF',
              weight: 2,
              fillColor: config.color,
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="map-tooltip">
              <div className="text-[11px]">
                <div className="font-semibold">{config.label}</div>
                <div>{day.temperature}°C · Lluvia {day.precipitation} mm</div>
                <div className="text-text-tertiary">
                  Humedad {day.humidity}% · Viento {day.windSpeed} km/h
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </LayerGroup>
  );
}

export default function GisMapContainer() {
  const { baseLayer } = useGis();

  return (
    <LeafletMap
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
      maxZoom={19}
      doubleClickZoom={false}
    >
      <MapBinder />
      <ZoomControl position="bottomright" />
      <TileLayer
        url={getTileUrl(baseLayer)}
        attribution={getTileAttribution(baseLayer)}
        maxZoom={19}
      />
      {baseLayer === 'hybrid' && (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.85}
        />
      )}
      <MapLayers />
      <MeasurementTool />
    </LeafletMap>
  );
}

function MapBinder() {
  const { setMapInstance } = useGis();
  const map = useMap();
  map.whenReady(() => setMapInstance(map));
  return null;
}
