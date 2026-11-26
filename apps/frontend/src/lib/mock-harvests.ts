import type { Harvest, HarvestAnalytics } from '@/types/harvests';
import type { ShiResult, ShiBreakdown } from '@/types/shi';

const CAMPAIGNS = [
  { id: 'camp-2024-2025', name: 'Campaña 2024/2025' },
  { id: 'camp-2025-2026', name: 'Campaña 2025/2026' },
  { id: 'camp-2023-2024', name: 'Campaña 2023/2024' },
];

const VARIETIES = [
  { id: 'var-lcp-85384', name: 'LCP 85-384' },
  { id: 'var-tuccp-7742', name: 'TUCCP 77-42' },
  { id: 'var-ra-873', name: 'RA 87-3' },
  { id: 'var-cp-6547', name: 'CP 65-47' },
  { id: 'var-tuc-9507', name: 'TUC 95-07' },
];

const FIELDS = [
  { id: 'el-talita', name: 'El Talita' },
  { id: 'los-crespo', name: 'Los Crespo' },
  { id: 'la-merced', name: 'La Merced' },
  { id: 'san-antonio', name: 'San Antonio' },
  { id: 'la-loma', name: 'La Loma' },
  { id: 'santa-rosa', name: 'Santa Rosa' },
  { id: 'el-puesto', name: 'El Puesto' },
  { id: 'la-esperanza', name: 'La Esperanza' },
  { id: 'san-jose', name: 'San José' },
  { id: 'el-ochenta', name: 'El Ochenta' },
];

const METHODS = ['Mecánico', 'Manual', 'Semimecanizado'];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function rand(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let harvestCounter = 0;

function generateHarvest(): Harvest {
  harvestCounter++;
  const field = pick(FIELDS);
  const campaign = pick(CAMPAIGNS);
  const variety = pick(VARIETIES);
  const method = pick(METHODS);
  const tons = rand(300, 2000);
  const tonsPerHectare = rand(40, 120);
  const isCompleted = Math.random() > 0.15;

  return {
    id: `harvest-${field.id}-${harvestCounter}`,
    companyId: 'default',
    farmId: 'default-farm',
    farmName: 'Establecimiento Principal',
    fieldId: field.id,
    fieldName: field.name,
    campaignId: campaign.id,
    campaignName: campaign.name,
    varietyId: variety.id,
    varietyName: variety.name,
    startDate: daysAgo(Math.floor(rand(1, 400))),
    endDate: isCompleted ? daysAgo(Math.floor(rand(0, 10))) : undefined,
    responsible: ['Carlos Aguirre', 'Miguel Torres', 'Lucía Fernández', 'Pedro Gómez'][harvestCounter % 4],
    method,
    tons,
    tonsPerHectare,
    estimatedYield: rand(50, 130),
    sucrosePercentage: rand(10, 16),
    qualityGrade: tonsPerHectare > 90 ? 'A' : tonsPerHectare > 65 ? 'B' : 'C',
    humidity: rand(10, 18),
    status: isCompleted ? 'completed' : 'in_progress',
    observations: Math.random() > 0.7 ? 'Lote con buena uniformidad' : undefined,
    createdAt: daysAgo(Math.floor(rand(1, 400)) + 1),
  };
}

export function generateMockHarvests(count = 120): Harvest[] {
  harvestCounter = 0;
  return Array.from({ length: count }, generateHarvest);
}

export const MOCK_HARVESTS = generateMockHarvests(120);

export function computeHarvestAnalytics(harvests: Harvest[]): HarvestAnalytics {
  const totalTons = harvests.reduce((s, h) => s + h.tons, 0);

  const byFieldMap = new Map<string, { name: string; tons: number }>();
  for (const h of harvests) {
    const e = byFieldMap.get(h.fieldId);
    if (e) e.tons += h.tons;
    else byFieldMap.set(h.fieldId, { name: h.fieldName ?? 'Sin campo', tons: h.tons });
  }
  const totalByField = Array.from(byFieldMap.entries())
    .map(([fieldId, v]) => ({
      fieldId, fieldName: v.name, tons: Math.round(v.tons * 100) / 100,
      percentage: totalTons > 0 ? Math.round((v.tons / totalTons) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.tons - a.tons);

  const byCampMap = new Map<string, { name: string; tons: number }>();
  for (const h of harvests) {
    const e = byCampMap.get(h.campaignId);
    if (e) e.tons += h.tons;
    else byCampMap.set(h.campaignId, { name: h.campaignName ?? 'Sin campaña', tons: h.tons });
  }
  const totalByCampaign = Array.from(byCampMap.entries())
    .map(([campaignId, v]) => ({ campaignId, campaignName: v.name, tons: Math.round(v.tons * 100) / 100 }))
    .sort((a, b) => b.tons - a.tons);

  const byMonthMap = new Map<string, { month: string; year: number; tons: number }>();
  for (const h of harvests) {
    const d = new Date(h.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const e = byMonthMap.get(key);
    if (e) e.tons += h.tons;
    else byMonthMap.set(key, {
      month: d.toLocaleString('es-AR', { month: 'long' }),
      year: d.getFullYear(),
      tons: h.tons,
    });
  }
  const totalByMonth = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, tons: Math.round(v.tons * 100) / 100 }));

  const withYield = harvests.filter(h => h.tonsPerHectare != null);

  const bestField = withYield.length > 0
    ? withYield.reduce((best, h) => (h.tonsPerHectare! > (best.tonsPerHectare ?? 0) ? h : best))
    : null;
  const worstField = withYield.length > 0
    ? withYield.reduce((worst, h) => (h.tonsPerHectare! < (worst.tonsPerHectare ?? Infinity) ? h : worst))
    : null;

  const withSucrose = harvests.filter(h => h.sucrosePercentage != null);
  const averageSucrose = withSucrose.length > 0
    ? Math.round((withSucrose.reduce((s, h) => s + (h.sucrosePercentage ?? 0), 0) / withSucrose.length) * 100) / 100
    : 0;

  const withYieldField = harvests.filter(h => h.tonsPerHectare != null);
  const averageTonsPerHectare = withYieldField.length > 0
    ? Math.round((withYieldField.reduce((s, h) => s + (h.tonsPerHectare ?? 0), 0) / withYieldField.length) * 100) / 100
    : 0;

  return {
    totalTons: Math.round(totalTons * 100) / 100,
    averageTonsPerHectare,
    totalByField,
    totalByCampaign,
    totalByMonth,
    bestField: bestField ? { fieldId: bestField.fieldId, fieldName: bestField.fieldName!, tonsPerHectare: bestField.tonsPerHectare! } : null,
    worstField: worstField ? { fieldId: worstField.fieldId, fieldName: worstField.fieldName!, tonsPerHectare: worstField.tonsPerHectare! } : null,
    averageSucrose,
    totalHarvests: harvests.length,
  };
}

export const MOCK_HARVEST_ANALYTICS = computeHarvestAnalytics(MOCK_HARVESTS);

function calcShiScore(healthScore: number | null): number {
  if (healthScore === null) return 50;
  return Math.max(0, Math.min(100, healthScore));
}

function calcShiFieldStatus(status: string): number {
  const map: Record<string, number> = { active: 90, in_progress: 80, completed: 60, planned: 50, cancelled: 10 };
  return map[status] ?? 50;
}

function calcShiAlerts(count: number): number {
  if (count === 0) return 100;
  if (count === 1) return 70;
  if (count <= 3) return 40;
  return 10;
}

function calcShiActivities(recent: number, delays: number): number {
  let s = recent >= 5 ? 100 : recent >= 3 ? 80 : recent >= 1 ? 60 : 30;
  if (delays > 0) s = Math.max(0, s - 30);
  return s;
}

function calcShiProduction(tons: number | null): number {
  if (tons === null) return 50;
  if (tons >= 2000) return 100;
  if (tons >= 1000) return 75;
  if (tons >= 500) return 50;
  return 25;
}

function calcShiCosts(costs: number): number {
  if (costs <= 0) return 80;
  if (costs < 50000) return 90;
  if (costs < 100000) return 70;
  if (costs < 200000) return 50;
  return 30;
}

function calcShiSanitary(condition: string): number {
  const map: Record<string, number> = { good: 90, fair: 60, poor: 20, unknown: 50 };
  return map[condition] ?? 50;
}

export function computeFieldShi(fieldId: string, harvests: Harvest[]): ShiResult {
  const fieldHarvests = harvests.filter(h => h.fieldId === fieldId);
  const totalTons = fieldHarvests.reduce((s, h) => s + h.tons, 0);
  const avgYield = fieldHarvests.length > 0
    ? fieldHarvests.reduce((s, h) => s + (h.tonsPerHectare ?? 0), 0) / fieldHarvests.length
    : null;
  const activeAlerts = Math.floor(Math.random() * 3);
  const recentActivities = Math.floor(Math.random() * 5);
  const hasDelays = Math.random() > 0.7 ? 1 : 0;
  const accumulatedCosts = Math.floor(Math.random() * 200000);

  const health = avgYield !== null ? Math.min(100, Math.max(0, avgYield * 1.2)) : null;

  const breakdown: ShiBreakdown = {
    healthScore: calcShiScore(health),
    fieldStatus: calcShiFieldStatus(fieldHarvests.length > 0 ? 'completed' : 'planned'),
    alerts: calcShiAlerts(activeAlerts),
    activities: calcShiActivities(recentActivities, hasDelays),
    production: calcShiProduction(totalTons),
    costs: calcShiCosts(accumulatedCosts),
    sanitary: calcShiSanitary(health && health >= 70 ? 'good' : health && health >= 40 ? 'fair' : 'poor'),
  };

  const weights = {
    healthScore: 0.25, fieldStatus: 0.15, alerts: 0.15,
    activities: 0.15, production: 0.10, costs: 0.10, sanitary: 0.10,
  };

  const weightedScore = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + breakdown[key as keyof ShiBreakdown] * weight, 0,
  );

  const score = Math.round(Math.max(0, Math.min(100, weightedScore)));

  return {
    score,
    level: score >= 80 ? 'excelente' : score >= 60 ? 'bueno' : score >= 40 ? 'regular' : 'critico',
    breakdown,
    calculatedAt: new Date(),
  };
}

export function computeAllFieldsShi(harvests: Harvest[]): Map<string, ShiResult> {
  const uniqueFields = [...new Set(harvests.map(h => h.fieldId))];
  const map = new Map<string, ShiResult>();
  for (const fid of uniqueFields) {
    map.set(fid, computeFieldShi(fid, harvests));
  }
  return map;
}

export const MOCK_FIELD_SHI = computeAllFieldsShi(MOCK_HARVESTS);
