'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, TrendingUp, Wallet, DollarSign, Gauge, Bell, Clock, Bot, Sun } from 'lucide-react';
import type { ExecutiveKpi } from '@/types/executive';

const iconMap: Record<string, React.ElementType> = {
  Truck, TrendingUp, Wallet, DollarSign, Gauge, Bell, Clock, Bot, Sun,
};

const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
  brand: { bg: 'bg-brand-50 dark:bg-brand-950/20', text: 'text-brand-600 dark:text-brand-500', bar: 'bg-brand-500' },
  accent: { bg: 'bg-accent-50 dark:bg-accent-950/20', text: 'text-accent-600 dark:text-accent-500', bar: 'bg-accent-500' },
  info: { bg: 'bg-info-50 dark:bg-info-950/20', text: 'text-info-600 dark:text-info-500', bar: 'bg-info-500' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-950/20', text: 'text-warning-600 dark:text-warning-500', bar: 'bg-warning-500' },
  error: { bg: 'bg-error-50 dark:bg-error-950/20', text: 'text-error-600 dark:text-error-500', bar: 'bg-error-500' },
};

const trendColorMap: Record<string, string> = {
  up: 'text-success-500', down: 'text-error-500', neutral: 'text-text-tertiary',
};

function AnimatedCounter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1000;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(decimals) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(decimals) + 'K';
    return num.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return <>{formatNumber(count)}</>;
}

interface ExecutiveKpiCardProps {
  kpi: ExecutiveKpi;
  index: number;
}

export function ExecutiveKpiCard({ kpi, index }: ExecutiveKpiCardProps) {
  const Icon = iconMap[kpi.icon] || TrendingUp;
  const colors = colorMap[kpi.color] || colorMap.info;
  const trendColor = trendColorMap[kpi.trend] || trendColorMap.neutral;
  const trendArrow = { up: '↑', down: '↓', neutral: '→' }[kpi.trend];
  const isMonetary = kpi.unit === '$';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group relative rounded-lg border border-border-default bg-bg-surface p-3 transition-all duration-200 hover:shadow-md cursor-default"
      title={kpi.tooltip}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${colors.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
        </div>
        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
          {trendArrow} {kpi.trendValue}
        </span>
      </div>
      <p className="text-[10px] font-medium text-text-secondary mb-0.5">{kpi.label}</p>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
          {isMonetary ? '$' : ''}<AnimatedCounter value={kpi.value} decimals={kpi.decimals ?? 1} />
        </span>
        {kpi.unit && kpi.unit !== '$' && (
          <span className="font-mono text-[10px] font-medium text-text-tertiary">{kpi.unit}</span>
        )}
      </div>
      {kpi.trend !== 'neutral' && (
        <div className={`absolute bottom-0 left-0 h-0.5 w-0 ${colors.bar} transition-all duration-500 group-hover:w-full`} />
      )}
    </motion.div>
  );
}
