"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, AlertCircle } from "lucide-react";
import { FieldFilters } from "@/components/campos/field-filters";
import { FieldCard } from "@/components/campos/field-card";
import { FieldTable } from "@/components/campos/field-table";
import { EmptyState } from "@/components/campos/empty-state";
import { FieldCardSkeleton, FieldTableSkeleton } from "@/components/campos/field-skeleton";
import { fetchFields } from "@/lib/api-fields";
import { MOCK_FIELDS } from "@/lib/mock-fields";
import type { FieldFiltersState, ViewMode, FieldSortKey } from "@/types/fields";
import type { FieldData } from "@/types/fields";

const defaultFilters: FieldFiltersState = {
  search: "",
  status: "all",
  variety: "",
  campaign: "",
  sortKey: "name",
  sortAsc: true,
};

export default function CamposPage() {
  const [fields, setFields] = useState<FieldData[]>(MOCK_FIELDS);
  const [filters, setFilters] = useState<FieldFiltersState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchFields()
      .then((res) => {
        if (!mounted) return;
        if (res.data && res.data.length > 0) {
          setFields(res.data);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Error al cargar campos");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredFields = useMemo(() => {
    let result = [...fields];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.alias?.toLowerCase().includes(q) ||
          f.variety.toLowerCase().includes(q) ||
          f.campaign.toLowerCase().includes(q),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((f) => f.status === filters.status);
    }

    if (filters.variety) {
      result = result.filter((f) => f.variety === filters.variety);
    }

    if (filters.campaign) {
      result = result.filter((f) => f.campaign === filters.campaign);
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortKey];
      const bVal = b[filters.sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return filters.sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return filters.sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [filters, fields]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="mb-3 h-10 w-10 text-error-500" />
          <h2 className="text-lg font-medium text-text-primary">Error al cargar campos</h2>
          <p className="mt-1 text-sm text-text-tertiary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Campos</h1>
          <p className="text-sm text-text-tertiary">
            {loading ? "Cargando..." : `${fields.length} campos registrados`}
          </p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Campo</span>
        </button>
      </motion.div>

      <FieldFilters
        filters={filters}
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        total={filteredFields.length}
      />

      {loading ? (
        viewMode === "cards" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <FieldCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <FieldTableSkeleton />
          </div>
        )
      ) : filteredFields.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No se encontraron campos"
            description="Intenta ajustar los filtros o crea un nuevo campo."
            actionLabel="Crear primer campo"
            onAction={() => {}}
          />
        </div>
      ) : viewMode === "cards" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFields.map((field, i) => (
            <FieldCard key={field.id} field={field} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <FieldTable
            fields={filteredFields}
            sortKey={filters.sortKey}
            sortAsc={filters.sortAsc}
            onSort={(key) => {
              setFilters((prev) => ({
                ...prev,
                sortKey: key as FieldSortKey,
                sortAsc: prev.sortKey === key ? !prev.sortAsc : true,
              }));
            }}
          />
        </div>
      )}
    </div>
  );
}
