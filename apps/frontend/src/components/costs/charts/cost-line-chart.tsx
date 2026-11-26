'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CostLineChartProps {
  data: { month: string; total: number; cumulative?: number }[];
  dataKey?: string;
  color?: string;
  height?: number;
  showCumulative?: boolean;
}

export function CostLineChart({ data, dataKey = 'total', color = '#10B981', height = 300, showCumulative = false }: CostLineChartProps) {
  const chartData = showCumulative && !data[0]?.cumulative
    ? data.map((d, i) => ({ ...d, cumulative: data.slice(0, i + 1).reduce((s, dd) => s + dd.total, 0) }))
    : data;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 'Monto']}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
        {showCumulative && (
          <Line type="monotone" dataKey="cumulative" stroke="#6366F1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
