"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Crop,
  Truck,
  Wallet,
  TrendingUp,
  Bell,
  Clock,
  Gauge,
} from "lucide-react";
import type { KpiData } from "@/types/dashboard";

const iconMap: Record<string, React.ElementType> = {
  Sprout, Crop, Truck, Wallet, TrendingUp, Bell, Clock, Gauge,
};

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  brand: { bg: "bg-brand-50 dark:bg-brand-950/20", text: "text-brand-600 dark:text-brand-500", dot: "bg-brand-500" },
  accent: { bg: "bg-accent-50 dark:bg-accent-950/20", text: "text-accent-600 dark:text-accent-500", dot: "bg-accent-500" },
  info: { bg: "bg-info-50 dark:bg-info-950/20", text: "text-info-600 dark:text-info-500", dot: "bg-info-500" },
  warning: { bg: "bg-warning-50 dark:bg-warning-950/20", text: "text-warning-600 dark:text-warning-500", dot: "bg-warning-500" },
  error: { bg: "bg-error-50 dark:bg-error-950/20", text: "text-error-600 dark:text-error-500", dot: "bg-error-500" },
};

const trendIconMap: Record<string, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

const trendColorMap: Record<string, string> = {
  up: "text-success-500",
  down: "text-error-500",
  neutral: "text-text-tertiary",
};

function AnimatedCounter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Al cambiar de campaña el valor se actualiza sin reiniciar la animación.
    if (hasAnimated.current) {
      setCount(value);
      return;
    }
    hasAnimated.current = true;

    const duration = 1200;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(decimals) + "M";
    if (num >= 1000) return (num / 1000).toFixed(decimals) + "K";
    return num.toLocaleString("es-AR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return <span ref={ref}>{formatNumber(count)}</span>;
}

interface KpiCardProps {
  data: KpiData;
  index: number;
}

export function KpiCard({ data, index }: KpiCardProps) {
  const Icon = iconMap[data.icon] || Sprout;
  const colors = colorMap[data.color] || colorMap.brand;
  const trendColor = trendColorMap[data.trend] || trendColorMap.neutral;
  const trendIcon = trendIconMap[data.trend] || "→";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface p-5 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trendIcon} {data.trendValue}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-text-secondary">{data.label}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">
            <AnimatedCounter value={data.value} decimals={data.decimals ?? 1} />
          </span>
          {data.unit && (
            <span className="font-mono text-sm font-medium text-text-tertiary">{data.unit}</span>
          )}
        </div>
      </div>

      {data.trend === "up" && (
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-500 transition-all duration-500 group-hover:w-full" />
      )}
      {data.trend === "down" && (
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-error-500 transition-all duration-500 group-hover:w-full" />
      )}
    </motion.div>
  );
}
