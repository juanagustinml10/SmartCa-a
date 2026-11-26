"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, AlertTriangle, Combine, FlaskConical, Droplets, Sprout, Cylinder, Bot, ChevronRight, AlertCircle, Gauge } from "lucide-react";
import { notFound } from "next/navigation";
import { FieldDetailHeader } from "@/components/campos/field-detail-header";
import { FieldProductionChart } from "@/components/campos/field-production-chart";
import { fetchFieldById } from "@/lib/api-fields";
import { MOCK_FIELDS } from "@/lib/mock-fields";
import { MOCK_HARVESTS, computeFieldShi } from "@/lib/mock-harvests";
import { ShiGauge } from "@/components/harvests/shi-gauge";
import type { FieldData } from "@/types/fields";

const typeIconMap: Record<string, React.ElementType> = {
  harvest: Combine,
  fertilization: FlaskConical,
  irrigation: Droplets,
  control: Sprout,
  soil: Cylinder,
  planting: Sprout,
};

const typeColorMap: Record<string, string> = {
  harvest: "text-accent-600 dark:text-accent-500",
  fertilization: "text-brand-600 dark:text-brand-500",
  irrigation: "text-info-600 dark:text-info-500",
  control: "text-warning-600 dark:text-warning-500",
  soil: "text-text-secondary",
};

const typeBgMap: Record<string, string> = {
  harvest: "bg-accent-50 dark:bg-accent-950/20",
  fertilization: "bg-brand-50 dark:bg-brand-950/20",
  irrigation: "bg-info-50 dark:bg-info-950/20",
  control: "bg-warning-50 dark:bg-warning-950/20",
  soil: "bg-bg-subtle",
};

const priorityConfig: Record<string, { dot: string; bg: string; label: string }> = {
  critical: { dot: "bg-error-500", bg: "bg-error-50 dark:bg-error-950/20", label: "Crítica" },
  high: { dot: "bg-warning-500", bg: "bg-warning-50 dark:bg-warning-950/20", label: "Alta" },
  medium: { dot: "bg-accent-500", bg: "bg-accent-50 dark:bg-accent-950/20", label: "Media" },
  low: { dot: "bg-info-500", bg: "bg-info-50 dark:bg-info-950/20", label: "Baja" },
};

export default function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [field, setField] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchFieldById(id)
      .then((f) => {
        if (!mounted) return;
        if (f) {
          setField(f);
        } else {
          // Try mock as fallback
          const mock = MOCK_FIELDS.find((mf) => mf.id === id);
          if (mock) setField(mock);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        // Fallback to mock
        const mock = MOCK_FIELDS.find((mf) => mf.id === id);
        if (mock) {
          setField(mock);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar el campo");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !field) {
    if (!field && !error) notFound();
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="mb-3 h-10 w-10 text-error-500" />
          <h2 className="text-lg font-medium text-text-primary">Error al cargar el campo</h2>
          <p className="mt-1 text-sm text-text-tertiary">{error}</p>
        </div>
      </div>
    );
  }

  const totalCosts = field.costs.reduce((acc, c) => acc + c.value, 0);
  const fieldShi = computeFieldShi(field.id, MOCK_HARVESTS);
  const fieldHarvests = MOCK_HARVESTS.filter(h => h.fieldId === field.id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <FieldDetailHeader field={field} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FieldProductionChart data={field.historicalProduction} fieldName={field.name} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="overflow-hidden rounded-xl border border-border-default bg-bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-medium text-text-primary">Mapa del Campo</h3>
              </div>
              <span className="text-[10px] text-text-tertiary">Leaflet — Próximamente</span>
            </div>
            <div className="flex h-[200px] items-center justify-center bg-gradient-to-br from-brand-950/5 to-brand-900/10">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-surface shadow-sm ring-1 ring-border-default">
                  <Map className="h-5 w-5 text-brand-500" />
                </div>
                <p className="text-xs font-medium text-text-tertiary">
                  {field.name} · {field.surfaceHa} ha
                </p>
                <p className="text-[10px] text-text-tertiary">
                  {field.location.lat.toFixed(4)}, {field.location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="rounded-xl border border-border-default bg-bg-surface p-5"
          >
            <h3 className="text-sm font-medium text-text-primary">Costos</h3>
            <p className="mb-4 text-xs text-text-tertiary">Total: $ {totalCosts.toLocaleString("es-AR")}</p>
            <div className="space-y-3">
              {field.costs.map((cost, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{cost.category}</span>
                    <span className="font-mono text-sm text-text-primary">
                      $ {cost.value.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-bg-subtle">
                    <div
                      className="h-1.5 rounded-full bg-brand-500"
                      style={{ width: `${(cost.value / totalCosts) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="rounded-xl border border-border-default bg-bg-surface p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="size-4 text-brand-500" />
              <h3 className="text-sm font-medium text-text-primary">Índice SHI</h3>
            </div>
            <ShiGauge result={fieldShi} size={140} showBreakdown />
          </motion.div>

          {fieldHarvests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.14 }}
              className="rounded-xl border border-border-default bg-bg-surface p-5"
            >
              <h3 className="text-sm font-medium text-text-primary mb-3">Cosechas</h3>
              <div className="space-y-2">
                {fieldHarvests.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-text-primary font-medium">{h.tons.toLocaleString()} t</span>
                      <span className="text-text-tertiary ml-1">{h.campaignName}</span>
                    </div>
                    <span className="text-text-tertiary">{new Date(h.startDate).toLocaleDateString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="rounded-xl border border-border-default bg-bg-surface p-5"
          >
            <h3 className="text-sm font-medium text-text-primary">Actividades Recientes</h3>
            <p className="mb-4 text-xs text-text-tertiary">Últimas actividades registradas</p>
            <div className="space-y-3">
              {field.activities.map((act) => {
                const Icon = typeIconMap[act.type] || Sprout;
                const color = typeColorMap[act.type] || "text-text-secondary";
                const bg = typeBgMap[act.type] || "bg-bg-subtle";
                return (
                  <div key={act.id} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary">{act.title}</p>
                      <p className="text-[11px] text-text-tertiary">{act.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {field.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="rounded-xl border border-border-default bg-bg-surface p-5"
            >
              <h3 className="text-sm font-medium text-text-primary">Alertas</h3>
              <p className="mb-4 text-xs text-text-tertiary">{field.alerts.length} alerta{field.alerts.length > 1 ? "s" : ""}</p>
              <div className="space-y-2">
                {field.alerts.map((alert) => {
                  const pConfig = priorityConfig[alert.priority] || priorityConfig.low;
                  return (
                    <div key={alert.id} className={`flex items-start gap-3 rounded-lg ${pConfig.bg} p-3`}>
                      <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${pConfig.dot.replace("bg-", "text-")}`} />
                      <div>
                        <p className="text-sm text-text-primary">{alert.title}</p>
                        <span className={`text-[11px] font-medium ${pConfig.dot.replace("bg-", "text-")}`}>
                          {pConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="rounded-xl border border-ai-200 bg-gradient-to-br from-ai-50 via-bg-surface to-bg-surface p-5 dark:border-ai-950/30 dark:from-ai-950/10"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-ai-500" />
              <h3 className="text-sm font-semibold text-text-primary">Recomendación IA</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Basado en el historial de producción y las condiciones actuales, {field.name} muestra un
              rendimiento {field.healthScore >= 80 ? "superior al promedio del campo." : field.healthScore >= 60 ? "dentro del promedio esperado." : "por debajo del potencial. Se recomienda intervención."}
            </p>
            <button className="mt-3 flex items-center gap-1 text-xs font-medium text-ai-500 hover:text-ai-600 transition-colors">
              Ver análisis completo <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
