"use client";

import { Search, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FieldFiltersState, ViewMode, FieldStatus } from "@/types/fields";
import { MOCK_VARIETIES, MOCK_CAMPAIGNS } from "@/lib/mock-fields";

interface FieldFiltersProps {
  filters: FieldFiltersState;
  onChange: (filters: FieldFiltersState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  total: number;
}

export function FieldFilters({ filters, onChange, viewMode, onViewModeChange, total }: FieldFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const statuses: { value: FieldStatus | "all"; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activo" },
    { value: "harvesting", label: "En cosecha" },
    { value: "resting", label: "En descanso" },
    { value: "inactive", label: "Inactivo" },
  ];

  const update = (partial: Partial<FieldFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const clearFilters = () => {
    onChange({ search: "", status: "all", variety: "", campaign: "", sortKey: "name", sortAsc: true });
  };

  const hasActiveFilters = filters.status !== "all" || filters.variety !== "" || filters.campaign !== "";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Buscar por nombre, variedad..."
            className="h-10 w-full rounded-lg border border-border-default bg-bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20"
                : "border-border-default bg-bg-surface text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                {(filters.status !== "all" ? 1 : 0) + (filters.variety ? 1 : 0) + (filters.campaign ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="flex rounded-lg border border-border-default overflow-hidden">
            <button
              onClick={() => onViewModeChange("cards")}
              className={`flex h-10 w-10 items-center justify-center transition-colors ${
                viewMode === "cards"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-950/20"
                  : "bg-bg-surface text-text-secondary hover:bg-bg-subtle"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex h-10 w-10 items-center justify-center transition-colors ${
                viewMode === "table"
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-950/20"
                  : "bg-bg-surface text-text-secondary hover:bg-bg-subtle"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <span className="hidden text-xs text-text-tertiary sm:block">
            {total} campo{total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">Estado:</span>
                <div className="flex flex-wrap gap-1">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => update({ status: s.value })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        filters.status === s.value
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-950/20"
                          : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-5 w-px bg-border-default" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">Variedad:</span>
                <select
                  value={filters.variety}
                  onChange={(e) => update({ variety: e.target.value })}
                  className="h-8 rounded-lg border border-border-default bg-bg-surface px-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {MOCK_VARIETIES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="h-5 w-px bg-border-default" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">Campaña:</span>
                <select
                  value={filters.campaign}
                  onChange={(e) => update({ campaign: e.target.value })}
                  className="h-8 rounded-lg border border-border-default bg-bg-surface px-2.5 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Todas</option>
                  {MOCK_CAMPAIGNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="h-3 w-3" /> Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
