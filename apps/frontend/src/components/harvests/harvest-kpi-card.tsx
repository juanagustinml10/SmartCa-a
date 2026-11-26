'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HarvestKpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

function animateValue(start: number, end: number, duration: number, onUpdate: (v: number) => void) {
  const startTime = performance.now();
  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    onUpdate(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function HarvestKpiCard({ label, value, prefix = '', suffix = '', decimals = 1, trend, trendLabel, icon, color = '#10B981' }: HarvestKpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    animateValue(0, value, 1200, setDisplayValue);
  }, [value, visible]);

  const formatted = displayValue.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-error-500' : 'text-text-tertiary';

  return (
    <div ref={ref} className="bg-bg-surface border border-border-default rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{label}</span>
        {icon && <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20', color }}>{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-text-primary tabular-nums tracking-tight">
        {prefix}{formatted}{suffix}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trendColor}`}>
          <TrendIcon className="size-3" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
