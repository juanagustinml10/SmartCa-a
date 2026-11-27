"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Combine,
  FlaskConical,
  Droplets,
  Sprout,
  Cylinder,
  Bot,
  ChevronRight,
} from "lucide-react";
import type { DashboardActivity } from "@/types/dashboard";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  harvest: { icon: Combine, color: "text-accent-600 dark:text-accent-500", bg: "bg-accent-50 dark:bg-accent-950/20" },
  cosecha: { icon: Combine, color: "text-accent-600 dark:text-accent-500", bg: "bg-accent-50 dark:bg-accent-950/20" },
  fertilization: { icon: FlaskConical, color: "text-brand-600 dark:text-brand-500", bg: "bg-brand-50 dark:bg-brand-950/20" },
  irrigation: { icon: Droplets, color: "text-info-600 dark:text-info-500", bg: "bg-info-50 dark:bg-info-950/20" },
  control: { icon: Sprout, color: "text-warning-600 dark:text-warning-500", bg: "bg-warning-50 dark:bg-warning-950/20" },
  soil: { icon: Cylinder, color: "text-text-secondary", bg: "bg-bg-subtle" },
  planting: { icon: Sprout, color: "text-success-600 dark:text-success-500", bg: "bg-success-50 dark:bg-success-950/20" },
  report: { icon: ChevronRight, color: "text-info-600 dark:text-info-500", bg: "bg-info-50 dark:bg-info-950/20" },
  ai: { icon: Bot, color: "text-ai-600 dark:text-ai-500", bg: "bg-ai-50 dark:bg-ai-950/20" },
};

function formatTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMs < 0) return date.toLocaleDateString("es-AR");
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  const days = Math.floor(diffHrs / 24);
  return `Hace ${days} día${days > 1 ? "s" : ""}`;
}

export function ActivityTimeline({ activities }: { activities: DashboardActivity[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.55 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Actividad Reciente</h3>
          <p className="text-xs text-text-tertiary">Últimas actividades registradas</p>
        </div>
        <Link href="/actividades" className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
          Ver todas
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-text-tertiary">No hay actividades registradas para el período</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 h-full w-px bg-border-default" />

          <div className="space-y-0">
            {activities.map((activity, i) => {
              const config = typeConfig[activity.type] ?? typeConfig.report;
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="group relative flex gap-4 pb-5 pl-0"
                >
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} ring-2 ring-bg-surface`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                      <span className="shrink-0 text-xs text-text-tertiary">{formatTime(activity.timestamp)}</span>
                    </div>
                    {activity.description && (
                      <p className="mt-0.5 text-xs text-text-secondary">{activity.description}</p>
                    )}
                    {activity.field && (
                      <p className="mt-0.5 text-[11px] text-text-tertiary">{activity.field}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
