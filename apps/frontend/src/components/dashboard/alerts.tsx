"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CloudRain, Sprout, BarChart3, ClipboardList, X, ChevronRight } from "lucide-react";
import { MOCK_ALERTS } from "@/lib/mock-data";
import type { AlertData } from "@/types/dashboard";

const categoryIconMap: Record<string, React.ElementType> = {
  clima: CloudRain,
  cultivo: Sprout,
  monitoreo: BarChart3,
  administrativo: ClipboardList,
};

const priorityConfig: Record<string, { border: string; bg: string; dot: string; label: string }> = {
  critical: { border: "border-l-error-500", bg: "bg-error-50 dark:bg-error-950/20", dot: "bg-error-500", label: "Crítica" },
  high: { border: "border-l-warning-500", bg: "bg-warning-50 dark:bg-warning-950/20", dot: "bg-warning-500", label: "Alta" },
  medium: { border: "border-l-accent-500", bg: "bg-accent-50 dark:bg-accent-950/20", dot: "bg-accent-500", label: "Media" },
  low: { border: "border-l-info-500", bg: "bg-info-50 dark:bg-info-950/20", dot: "bg-info-500", label: "Baja" },
};

function AlertCard({ data, index }: { data: AlertData; index: number }) {
  const [dismissed, setDismissed] = useState(false);
  const Icon = categoryIconMap[data.category] || AlertTriangle;
  const priority = priorityConfig[data.priority] || priorityConfig.low;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={`group relative rounded-lg border border-border-default ${priority.border} ${priority.bg} p-4`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${priority.bg}`}>
              <Icon className={`h-4 w-4 ${priority.dot.replace("bg-", "text-")}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority.dot}`} />
                <p className="text-sm font-medium text-text-primary">{data.title}</p>
                <span className="ml-auto hidden text-[10px] font-medium text-text-tertiary sm:block">
                  {priority.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">{data.description}</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-tertiary opacity-0 transition-opacity hover:bg-bg-subtle hover:text-text-primary group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Alerts() {
  const [showAll, setShowAll] = useState(false);
  const visibleAlerts = showAll ? MOCK_ALERTS : MOCK_ALERTS.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.45 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Alertas Inteligentes</h3>
          <p className="text-xs text-text-tertiary">
            {MOCK_ALERTS.length} alerta{MOCK_ALERTS.length !== 1 ? "s" : ""} activa{MOCK_ALERTS.length !== 1 ? "s" : ""}
          </p>
        </div>
        {MOCK_ALERTS.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
          >
            {showAll ? "Mostrar menos" : "Ver todas"}
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showAll ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visibleAlerts.map((alert, i) => (
          <AlertCard key={alert.id} data={alert} index={i} />
        ))}
        {MOCK_ALERTS.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-tertiary">No hay alertas activas</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
