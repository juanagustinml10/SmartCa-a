"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Sprout, Ruler, Droplets, Beaker, Wheat } from "lucide-react";
import Link from "next/link";
import type { FieldData } from "@/types/fields";
import { STATUS_CONFIG } from "@/types/fields";
import { HealthScore } from "./health-score";

interface FieldDetailHeaderProps {
  field: FieldData;
}

export function FieldDetailHeader({ field }: FieldDetailHeaderProps) {
  const statusConfig = STATUS_CONFIG[field.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href="/campos"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Campos
      </Link>

      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${field.color}18` }}
            >
              <SproutIcon className="h-7 w-7" style={{ color: field.color }} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-text-primary">{field.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-text-tertiary">{field.alias}</p>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-xl">
                Campo de {field.surfaceHa} ha cultivado con {field.variety}.
                Campaña {field.campaign}. Suelo {field.soilType.toLowerCase()} con pH {field.soilPh}.
                Riego por {field.irrigation.toLowerCase()}.
              </p>
            </div>
          </div>
          <HealthScore score={field.healthScore} size="lg" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoChip icon={<Ruler className="h-4 w-4" />} label="Superficie" value={`${field.surfaceHa} ha`} />
          <InfoChip icon={<Wheat className="h-4 w-4" />} label="Variedad" value={field.variety} />
          <InfoChip icon={<Calendar className="h-4 w-4" />} label="Siembra" value={field.plantingDate} />
          <InfoChip icon={<MapPin className="h-4 w-4" />} label="Ubicación" value={`${field.location.lat.toFixed(4)}, ${field.location.lng.toFixed(4)}`} />
          <InfoChip icon={<Beaker className="h-4 w-4" />} label="Suelo" value={field.soilType} />
          <InfoChip icon={<Droplets className="h-4 w-4" />} label="Riego" value={field.irrigation} />
          <InfoChip icon={<Sprout className="h-4 w-4" />} label="Campaña" value={field.campaign} />
          <InfoChip icon={<Wheat className="h-4 w-4" />} label="Prod. estimada" value={`${field.estimatedProduction.toLocaleString("es-AR")} t`} />
        </div>
      </div>
    </motion.div>
  );
}

function SproutIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c0-4 4-6 4-6" />
      <path d="M12 14c2-4 6-6 6-6" />
      <path d="M6 8c3-2 6-2 6-2" />
    </svg>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-subtle px-4 py-3">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
