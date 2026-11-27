"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { DashboardProductionPoint } from "@/types/dashboard";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toLocaleString("es-AR")} {entry.name === "Rendimiento" ? "t/ha" : "t"}
        </p>
      ))}
    </div>
  );
}

export function ProductionChart({ data }: { data: DashboardProductionPoint[] }) {
  const chartData = data.map((item) => ({
    campaña: item.campaignCode,
    Producción: item.production,
    Rendimiento: item.yieldPerHectare,
    Meta: item.target,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Producción por Campaña</h3>
        <p className="text-xs text-text-tertiary">Cosechas y rendimiento registrados</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-text-tertiary">No hay cosechas registradas para el período</p>
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis
                dataKey="campaña"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={{ stroke: "var(--border-default)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="left"
                dataKey="Producción"
                fill="#1DB85E"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="right"
                dataKey="Rendimiento"
                fill="#F59A00"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="right"
                dataKey="Meta"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
