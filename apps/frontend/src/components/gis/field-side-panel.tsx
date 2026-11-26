'use client';

import { motion } from 'framer-motion';
import {
  X,
  Sprout,
  MapPin,
  ExternalLink,
  Activity,
  AlertTriangle,
  Ruler,
  Calendar,
  Droplets,
  Building2,
  DollarSign,
  TrendingUp,
  Bot,
  Flame,
  Layers,
  Crop,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip } from 'recharts';
import { useGis } from './gis-context';
import type { GISFeature } from '@/types/gis';
import { STATUS_CONFIG } from '@/types/fields';
import {
  getColorFromScale,
  getLabelFromScale,
  formatHectares,
  formatMeters,
} from '@/lib/gis-utils';
import { MOCK_FIELDS } from '@/lib/mock-fields';

const IA_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  risk: { label: 'Riesgo', color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-950/20' },
  warning: { label: 'Advertencia', color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/20' },
  opportunity: { label: 'Oportunidad', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/20' },
  insight: { label: 'Insight', color: 'text-ai-500', bg: 'bg-ai-50 dark:bg-ai-950/20' },
};

interface FieldSidePanelProps {
  feature: GISFeature;
  onClose: () => void;
}

export default function FieldSidePanel({ feature, onClose }: FieldSidePanelProps) {
  const { colorScale, iaRecommendations, setSelectedFieldId } = useGis();
  const p = feature.properties;
  const field = MOCK_FIELDS.find((f) => f.id === p.id);
  const health = getColorFromScale(p.healthScore, colorScale);
  const healthLabel = getLabelFromScale(p.healthScore, colorScale);
  const status = STATUS_CONFIG[p.status];
  const fieldIas = iaRecommendations.filter((rec) => rec.fieldId === p.id);

  const chartData = (field?.historicalProduction ?? []).map((h) => ({
    name: h.campaign,
    produccion: h.production,
    rendimiento: h.yield_,
  }));

  const maxCost = Math.max(...(field?.costs.map((c) => c.value) ?? [1]));

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute top-3 right-3 bottom-3 w-[360px] max-w-[calc(100vw-1.5rem)] z-[1200] rounded-xl border border-border-default bg-bg-surface/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sprout className="size-4 text-brand-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate leading-tight">
              {p.name}
            </div>
            <div className="text-[10px] text-text-tertiary truncate">
              {p.alias ?? 'Lote'} · {p.farmName}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-subtle">
          <div
            className="size-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{ backgroundColor: health }}
          >
            {p.healthScore}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary" style={{ color: health }}>
                {healthLabel}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="text-xs text-text-tertiary mt-0.5">SHI · Índice de Salud</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniStat icon={Ruler} label="Superficie" value={formatHectares(p.areaHectares)} />
          <MiniStat icon={Layers} label="Perímetro" value={formatMeters(p.perimeterMeters)} />
          <MiniStat icon={Crop} label="Producción" value={`${p.estimatedProduction.toLocaleString()} t`} />
          <MiniStat icon={DollarSign} label="Costo/ha" value={`$${Math.round(p.costPerHectare).toLocaleString()}`} />
        </div>

        <div className="space-y-1.5">
          <DetailRow icon={Building2} label={p.companyName} />
          <DetailRow icon={MapPin} label={p.farmName} />
          <DetailRow icon={Calendar} label={`${p.variety} · ${p.campaign}`} />
          <DetailRow icon={Droplets} label={`${p.soilType} · Riego: ${p.irrigation}`} />
          <DetailRow icon={Flame} label={`Siembra: ${new Date(p.plantingDate).toLocaleDateString('es-AR')}`} />
        </div>

        {fieldIas.length > 0 && (
          <Section icon={Bot} title="Recomendaciones IA">
            <div className="space-y-2">
              {fieldIas.map((rec) => {
                const config = IA_TYPE_CONFIG[rec.type] ?? IA_TYPE_CONFIG.insight;
                return (
                  <div key={rec.id} className={`p-2.5 rounded-lg ${config.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                        {config.label} IA
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        Confianza {rec.confidence}%
                      </span>
                    </div>
                    <div className="text-xs font-medium text-text-primary mt-1">{rec.title}</div>
                    <p className="text-[11px] text-text-secondary mt-0.5">{rec.description}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section icon={TrendingUp} title="Historial de producción">
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB85E" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#1DB85E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={34} />
                <ReTooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="produccion"
                  stroke="#1DB85E"
                  strokeWidth={2}
                  fill="url(#prodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-[10px] text-text-tertiary">
            Rendimiento actual: {(field?.historicalProduction.at(-1)?.yield_ ?? 0).toFixed(1)} t/ha
          </div>
        </Section>

        {field && field.costs.length > 0 && (
          <Section icon={DollarSign} title="Costos por categoría">
            <div className="space-y-2">
              {field.costs.map((cost) => (
                <div key={cost.category}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-text-secondary">{cost.category}</span>
                    <span className="font-medium text-text-primary">
                      ${cost.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-info-500"
                      style={{ width: `${(cost.value / maxCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section icon={Activity} title="Actividades recientes">
          <div className="space-y-1.5">
            {(field?.activities ?? []).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="size-1.5 rounded-full bg-brand-500/50 shrink-0" />
                <span className="flex-1 truncate">{a.title}</span>
                <span className="text-[10px] text-text-tertiary shrink-0">
                  {new Date(a.date).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))}
            {(field?.activities ?? []).length === 0 && (
              <div className="text-xs text-text-tertiary">Sin actividades registradas</div>
            )}
          </div>
        </Section>

        {(field?.alerts ?? []).length > 0 && (
          <Section icon={AlertTriangle} title="Alertas">
            <div className="space-y-1.5">
              {(field?.alerts ?? []).slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                    a.priority === 'critical'
                      ? 'bg-error-50 text-error-600 dark:bg-error-950/20 dark:text-error-500'
                      : a.priority === 'high'
                        ? 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-500'
                        : 'bg-bg-subtle text-text-secondary'
                  }`}
                >
                  <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/campos/${p.id}`}
            className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            Ver detalle
          </a>
          <button
            onClick={() => {
              setSelectedFieldId(null);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border-default text-xs font-medium text-text-secondary hover:bg-bg-subtle transition-colors"
          >
            <X className="size-3.5" />
            Cerrar
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2.5 rounded-lg border border-border-default">
      <div className="flex items-center gap-1 text-[9px] text-text-tertiary uppercase tracking-wider">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="text-sm font-semibold text-text-primary mt-0.5">{value}</div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <Icon className="size-3.5 text-text-tertiary shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}
