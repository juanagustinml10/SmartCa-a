'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { useGis } from './gis-context';
import { MOCK_COMPANIES, MOCK_GIS_FEATURES } from '@/lib/mock-gis';
import type { FieldStatus } from '@/types/fields';
import { STATUS_CONFIG } from '@/types/fields';

const STATUSES: FieldStatus[] = ['active', 'inactive', 'harvesting', 'resting'];

export default function MapFilters() {
  const { filters, setFilters, resetFilters } = useGis();
  const [open, setOpen] = useState(true);

  const varieties = [...new Set(MOCK_GIS_FEATURES.map((f) => f.properties.variety))];
  const campaigns = [...new Set(MOCK_GIS_FEATURES.map((f) => f.properties.campaign))];
  const maxProduction = Math.max(
    ...MOCK_GIS_FEATURES.map((f) => f.properties.estimatedProduction),
  );

  const hasActiveFilters =
    filters.companyId !== '' ||
    filters.campaign !== '' ||
    filters.status !== 'all' ||
    filters.variety !== '' ||
    filters.shiRange[0] !== 0 ||
    filters.shiRange[1] !== 100 ||
    filters.productionRange[0] !== 0 ||
    filters.productionRange[1] !== maxProduction ||
    filters.search !== '';

  const set = (patch: Partial<typeof filters>) =>
    setFilters({ ...filters, ...patch });

  return (
    <div className="w-64 rounded-xl border border-border-default bg-bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 h-9"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <SlidersHorizontal className="size-3.5" />
          Filtros
        </span>
        <span className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetFilters();
              }}
              className="flex items-center gap-0.5 text-[10px] text-text-tertiary hover:text-text-secondary"
            >
              <X className="size-3" /> Limpiar
            </button>
          )}
          <Chevron />
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          <SearchInput value={filters.search} onChange={(v) => set({ search: v })} />

          <Select
            value={filters.companyId}
            onChange={(v) => set({ companyId: v })}
            placeholder="Todas las empresas"
            options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Select
            value={filters.campaign}
            onChange={(v) => set({ campaign: v })}
            placeholder="Todas las campañas"
            options={campaigns.map((c) => ({ value: c, label: c }))}
          />

          <Select
            value={filters.status}
            onChange={(v) => set({ status: v as FieldStatus | 'all' })}
            placeholder="Todos los estados"
            options={STATUSES.map((s) => ({
              value: s,
              label: STATUS_CONFIG[s].label,
            }))}
          />

          <Select
            value={filters.variety}
            onChange={(v) => set({ variety: v })}
            placeholder="Todas las variedades"
            options={varieties.map((v) => ({ value: v, label: v }))}
          />

          <RangeSlider
            label="SHI"
            value={filters.shiRange}
            min={0}
            max={100}
            step={1}
            onChange={(v) => set({ shiRange: v })}
          />

          <RangeSlider
            label="Producción"
            value={filters.productionRange}
            min={0}
            max={maxProduction}
            step={50}
            onChange={(v) => set({ productionRange: v })}
          />
        </div>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <ChevronDown className="size-3.5 text-text-tertiary" />
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 h-8 px-2 rounded-lg border border-border-default bg-bg-surface">
      <Search className="size-3.5 text-text-tertiary shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar lote, empresa..."
        className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-text-tertiary hover:text-text-secondary">
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 px-2 rounded-lg border border-border-default bg-bg-surface text-xs text-text-primary outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  step: number;
  onChange: (v: [number, number]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
        <span>{label}</span>
        <span>
          {value[0]} – {value[1]}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onChange([Number(e.target.value), value[1]])}
        className="w-full h-1.5 accent-brand-500"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        onChange={(e) => onChange([value[0], Number(e.target.value)])}
        className="w-full h-1.5 accent-brand-500 -mt-1"
      />
    </div>
  );
}
