'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Treemap,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  MOCK_CHART_PRODUCTION, MOCK_CHART_SHI_DIMENSIONS,
  MOCK_CHART_COST_BY_CATEGORY, MOCK_CHART_MONTHLY_PRODUCTION,
} from '@/lib/mock-executive';
import { useExecutive } from '@/contexts/executive-context';

const tooltipStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 6,
  fontSize: 11,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="p-2">
      <p className="text-[10px] font-medium text-text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[10px] text-text-secondary" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('es-AR') : p.value}
        </p>
      ))}
    </div>
  );
}

export function ProductionLineChart() {
  const { selectCampaign } = useExecutive();
  const data = MOCK_CHART_PRODUCTION;

  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Producción por campaña</span>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} onClick={(e) => { const label = e?.activeLabel; if (typeof label === 'string') selectCampaign(label); }}>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
          <XAxis dataKey="campaign" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="production" stroke="#1DB85E" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="target" stroke="#F59A00" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShiRadarChart() {
  const data = MOCK_CHART_SHI_DIMENSIONS;

  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Dimensiones SHI</span>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border-default)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 8, fill: 'var(--text-tertiary)' }} />
          <Tooltip content={<ChartTooltip />} />
          <Radar dataKey="value" stroke="#1DB85E" fill="#1DB85E" fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostBarChart() {
  const { selectCategory, sync } = useExecutive();
  const data = MOCK_CHART_COST_BY_CATEGORY;

  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Costos por categoría</span>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} onClick={(e) => { const label = e?.activeLabel; if (typeof label === 'string') selectCategory(label); }}>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
          <XAxis dataKey="category" tick={{ fontSize: 8, fill: 'var(--text-tertiary)' }} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} opacity={sync.selectedCategory === entry.category ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostDonutChart() {
  const data = MOCK_CHART_COST_BY_CATEGORY;

  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Distribución de costos</span>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyAreaChart() {
  const data = MOCK_CHART_MONTHLY_PRODUCTION;

  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Producción mensual</span>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1DB85E" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1DB85E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'var(--text-tertiary)' }} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="production" stroke="#1DB85E" strokeWidth={2} fill="url(#prodGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const TREEMAP_DATA = MOCK_CHART_COST_BY_CATEGORY.map((c) => ({ name: c.category, size: c.amount, fill: c.fill }));

interface TreemapContentProps {
  x?: number; y?: number; width?: number; height?: number; name?: string; fill?: string;
}

function TreemapContent(props: TreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', fill = '#000' } = props;
  if (width < 20 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} opacity={0.85} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
        {name}
      </text>
    </g>
  );
}

export function CostTreemap() {
  return (
    <div className="h-full flex flex-col">
      <span className="text-[10px] font-semibold text-text-secondary mb-2">Treemap de costos</span>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={TREEMAP_DATA} dataKey="size" aspectRatio={4 / 3} content={<TreemapContent />} />
      </ResponsiveContainer>
    </div>
  );
}

const CHART_COMPONENTS = [
  { id: 'line', component: ProductionLineChart },
  { id: 'radar', component: ShiRadarChart },
  { id: 'bar', component: CostBarChart },
  { id: 'donut', component: CostDonutChart },
  { id: 'area', component: MonthlyAreaChart },
  { id: 'treemap', component: CostTreemap },
];

export function ChartGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-full">
      {CHART_COMPONENTS.map(({ id, component: Chart }) => (
        <div key={id} className="rounded-lg border border-border-default bg-bg-surface p-2 min-h-0">
          <Chart />
        </div>
      ))}
    </div>
  );
}
