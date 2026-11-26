'use client';



interface CostAnalysisTableProps {
  data: { name: string; total: number; percentage: number; count?: number }[];
  title: string;
  formatValue?: (v: number) => string;
}

export function CostAnalysisTable({ data, title, formatValue }: CostAnalysisTableProps) {
  const fmt = formatValue ?? ((v: number) => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="group flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-bg-subtle transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-text-primary truncate">{d.name}</span>
                <span className="text-xs text-text-secondary tabular-nums ml-2">{fmt(d.total)}</span>
              </div>
              <div className="relative h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${(d.total / maxTotal) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-text-tertiary tabular-nums w-10 text-right">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
