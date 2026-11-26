"use client";

import { motion } from "framer-motion";
import { Calendar, Ruler, Wheat, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FieldData } from "@/types/fields";
import { STATUS_CONFIG } from "@/types/fields";
import { HealthScore } from "./health-score";

interface FieldCardProps {
  field: FieldData;
  index: number;
}

export function FieldCard({ field, index }: FieldCardProps) {
  const statusConfig = STATUS_CONFIG[field.status];
  const productionT = field.estimatedProduction.toLocaleString("es-AR");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link
        href={`/campos/${field.id}`}
        className="group block rounded-xl border border-border-default bg-bg-surface p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${field.color}18` }}
            >
              <SproutIcon className="h-5 w-5" style={{ color: field.color }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-500 transition-colors">
                {field.name}
              </h3>
              <p className="text-xs text-text-tertiary">{field.alias}</p>
            </div>
          </div>
          <HealthScore score={field.healthScore} size="sm" showLabel={false} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatItem icon={<Ruler className="h-3.5 w-3.5" />} label="Superficie" value={`${field.surfaceHa} ha`} />
          <StatItem icon={<Wheat className="h-3.5 w-3.5" />} label="Variedad" value={field.variety} />
          <StatItem icon={<Calendar className="h-3.5 w-3.5" />} label="Campaña" value={field.campaign} />
          <StatItem icon={<SproutIcon className="h-3.5 w-3.5" />} label="Producción" value={`${productionT} t`} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border-default pt-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="text-[10px] text-text-tertiary">{field.lastActivity}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-text-tertiary transition-all group-hover:translate-x-0.5 group-hover:text-brand-500" />
        </div>
      </Link>
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

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-subtle px-3 py-2">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className="mt-0.5 font-mono text-xs font-semibold text-text-primary">{value}</p>
    </div>
  );
}
