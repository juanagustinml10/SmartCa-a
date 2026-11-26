'use client';

import { memo } from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import type { GISIARecommendation, GISFeature } from '@/types/gis';

const TYPE_COLOR: Record<GISIARecommendation['type'], string> = {
  risk: '#EF4444',
  warning: '#F59A00',
  opportunity: '#1DB85E',
  insight: '#8B5CF6',
};

const TYPE_LABEL: Record<GISIARecommendation['type'], string> = {
  risk: 'Riesgo',
  warning: 'Advertencia',
  opportunity: 'Oportunidad',
  insight: 'Insight',
};

interface AiIndicatorProps {
  recommendation: GISIARecommendation;
  features: GISFeature[];
  onSelect: (id: string) => void;
}

function AiIndicatorInner({
  recommendation,
  features,
  onSelect,
}: AiIndicatorProps) {
  const feature = features.find(
    (f) => f.properties.id === recommendation.fieldId,
  );
  if (!feature) return null;

  const color = TYPE_COLOR[recommendation.type];

  const icon = L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.35;animation:gis-ping 1.6s cubic-bezier(0,0,.2,1) infinite;"></span>
        <span style="position:absolute;inset:4px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></span>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  return (
    <Marker
      position={feature.geometry.centroid}
      icon={icon}
      eventHandlers={{ click: () => onSelect(feature.properties.id) }}
    >
      <Tooltip direction="top" offset={[0, -14]} className="map-tooltip">
        <div className="text-[11px]">
          <span className="font-semibold" style={{ color }}>
            {TYPE_LABEL[recommendation.type]} IA
          </span>{' '}
          · {feature.properties.name}
        </div>
        <div className="text-[10px] text-text-tertiary">
          Confianza {recommendation.confidence}%
        </div>
      </Tooltip>
    </Marker>
  );
}

const AiIndicator = memo(AiIndicatorInner, (prev, next) => {
  return (
    prev.recommendation.id === next.recommendation.id &&
    prev.recommendation.fieldId === next.recommendation.fieldId
  );
});

export default AiIndicator;
