"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardCostCategory, DashboardCostPoint } from "@/types/dashboard";

interface CostsChartProps {
  total: number;
  costPerHectare: number | null;
  byCategory: DashboardCostCategory[];
  byMonth: DashboardCostPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: { name: string; value: number } }[];
}

function CustomTooltipCost({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-text-secondary">{data.name}</p>
      <p className="font-mono text-sm font-medium text-text-primary">
        $ {data.value.toLocaleString("es-AR")}
      </p>
    </div>
  );
}

export function CostsChart({ total, costPerHectare, byCategory, byMonth }: CostsChartProps) {
  const [showBar, setShowBar] = useState(false);
  const topCategories = byCategory.slice(0, 5).map((category) => ({
    name: category.name,
    value: category.total,
    color: category.color,
  }));
  const monthlyTotal = byMonth.length > 0 ? byMonth[byMonth.length - 1].total : 0;
  const previousMonthly = byMonth.length > 1 ? byMonth[byMonth.length - 2].total : 0;
  const monthlyChange = previousMonthly > 0
    ? ((monthlyTotal - previousMonthly) / previousMonthly) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="rounded-xl border border-border-default bg-bg-surface p-5"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Distribución de Costos</h3>
            <p className="text-xs text-text-tertiary">Total: $ {total.toLocaleString("es-AR")}</p>
          </div>
          <Link href="/costos" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
            Ver más <ArrowRight className="size-3" />
          </Link>
        </div>
        {total > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="text-xs text-text-secondary">
              <span className="text-text-primary font-semibold">${monthlyTotal.toLocaleString("es-AR")}</span> en el último mes registrado
              {previousMonthly > 0 && (
                <span className={`ml-1 ${monthlyChange >= 0 ? "text-error-500" : "text-success-500"}`}>
                  {monthlyChange >= 0 ? "+" : ""}{monthlyChange.toFixed(1)}%
                </span>
              )}
            </div>
            {costPerHectare !== null && (
              <div className="text-xs text-text-secondary">
                <span className="text-text-primary font-semibold">${costPerHectare.toLocaleString("es-AR")}</span> /ha
              </div>
            )}
          </div>
        )}
      </div>

      {topCategories.length === 0 && byMonth.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-text-tertiary">No hay costos registrados para el período</p>
        </div>
      ) : (
        <>
          <div className="h-[280px]">
            {showBar ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth.map((m) => ({ name: m.month, total: m.total }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipCost />} />
                  <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {topCategories.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipCost />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <button
            onClick={() => setShowBar(!showBar)}
            className="mt-2 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showBar ? "Ver distribución" : "Ver evolución mensual"}
          </button>
        </>
      )}
    </motion.div>
  );
}
