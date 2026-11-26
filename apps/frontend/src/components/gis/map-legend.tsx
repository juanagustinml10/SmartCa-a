'use client';

import { useGis } from './gis-context';
import { MOCK_GIS_FEATURES } from '@/lib/mock-gis';

export default function MapLegend() {
  const { colorScale, thematic, visibleLayers, filteredFeatures } = useGis();

  const filteredCount = filteredFeatures.length;
  const totalCount = MOCK_GIS_FEATURES.length;

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm px-3 py-2.5 w-44">
      <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5">
        {thematic === 'production'
          ? 'Producción (t)'
          : thematic === 'costs'
            ? 'Costo por ha ($)'
            : 'SHI · Índice de salud'}
      </div>

      {thematic === 'shi' && (
        <div className="space-y-1">
          {colorScale.map((item) => (
            <div key={`${item.min}-${item.max}`} className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-text-secondary">
                {item.label} ({item.min}-{item.max})
              </span>
            </div>
          ))}
        </div>
      )}

      {thematic !== 'shi' && (
        <div className="space-y-1">
          <GradientBar
            colors={['#EF4444', '#F97316', '#FACC15', '#4ADE80', '#15803D']}
            labels={thematic === 'production' ? ['Bajo', 'Medio', 'Alto'] : ['Alto', 'Medio', 'Bajo']}
          />
        </div>
      )}

      {visibleLayers.alerts && (
        <div className="mt-2 pt-2 border-t border-border-default">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-error-500 shrink-0" />
            <span className="text-[11px] text-text-secondary">Alertas activas</span>
          </div>
        </div>
      )}

      {visibleLayers.activities && (
        <div className="mt-1 pt-2 border-t border-border-default">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-info-500 shrink-0" />
            <span className="text-[11px] text-text-secondary">Actividades</span>
          </div>
        </div>
      )}

      {visibleLayers.weather && (
        <div className="mt-1 pt-2 border-t border-border-default">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent-500 shrink-0" />
            <span className="text-[11px] text-text-secondary">Estaciones clima</span>
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-border-default text-[10px] text-text-tertiary">
        Mostrando {filteredCount} de {totalCount} lotes
      </div>
    </div>
  );
}

function GradientBar({
  colors,
  labels,
}: {
  colors: string[];
  labels: string[];
}) {
  return (
    <div>
      <div
        className="h-2 rounded-sm"
        style={{
          background: `linear-gradient(to right, ${colors.join(', ')})`,
        }}
      />
      <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
