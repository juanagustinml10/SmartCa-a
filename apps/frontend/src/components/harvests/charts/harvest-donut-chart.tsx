'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface HarvestDonutChartProps {
  data: { name: string; tons: number; color?: string }[];
  height?: number;
}

const DEFAULT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export function HarvestDonutChart({ data, height = 300 }: HarvestDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="tons" nameKey="name">
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 1 })} t`, 'Toneladas']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
