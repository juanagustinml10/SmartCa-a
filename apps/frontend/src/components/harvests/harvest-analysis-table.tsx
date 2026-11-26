'use client';

interface HarvestAnalysisTableProps {
  data: { name: string; tons: number; percentage: number }[];
  title: string;
}

export function HarvestAnalysisTable({ data, title }: HarvestAnalysisTableProps) {
  const maxTons = Math.max(...data.map(d => d.tons), 1);
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="w-28 text-xs text-text-secondary truncate" title={d.name}>{d.name}</span>
            <div className="flex-1 h-2 bg-border-default rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(d.tons / maxTons) * 100}%` }} />
            </div>
            <span className="w-20 text-xs text-right text-text-primary font-medium tabular-nums">{d.tons.toLocaleString('es-AR', { maximumFractionDigits: 1 })} t</span>
            <span className="w-10 text-xs text-right text-text-tertiary">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
