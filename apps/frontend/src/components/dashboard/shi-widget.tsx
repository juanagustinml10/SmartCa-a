'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { DashboardField } from '@/types/dashboard';

export function ShiWidget({ fields }: { fields: DashboardField[] }) {
  const scoredFields = useMemo(
    () =>
      fields
        .filter((field) => field.shiScore !== null)
        .map((field) => ({
          id: field.id,
          name: field.name,
          score: field.shiScore as number,
          level: field.shiLevel ?? 'sin clasificar',
        }))
        .sort((a, b) => b.score - a.score),
    [fields],
  );

  const averageScore = scoredFields.length
    ? Math.round(scoredFields.reduce((sum, field) => sum + field.score, 0) / scoredFields.length)
    : 0;
  const excellent = scoredFields.filter((field) => field.level.toLowerCase() === 'excelente').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-brand-500" />
            <h3 className="text-sm font-medium text-text-primary">Índice SHI</h3>
          </div>
          <Link href="/produccion" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
            Ver más <ArrowRight className="size-3" />
          </Link>
        </div>
        <p className="text-xs text-text-tertiary mt-1">
          {scoredFields.length > 0
            ? `Promedio: ${averageScore}/100 · ${excellent} campos excelentes`
            : 'Sin índices calculados'}
        </p>
      </div>

      {scoredFields.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center">
          <p className="text-sm text-text-tertiary">No hay índices SHI registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scoredFields.slice(0, 5).map((field) => (
            <div key={field.id} className="flex items-center gap-3">
              <div className="relative size-8 shrink-0">
                <svg viewBox="0 0 36 36" className="size-8">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={field.score >= 80 ? '#10B981' : field.score >= 60 ? '#3B82F6' : field.score >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={`${(field.score / 100) * 97.4} 97.4`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <text x="18" y="18" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-primary)" fontWeight="bold">
                    {field.score}
                  </text>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{field.name}</p>
                <p className="text-[10px] text-text-tertiary capitalize">{field.level}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
