export default function MapLegend() {
  const items = [
    { color: '#1DB85E', label: 'Excelente (80-100)' },
    { color: '#3B82F6', label: 'Bueno (60-79)' },
    { color: '#F59A00', label: 'Regular (40-59)' },
    { color: '#EF4444', label: 'Crítico (0-39)' },
  ];

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm px-3 py-2">
      <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5">Health Score</div>
      {items.map((item) => (
        <div key={item.color} className="flex items-center gap-2 py-0.5">
          <div
            className="size-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[11px] text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
