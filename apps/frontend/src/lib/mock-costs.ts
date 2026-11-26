import type { CostItem, CostCategory, Supplier, CostAnalytics, CostAlert } from '@/types/costs';

export const MOCK_COST_CATEGORIES: CostCategory[] = [
  { id: 'cat-seeds', code: 'seeds', name: 'Semillas', description: 'Semillas y plantines', icon: 'Sprout', color: '#22C55E', sortOrder: 1, isActive: true },
  { id: 'cat-fertilizers', code: 'fertilizers', name: 'Fertilizantes', description: 'Fertilizantes y enmiendas', icon: 'FlaskConical', color: '#3B82F6', sortOrder: 2, isActive: true },
  { id: 'cat-herbicides', code: 'herbicides', name: 'Herbicidas', description: 'Herbicidas y matamalezas', icon: 'Bug', color: '#F59E0B', sortOrder: 3, isActive: true },
  { id: 'cat-insecticides', code: 'insecticides', name: 'Insecticidas', description: 'Insecticidas y control de plagas', icon: 'Bug', color: '#EF4444', sortOrder: 4, isActive: true },
  { id: 'cat-fungicides', code: 'fungicides', name: 'Fungicidas', description: 'Fungicidas y control de hongos', icon: 'FlaskConical', color: '#8B5CF6', sortOrder: 5, isActive: true },
  { id: 'cat-fuel', code: 'fuel', name: 'Combustible', description: 'Combustible y lubricantes', icon: 'Fuel', color: '#F97316', sortOrder: 6, isActive: true },
  { id: 'cat-lubricants', code: 'lubricants', name: 'Lubricantes', description: 'Aceites y lubricantes', icon: 'Droplet', color: '#06B6D4', sortOrder: 7, isActive: true },
  { id: 'cat-machinery', code: 'machinery', name: 'Maquinaria', description: 'Maquinaria agrícola', icon: 'Tractor', color: '#84CC16', sortOrder: 8, isActive: true },
  { id: 'cat-spareparts', code: 'spareparts', name: 'Repuestos', description: 'Repuestos y accesorios', icon: 'Wrench', color: '#EC4899', sortOrder: 9, isActive: true },
  { id: 'cat-labor', code: 'labor', name: 'Mano de obra', description: 'Jornales y contrataciones', icon: 'Users', color: '#14B8A6', sortOrder: 10, isActive: true },
  { id: 'cat-irrigation', code: 'irrigation', name: 'Riego', description: 'Riego y drenaje', icon: 'Droplets', color: '#0EA5E9', sortOrder: 11, isActive: true },
  { id: 'cat-transport', code: 'transport', name: 'Transporte', description: 'Fletes y logística', icon: 'Truck', color: '#6366F1', sortOrder: 12, isActive: true },
  { id: 'cat-external', code: 'external', name: 'Servicios externos', description: 'Servicios contratados', icon: 'Building2', color: '#92400E', sortOrder: 13, isActive: true },
  { id: 'cat-lab', code: 'lab', name: 'Análisis de laboratorio', description: 'Análisis de suelo y foliares', icon: 'Microscope', color: '#D946EF', sortOrder: 14, isActive: true },
  { id: 'cat-taxes', code: 'taxes', name: 'Impuestos', description: 'Impuestos y tasas', icon: 'Receipt', color: '#DC2626', sortOrder: 15, isActive: true },
  { id: 'cat-insurance', code: 'insurance', name: 'Seguros', description: 'Seguros agrícolas', icon: 'Shield', color: '#0891B2', sortOrder: 16, isActive: true },
  { id: 'cat-maintenance', code: 'maintenance', name: 'Mantenimiento', description: 'Mantenimiento de equipos', icon: 'Tool', color: '#65A30D', sortOrder: 17, isActive: true },
  { id: 'cat-other', code: 'other', name: 'Otros', description: 'Otros gastos', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 18, isActive: true },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', companyId: 'default', name: 'AgroInsumos S.A.', cuit: '30-71543210-8', contactName: 'Carlos Mendoza', phone: '+54 381 555-0101', email: 'carlos@agroinsumos.com', address: 'Av. Circunvalación 1200, Tucumán', status: 'active' },
  { id: 'sup-2', companyId: 'default', name: 'Semillas del Norte', cuit: '30-81234567-5', contactName: 'María López', phone: '+54 381 555-0102', email: 'maria@semillasnorte.com', address: 'Ruta 9 km 1305, Tucumán', status: 'active' },
  { id: 'sup-3', companyId: 'default', name: 'Fertilizantes Tucumán', cuit: '30-62345678-3', contactName: 'Juan Pérez', phone: '+54 381 555-0103', email: 'juan@fertitu.com', address: 'Calle Las Heras 500, Tucumán', status: 'active' },
  { id: 'sup-4', companyId: 'default', name: 'Maquinarias Agrícolas Litoral', cuit: '30-93456789-1', contactName: 'Roberto Díaz', phone: '+54 381 555-0104', email: 'roberto@mallitoral.com', address: 'Av. Independencia 2500, Tucumán', status: 'active' },
  { id: 'sup-5', companyId: 'default', name: 'Transporte Rural SRL', cuit: '30-84567890-7', contactName: 'Ana García', phone: '+54 381 555-0105', email: 'ana@transporterural.com', address: 'Ruta 38 km 800, Tucumán', status: 'active' },
  { id: 'sup-6', companyId: 'default', name: 'Combustibles Agro S.A.', cuit: '30-75678901-4', contactName: 'Pedro Sánchez', phone: '+54 381 555-0106', email: 'pedro@combustiblesagro.com', address: 'Av. Mate de Luna 800, Tucumán', status: 'active' },
  { id: 'sup-7', companyId: 'default', name: 'Laboratorio de Suelos INTA', cuit: '30-66789012-2', contactName: 'Dra. Laura Torres', phone: '+54 381 555-0107', email: 'ltorres@inta.gob.ar', address: 'Ruta 301 km 25, Tucumán', status: 'active' },
  { id: 'sup-8', companyId: 'default', name: 'Seguros Rurales S.A.', cuit: '30-57890123-9', contactName: 'Martín Ruiz', phone: '+54 381 555-0108', email: 'martin@segurosrurales.com', address: 'Av. Colón 600, Tucumán', status: 'active' },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const FIELDS = [
  { id: 'el-talita', name: 'El Talita', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'los-crespo', name: 'Los Crespo', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'la-merced', name: 'La Merced', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'san-antonio', name: 'San Antonio', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'la-loma', name: 'La Loma', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'santa-rosa', name: 'Santa Rosa', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'el-puesto', name: 'El Puesto', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'la-esperanza', name: 'La Esperanza', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'san-jose', name: 'San José', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
  { id: 'el-ochenta', name: 'El Ochenta', farmId: 'default-farm', farmName: 'Establecimiento Principal' },
];

const CATEGORIES = MOCK_COST_CATEGORIES;
const SUPPLIERS = MOCK_SUPPLIERS;

const DESCRIPTIONS: Record<string, string[]> = {
  seeds: ['Semilla de caña LCP 85-384', 'Semilla variedad TUCCP 77-42', 'Semilla RA 87-3', 'Semilla tratamiento pregerminativo'],
  fertilizers: ['Urea 46% granulado', 'Fosfato monoamónico (MAP)', 'Fosfato diamónico (DAP)', 'Cloruro de potasio', 'Sulfato de amonio', 'Mezcla NPK 15-15-15'],
  herbicides: ['Glifosato 48%', 'Atrazina 90%', '2,4-D Amínico', 'Metribuzina', 'Diurón', 'Amicarbazona'],
  insecticides: ['Imidacloprid 35%', 'Lambdacialotrina', 'Clorpirifos 48%', 'Tiametoxam', 'Cipermethrina'],
  fungicides: ['Azoxistrobina', 'Piraclostrobina', 'Tebuconazol', 'Carbendazim', 'Mancozeb'],
  fuel: ['Gasoil Grado 2', 'Gasoil Grado 3', 'Nafta Súper'],
  lubricants: ['Aceite motor 20W-50', 'Aceite hidráulico ISO 68', 'Grasa multiuso NLGI 2', 'Aceite de transmisión 80W-90'],
  machinery: ['Cosechadora John Deere S780', 'Tractor New Holland T8', 'Implemento de siembra', 'Pulverizadora autopropulsada', 'Rastra de discos', 'Cincel subsolador'],
  spareparts: ['Filtro de aceite', 'Filtro de combustible', 'Correa de distribución', 'Neumático agrícola 18.4-38', 'Batería 12V 100Ah', 'Cuchillas de cosechadora'],
  labor: ['Jornal cosecha manual', 'Jornal aplicación fitosanitarios', 'Jornal riego', 'Contratista siembra', 'Técnico agrícola'],
  irrigation: ['Agua riego superficial', 'Agua riego por pivote', 'Mantenimiento sistema riego', 'Electricidad bombeo'],
  transport: ['Flete caña a ingenio', 'Flete insumos', 'Flete maquinaria', 'Transporte personal'],
  external: ['Consultoría agronómica', 'Servicio de fumigación aérea', 'Análisis de suelo tercerizado', 'Asesoría contable'],
  lab: ['Análisis de suelo completo', 'Análisis foliar NPK', 'Análisis de agua de riego', 'Análisis de residuos'],
  taxes: ['Impuesto inmobiliario rural', 'Ingresos Brutos', 'IVA', 'Tasa municipal'],
  insurance: ['Seguro multirriesgo agrícola', 'Seguro de maquinaria', 'Seguro de responsabilidad civil'],
  maintenance: ['Mantenimiento preventivo tractor', 'Reparación de cosechadora', 'Mantenimiento sistema riego', 'Calibración de pulverizadora'],
  other: ['Gastos administrativos', 'Insumos de oficina', 'Capacitación', 'Viáticos'],
};

let costCounter = 0;

function generateCostItem(cat: CostCategory): CostItem {
  costCounter++;
  const field = FIELDS[costCounter % FIELDS.length];
  const supplier = SUPPLIERS[costCounter % SUPPLIERS.length];
  const descs = DESCRIPTIONS[cat.code] ?? ['Gasto general'];
  const desc = descs[costCounter % descs.length];
  const quantity = rand(1, 50);
  const unitPrice = rand(50, 15000);
  const amount = Math.round(quantity * unitPrice * 100) / 100;
  const daysBack = rand(0, 365);

  return {
    id: `cost-${cat.code}-${costCounter}`,
    companyId: 'default',
    farmId: field.farmId,
    farmName: field.farmName,
    fieldId: field.id,
    fieldName: field.name,
    costCategoryId: cat.id,
    costCategory: cat,
    supplierId: supplier.id,
    supplier,
    campaignId: daysBack < 180 ? 'camp-2025-2026' : 'camp-2024-2025',
    campaignName: daysBack < 180 ? 'Campaña 2025/2026' : 'Campaña 2024/2025',
    description: desc,
    quantity: Math.round(quantity * 100) / 100,
    unit: cat.code === 'fuel' ? 'L' : cat.code === 'labor' ? 'h' : cat.code === 'transport' ? 'km' : 'unidad',
    unitPrice: Math.round(unitPrice * 100) / 100,
    amount,
    currency: 'ARS',
    costDate: daysAgo(Math.floor(daysBack)),
    status: 'active',
    observations: Math.random() > 0.7 ? 'Incluido en lote' : undefined,
    createdAt: daysAgo(Math.floor(daysBack) - 1),
  };
}

export function generateMockCosts(count = 300): CostItem[] {
  costCounter = 0;
  const costs: CostItem[] = [];
  for (let i = 0; i < count; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    costs.push(generateCostItem(cat));
  }
  return costs;
}

export const MOCK_COSTS = generateMockCosts(300);

export function computeAnalytics(costs: CostItem[]): CostAnalytics {
  const totalAmount = costs.reduce((sum, c) => sum + c.amount, 0);

  const byCatMap = new Map<string, { name: string; total: number }>();
  for (const c of costs) {
    const id = c.costCategory?.id ?? 'unknown';
    const e = byCatMap.get(id);
    if (e) e.total += c.amount;
    else byCatMap.set(id, { name: c.costCategory?.name ?? 'Sin categoría', total: c.amount });
  }
  const totalByCategory = Array.from(byCatMap.entries())
    .map(([categoryId, v]) => ({
      categoryId, categoryName: v.name, total: Math.round(v.total * 100) / 100,
      percentage: totalAmount > 0 ? Math.round((v.total / totalAmount) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byFieldMap = new Map<string, { name: string; total: number }>();
  for (const c of costs) {
    const id = c.fieldId ?? 'unknown';
    const e = byFieldMap.get(id);
    if (e) e.total += c.amount;
    else byFieldMap.set(id, { name: c.fieldName ?? 'Sin campo', total: c.amount });
  }
  const totalByField = Array.from(byFieldMap.entries())
    .map(([fieldId, v]) => ({
      fieldId, fieldName: v.name, total: Math.round(v.total * 100) / 100,
      percentage: totalAmount > 0 ? Math.round((v.total / totalAmount) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byMonthMap = new Map<string, { month: string; year: number; total: number }>();
  for (const c of costs) {
    const d = new Date(c.costDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const e = byMonthMap.get(key);
    if (e) e.total += c.amount;
    else byMonthMap.set(key, {
      month: d.toLocaleString('es-AR', { month: 'long' }),
      year: d.getFullYear(),
      total: c.amount,
    });
  }
  const totalByMonth = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, total: Math.round(v.total * 100) / 100 }));

  const byCampMap = new Map<string, { name: string; total: number }>();
  for (const c of costs) {
    const id = c.campaignId;
    const e = byCampMap.get(id);
    if (e) e.total += c.amount;
    else byCampMap.set(id, { name: c.campaignName ?? 'Sin campaña', total: c.amount });
  }
  const totalByCampaign = Array.from(byCampMap.entries())
    .map(([campaignId, v]) => ({
      campaignId, campaignName: v.name, total: Math.round(v.total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total);

  const totalHa = 12.5 + 8.3 + 15.0 + 10.2 + 18.5 + 14.0 + 22.0 + 5.2 + 6.8 + 20.0;
  const costPerHectare = totalHa > 0 ? Math.round((totalAmount / totalHa) * 100) / 100 : 0;
  const uniqueMonths = byMonthMap.size || 1;
  const averageMonthlyCost = Math.round((totalAmount / uniqueMonths) * 100) / 100;

  return { totalAmount, totalByCategory, totalByField, totalByMonth, totalByCampaign, costPerHectare, averageMonthlyCost };
}

export function generateAlerts(costs: CostItem[], analytics: CostAnalytics): CostAlert[] {
  const alerts: CostAlert[] = [];
  const now = new Date().toISOString();

  const catAverages = MOCK_COST_CATEGORIES.map(cat => {
    const catCosts = costs.filter(c => c.costCategoryId === cat.id);
    const total = catCosts.reduce((s, c) => s + c.amount, 0);
    return { categoryId: cat.id, name: cat.name, total, count: catCosts.length };
  });

  const highCostCats = catAverages.filter(c => c.count > 0 && (c.total / c.count) > 8000);
  highCostCats.forEach(cat => {
    alerts.push({
      id: `alert-cat-${cat.categoryId}`,
      type: 'category_above_average',
      severity: 'high',
      title: `Categoría con costo elevado`,
      description: `${cat.name}: promedio $${(cat.total / cat.count).toLocaleString()} por registro`,
      amount: cat.total,
      timestamp: now,
    });
  });

  const fieldTotals = new Map<string, { name: string; total: number }>();
  for (const c of costs) {
    const fid = c.fieldId ?? 'unknown';
    const e = fieldTotals.get(fid);
    if (e) e.total += c.amount;
    else fieldTotals.set(fid, { name: c.fieldName ?? 'Sin campo', total: c.amount });
  }
  const avgFieldCost = fieldTotals.size > 0
    ? Array.from(fieldTotals.values()).reduce((s, f) => s + f.total, 0) / fieldTotals.size
    : 0;
  fieldTotals.forEach((f, fid) => {
    if (f.total > avgFieldCost * 1.5) {
      alerts.push({
        id: `alert-field-${fid}`,
        type: 'field_overage',
        severity: f.total > avgFieldCost * 2 ? 'critical' : 'medium',
        title: `Campo con gasto elevado`,
        description: `${f.name}: $${f.total.toLocaleString()} (promedio $${avgFieldCost.toLocaleString()})`,
        amount: f.total,
        percentage: Math.round(((f.total - avgFieldCost) / avgFieldCost) * 100),
        timestamp: now,
      });
    }
  });

  const monthTotals = analytics.totalByMonth;
  if (monthTotals.length >= 2) {
    const sorted = [...monthTotals].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month.localeCompare(b.month));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].total;
      const curr = sorted[i].total;
      if (prev > 0 && curr > prev * 2) {
        alerts.push({
          id: `alert-month-${sorted[i].month}-${sorted[i].year}`,
          type: 'high_cost',
          severity: 'high',
          title: `Incremento anormal en ${sorted[i].month}`,
          description: `Aumento del ${Math.round(((curr - prev) / prev) * 100)}% vs mes anterior`,
          amount: curr - prev,
          percentage: Math.round(((curr - prev) / prev) * 100),
          timestamp: now,
        });
      }
    }
  }

  const sortedCats = [...analytics.totalByCategory].sort((a, b) => b.total - a.total);
  for (let i = 1; i < sortedCats.length; i++) {
    const curr = sortedCats[i];
    const prev = sortedCats[i - 1];
    if (prev.total > 0 && curr.total > prev.total * 3) {
      alerts.push({
        id: `alert-dev-${curr.categoryId}`,
        type: 'significant_deviation',
        severity: 'low',
        title: `Desviación significativa`,
        description: `${curr.categoryName}: $${curr.total.toLocaleString()}`,
        amount: curr.total,
        percentage: Math.round(((curr.total - prev.total) / prev.total) * 100),
        timestamp: now,
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export const MOCK_COST_ANALYTICS = computeAnalytics(MOCK_COSTS);
export const MOCK_COST_ALERTS = generateAlerts(MOCK_COSTS, MOCK_COST_ANALYTICS);
