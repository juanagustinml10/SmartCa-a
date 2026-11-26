'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface CostRadarChartProps {
  data: { category: string; amount: number; fullMark?: number }[];
  height?: number;
  color?: string;
}

export function CostRadarChart({ data, height = 300, color = '#10B981' }: CostRadarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const chartData = data.map((d) => ({ ...d, fullMark: maxVal * 1.2 }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="var(--border-default)" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 'Monto']}
        />
        <Radar dataKey="amount" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
