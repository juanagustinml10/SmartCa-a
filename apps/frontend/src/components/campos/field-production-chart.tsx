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
import type { HistoricalProduction } from "@/types/fields";

interface FieldProductionChartProps {
  data: HistoricalProduction[];
  fieldName: string;
}

export function FieldProductionChart({ data, fieldName }: FieldProductionChartProps) {
  const chartData = data.map((d) => ({
    campaña: d.campaign,
    Producción: d.production,
    Rendimiento: d.yield_,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <h3 className="text-sm font-medium text-text-primary">Producción Histórica</h3>
      <p className="mb-4 text-xs text-text-tertiary">{fieldName}</p>

      <div className="h-[260px]">
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
              width={50}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)",
              }}
            />
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
              maxBarSize={36}
            />
            <Bar
              yAxisId="right"
              dataKey="Rendimiento"
              fill="#F59A00"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
