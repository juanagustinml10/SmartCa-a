'use client';

import { useEffect } from 'react';
import { useMap, useMapEvents, Polyline, Polygon } from 'react-leaflet';
import { useGis } from './gis-context';
import { haversineMeters, ringAreaHectares } from '@/lib/gis-utils';

export default function MeasurementTool() {
  const map = useMap();
  const {
    measurementMode,
    measurementPoints,
    addMeasurementPoint,
    clearMeasurement,
    setMeasurementMode,
  } = useGis();

  useEffect(() => {
    if (measurementMode === 'none') {
      clearMeasurement();
    }
  }, [measurementMode, clearMeasurement]);

  useEffect(() => {
    if (measurementMode === 'none') return;
    const originalCursor = map.getContainer().style.cursor;
    map.getContainer().style.cursor = 'crosshair';
    return () => {
      map.getContainer().style.cursor = originalCursor;
    };
  }, [measurementMode, map]);

  useMapEvents({
    click(e) {
      if (measurementMode === 'distance' || measurementMode === 'area') {
        addMeasurementPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
    dblclick() {
      if (measurementMode !== 'none') {
        setMeasurementMode('none');
        clearMeasurement();
      }
    },
    keydown() {
      if (measurementMode !== 'none') {
        setMeasurementMode('none');
        clearMeasurement();
      }
    },
  });

  if (measurementMode === 'none' || measurementPoints.length < 2) return null;

  if (measurementMode === 'distance') {
    return (
      <Polyline
        positions={measurementPoints}
        pathOptions={{ color: '#8B5CF6', weight: 3, dashArray: '6 6' }}
      />
    );
  }

  if (measurementMode === 'area') {
    const closed = measurementPoints.length >= 3;
    const positions = closed
      ? [...measurementPoints, measurementPoints[0]]
      : measurementPoints;
    return (
      <Polygon
        positions={positions}
        pathOptions={{
          color: '#3B82F6',
          weight: 3,
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
        }}
      />
    );
  }

  return null;
}

export function useMeasurementResult(): {
  distanceMeters: number;
  areaHectares: number | null;
} {
  const { measurementMode, measurementPoints } = useGis();

  let distanceMeters = 0;
  for (let i = 0; i < measurementPoints.length - 1; i++) {
    distanceMeters += haversineMeters(
      measurementPoints[i][0],
      measurementPoints[i][1],
      measurementPoints[i + 1][0],
      measurementPoints[i + 1][1],
    );
  }

  const areaHectares =
    measurementMode === 'area' && measurementPoints.length >= 3
      ? ringAreaHectares([...measurementPoints, measurementPoints[0]])
      : null;

  return { distanceMeters, areaHectares };
}
