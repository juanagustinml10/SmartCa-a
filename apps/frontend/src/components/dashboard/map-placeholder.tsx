"use client";

import { motion } from "framer-motion";
import { Map, Layers, ZoomIn, ZoomOut } from "lucide-react";
import type { DashboardField, DashboardFieldStatus } from "@/types/dashboard";

interface MapPlaceholderProps {
  fields: DashboardField[];
  areaHectares: number;
  fieldStatus: DashboardFieldStatus[];
}

export function MapPlaceholder({ fields, areaHectares, fieldStatus }: MapPlaceholderProps) {
  const activeStatuses = fieldStatus.filter((status) => status.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="relative overflow-hidden rounded-xl border border-border-default bg-bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-medium text-text-primary">Mapa de Campos</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex h-[320px] items-center justify-center bg-gradient-to-br from-brand-950/5 to-brand-900/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0v40M0 20h40' stroke='%231DB85E' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
        }} />

        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-brand-500/10 blur-3xl" />

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface shadow-lg ring-1 ring-border-default">
              <Map className="h-7 w-7 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-text-secondary">Mapa Interactivo</p>
            <p className="text-xs text-text-tertiary">
              {fields.length} campo{fields.length !== 1 ? "s" : ""} ·{" "}
              {areaHectares.toLocaleString("es-AR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })} ha
            </p>

            {fields.length > 0 ? (
              <div className="mt-2 flex max-w-sm flex-wrap justify-center gap-2">
                {activeStatuses.map((status) => (
                  <span
                    key={status.code}
                    className="rounded-full border border-border-default bg-bg-surface px-3 py-1 text-[10px] font-medium text-text-tertiary"
                  >
                    {status.name}: {status.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-text-tertiary">No hay campos registrados</p>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 rounded-lg border border-border-default bg-bg-surface/90 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-500/40" /> Campos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent-500/40" /> {activeStatuses.length} estados
            </span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-xs font-medium text-text-secondary shadow-sm">
            1:25K
          </div>
        </div>
      </div>
    </motion.div>
  );
}
