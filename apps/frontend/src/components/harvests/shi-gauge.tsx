'use client';

import type { ShiResult } from '@/types/shi';

interface ShiGaugeProps {
  result: ShiResult;
  size?: number;
  showBreakdown?: boolean;
}

const levelColors: Record<string, string> = {
  excelente: '#10B981',
  bueno: '#3B82F6',
  regular: '#F59E0B',
  critico: '#EF4444',
};

export function ShiGauge({ result, size = 160, showBreakdown = false }: ShiGaugeProps) {
  const { score, level, breakdown } = result;
  const radius = size / 2 - 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = levelColors[level];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-default)" strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</span>
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{level}</span>
        </div>
      </div>
      {showBreakdown && (
        <div className="w-full space-y-1.5 text-xs">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-24 text-text-tertiary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: val >= 80 ? '#10B981' : val >= 60 ? '#3B82F6' : val >= 40 ? '#F59E0B' : '#EF4444' }} />
              </div>
              <span className="w-8 text-right font-medium text-text-primary">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
