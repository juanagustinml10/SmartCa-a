"use client";

import { motion } from "framer-motion";
import { getHealthScoreConfig } from "@/types/fields";

interface HealthScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function HealthScore({ score, size = "md", showLabel = true }: HealthScoreProps) {
  const config = getHealthScoreConfig(score);
  const clampedScore = Math.max(0, Math.min(100, score));

  const sizes = {
    sm: { dimension: 36, stroke: 3, fontSize: 10 },
    md: { dimension: 48, stroke: 4, fontSize: 13 },
    lg: { dimension: 64, stroke: 5, fontSize: 16 },
  };

  const s = sizes[size];
  const radius = (s.dimension - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: s.dimension, height: s.dimension }}>
        <svg width={s.dimension} height={s.dimension} className="-rotate-90">
          <circle
            cx={s.dimension / 2}
            cy={s.dimension / 2}
            r={radius}
            strokeWidth={s.stroke}
            className="stroke-border-default"
            fill="none"
          />
          <motion.circle
            cx={s.dimension / 2}
            cy={s.dimension / 2}
            r={radius}
            strokeWidth={s.stroke}
            className={config.ring}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold ${config.color}`}
          style={{ fontSize: s.fontSize }}
        >
          {clampedScore}
        </span>
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      )}
    </div>
  );
}
