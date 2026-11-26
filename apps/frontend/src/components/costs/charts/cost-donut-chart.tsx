'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostDonutChartProps {
  data: { name: string; total: number; color?: string }[];
  height?: number;
  innerRadius?: number;
}

const DEFAULT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#D946EF', '#92400E', '#DC2626', '#0891B2', '#65A30D', '#6B7280'];

export function CostDonutChart({ data, height = 300, innerRadius = 60 }: CostDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 35}
          dataKey="total"
          nameKey="name"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 'Monto']}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          formatter={(value: string) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
