import type { GeoJsonPolygon } from './types';
import { generateFieldPolygon } from './polygon-utils';
import { MOCK_FIELDS } from '@/lib/mock-fields';

export const MOCK_GEOJSON: GeoJsonPolygon[] = MOCK_FIELDS.map((field, i) => {
  const coordinates = generateFieldPolygon(
    field.location.lat,
    field.location.lng,
    field.surfaceHa,
    i + 1,
  );

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates,
    },
    properties: {
      id: field.id,
      name: field.name,
      alias: field.alias,
      variety: field.variety,
      campaign: field.campaign,
      status: field.status,
      healthScore: field.healthScore,
      areaHectares: field.surfaceHa,
      estimatedProduction: field.estimatedProduction,
      color: field.color,
      farmName: 'Establecimiento Principal',
      soilType: field.soilType,
      plantingDate: field.plantingDate,
      lastActivity: field.lastActivity,
      lastActivityDate: field.lastActivityDate,
    },
  };
});
