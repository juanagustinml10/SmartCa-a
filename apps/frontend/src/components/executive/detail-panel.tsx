'use client';

import { X, MapPin, Ruler, AlertTriangle, Activity, Gauge, DollarSign } from 'lucide-react';
import { useExecutive } from '@/contexts/executive-context';
import { MOCK_FIELD_DETAIL } from '@/lib/mock-executive';
import { ShiGauge } from '@/components/harvests/shi-gauge';
import { MOCK_FIELD_SHI } from '@/lib/mock-harvests';

const statusColors: Record<string, string> = {
  active: 'text-success-500 bg-success-50 dark:bg-success-950/20',
  inactive: 'text-text-tertiary bg-bg-subtle',
  harvesting: 'text-accent-500 bg-accent-50 dark:bg-accent-950/20',
  resting: 'text-info-500 bg-info-50 dark:bg-info-950/20',
};

export function DetailPanel() {
  const { layout, closeDetailPanel, sync } = useExecutive();
  if (!layout.detailPanel || !sync.selectedFieldId) return null;

  const field = MOCK_FIELD_DETAIL.find((f) => f.id === sync.selectedFieldId);
  if (!field) return null;

  const shiResult = MOCK_FIELD_SHI.get(field.id);

  return (
    <div
      className="shrink-0 border-l border-border-default bg-bg-surface overflow-y-auto transition-all duration-200"
      style={{ width: layout.detailPanelWidth }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg-surface border-b border-border-default px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{field.name}</h2>
          <p className="text-[10px] text-text-tertiary">{field.alias}</p>
        </div>
        <button
          onClick={closeDetailPanel}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center">
          {shiResult && <ShiGauge result={shiResult} size={120} />}
        </div>

        <div className="space-y-2">
          <InfoRow icon={MapPin} label="Ubicación" value={`${field.location.lat.toFixed(4)}, ${field.location.lng.toFixed(4)}`} />
          <InfoRow icon={Ruler} label="Superficie" value={`${field.surfaceHa} ha`} />
          <InfoRow icon={Gauge} label="Health Score" value={`${field.healthScore}/100`} />
          <InfoRow icon={Activity} label="Estado" value={field.status} valueClassName={statusColors[field.status]?.split(' ')[0]} />
          <InfoRow icon={AlertTriangle} label="Alertas" value={`${field.alerts} activas`} />
          <InfoRow icon={DollarSign} label="Prod. Estimada" value={`${field.estimatedProduction.toLocaleString()} t`} />
        </div>

        {shiResult && (
          <div>
            <p className="text-[10px] font-semibold text-text-secondary mb-2 uppercase tracking-wider">Desglose SHI</p>
            <div className="space-y-1.5">
              {Object.entries(shiResult.breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-20 capitalize">{key}</span>
                  <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, backgroundColor: val >= 80 ? '#10B981' : val >= 60 ? '#3B82F6' : val >= 40 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <span className="text-[10px] font-medium text-text-primary w-6 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType; label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-text-tertiary shrink-0" />
      <span className="text-[10px] text-text-tertiary">{label}</span>
      <span className={`text-xs font-medium text-text-primary ml-auto ${valueClassName ?? ''}`}>{value}</span>
    </div>
  );
}
