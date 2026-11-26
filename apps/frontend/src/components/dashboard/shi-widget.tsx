'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MOCK_FIELD_SHI } from '@/lib/mock-harvests';
export function ShiWidget() {
  const fields = useMemo(() => {
    return [...MOCK_FIELD_SHI.entries()].map(([fid, shi]) => ({
      fieldId: fid,
      fieldName: fid.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      shi,
    })).sort((a, b) => b.shi.score - a.shi.score);
  }, []);

  const averageScore = Math.round(fields.reduce((s, f) => s + f.shi.score, 0) / fields.length);

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
        <p className="text-xs text-text-tertiary mt-1">Promedio: {averageScore}/100 · {fields.filter(f => f.shi.level === 'excelente').length} campos excelentes</p>
      </div>
      <div className="space-y-2">
        {fields.slice(0, 5).map((f) => (
          <div key={f.fieldId} className="flex items-center gap-3">
            <div className="relative size-8 shrink-0">
              <svg viewBox="0 0 36 36" className="size-8">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={f.shi.score >= 80 ? '#10B981' : f.shi.score >= 60 ? '#3B82F6' : f.shi.score >= 40 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="3"
                  strokeDasharray={`${(f.shi.score / 100) * 97.4} 97.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
                <text x="18" y="18" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-primary)" fontWeight="bold">
                  {f.shi.score}
                </text>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{f.fieldName}</p>
              <p className="text-[10px] text-text-tertiary capitalize">{f.shi.level}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
