"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FieldData } from "@/types/fields";
import { STATUS_CONFIG } from "@/types/fields";
import { HealthScore } from "./health-score";

interface FieldTableProps {
  fields: FieldData[];
  sortKey: string;
  sortAsc: boolean;
  onSort: (key: string) => void;
}

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <span className={`ml-1 inline-block text-[10px] ${active ? "text-brand-500" : "text-text-tertiary"}`}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );
}

export function FieldTable({ fields, sortKey, sortAsc, onSort }: FieldTableProps) {
  const headers = [
    { key: "name", label: "Nombre", className: "" },
    { key: "surfaceHa", label: "Superficie", className: "hidden sm:table-cell" },
    { key: "variety", label: "Variedad", className: "hidden md:table-cell" },
    { key: "estimatedProduction", label: "Producción", className: "hidden sm:table-cell" },
    { key: "healthScore", label: "Health Score", className: "hidden lg:table-cell" },
    { key: "status", label: "Estado", className: "hidden lg:table-cell" },
    { key: "", label: "", className: "w-10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-xl border border-border-default bg-bg-surface"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            {headers.map((h) => (
              <th
                key={h.key}
                className={`${h.className} cursor-pointer px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-secondary select-none hover:text-text-primary transition-colors`}
                onClick={() => h.key && onSort(h.key)}
              >
                {h.key && (
                  <>
                    {h.label}
                    <SortIcon active={sortKey === h.key} asc={sortAsc} />
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => {
            const statusConfig = STATUS_CONFIG[field.status];
            const productionT = field.estimatedProduction.toLocaleString("es-AR");

            return (
              <motion.tr
                key={field.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="group border-b border-border-default last:border-0 hover:bg-bg-subtle transition-colors"
              >
                <td className="px-4 py-3.5">
                  <Link href={`/campos/${field.id}`} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${field.color}18` }}
                    >
                      <span className="text-xs font-bold" style={{ color: field.color }}>
                        {field.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-brand-500 transition-colors">
                        {field.name}
                      </p>
                      <p className="text-[11px] text-text-tertiary">{field.alias}</p>
                    </div>
                  </Link>
                </td>
                <td className="hidden px-4 py-3.5 sm:table-cell">
                  <span className="font-mono text-sm text-text-primary">{field.surfaceHa}</span>
                  <span className="ml-1 text-xs text-text-tertiary">ha</span>
                </td>
                <td className="hidden px-4 py-3.5 md:table-cell">
                  <span className="text-sm text-text-primary">{field.variety}</span>
                </td>
                <td className="hidden px-4 py-3.5 sm:table-cell">
                  <span className="font-mono text-sm text-text-primary">{productionT}</span>
                  <span className="ml-1 text-xs text-text-tertiary">t</span>
                </td>
                <td className="hidden px-4 py-3.5 lg:table-cell">
                  <HealthScore score={field.healthScore} size="sm" showLabel={false} />
                </td>
                <td className="hidden px-4 py-3.5 lg:table-cell">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/campos/${field.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary opacity-0 transition-all hover:bg-bg-subtle hover:text-brand-500 group-hover:opacity-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
