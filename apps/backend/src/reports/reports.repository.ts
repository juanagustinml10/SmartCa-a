import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  IReportsRepository,
  ReportFilters,
  ReportContext,
  ProductionReport,
  CostReport,
  ProfitabilityReport,
  FieldsReport,
  ActivitiesReport,
  CampaignsReport,
  SummaryReport,
  Variation,
} from './interfaces/reports-repository.interface.js';
import type { Prisma } from '../generated/prisma/client.js';

const round = (n: number, d = 2): number => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

const pct = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 10000) / 100 : 0;

@Injectable()
export class ReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- helpers ----------

  private harvestWhere(filters: ReportFilters): Prisma.HarvestWhereInput {
    const where: Prisma.HarvestWhereInput = { deletedAt: null, companyId: filters.companyId };
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    }
    return where;
  }

  private costWhere(filters: ReportFilters): Prisma.CostWhereInput {
    const where: Prisma.CostWhereInput = { deletedAt: null, companyId: filters.companyId };
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.startDate || filters.endDate) {
      where.costDate = {};
      if (filters.startDate) where.costDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.costDate.lte = new Date(filters.endDate);
    }
    return where;
  }

  private fieldWhere(filters: ReportFilters): Prisma.FieldWhereInput {
    const where: Prisma.FieldWhereInput = {
      deletedAt: null,
      farm: { companyId: filters.companyId, deletedAt: null },
    };
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.id = filters.fieldId;
    return where;
  }

  private activityWhere(filters: ReportFilters): Prisma.ActivityWhereInput {
    const where: Prisma.ActivityWhereInput = {
      deletedAt: null,
      field: { deletedAt: null, farm: { companyId: filters.companyId, deletedAt: null } },
    };
    if (filters.farmId) where.field = { farmId: filters.farmId };
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.startDate || filters.endDate) {
      where.activityDate = {};
      if (filters.startDate) where.activityDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.activityDate.lte = new Date(filters.endDate);
    }
    return where;
  }

  private previousWindow(filters: ReportFilters): ReportFilters {
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;
    if (!start && !end) return filters;
    const len = end && start ? end.getTime() - start.getTime() : 0;
    const prevEnd = start ? new Date(start.getTime() - 1) : end;
    const prevStart = prevEnd ? new Date(prevEnd.getTime() - (len || 365 * 24 * 3600 * 1000)) : null;
    return {
      ...filters,
      startDate: prevStart ? prevStart.toISOString().slice(0, 10) : undefined,
      endDate: prevEnd ? prevEnd.toISOString().slice(0, 10) : undefined,
    };
  }

  // ---------- context ----------

  async getContext(filters: ReportFilters): Promise<ReportContext> {
    const [company, farm, field, campaign] = await Promise.all([
      this.prisma.company.findFirst({ where: { id: filters.companyId, deletedAt: null } }),
      filters.farmId
        ? this.prisma.farm.findFirst({ where: { id: filters.farmId, companyId: filters.companyId, deletedAt: null } })
        : Promise.resolve(null),
      filters.fieldId
        ? this.prisma.field.findFirst({
            where: { id: filters.fieldId, deletedAt: null, farm: { companyId: filters.companyId, deletedAt: null } },
          })
        : Promise.resolve(null),
      filters.campaignId
        ? this.prisma.campaign.findUnique({ where: { id: filters.campaignId } })
        : Promise.resolve(null),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      companyName: company?.name ?? 'Sin empresa',
      filters: {
        farmId: filters.farmId ?? null,
        farmName: farm?.name ?? null,
        fieldId: filters.fieldId ?? null,
        fieldName: field?.name ?? null,
        campaignId: filters.campaignId ?? null,
        campaignName: campaign?.name ?? null,
        startDate: filters.startDate ?? null,
        endDate: filters.endDate ?? null,
      },
    };
  }

  // ---------- production ----------

  async getProduction(
    filters: ReportFilters,
  ): Promise<Omit<ProductionReport, keyof ReportContext> & { variation: Variation | null }> {
    const [rows, fields, prevRows] = await Promise.all([
      this.prisma.harvest.findMany({
        where: this.harvestWhere(filters),
        select: {
          id: true,
          tons: true,
          tonsPerHectare: true,
          sucrosePercentage: true,
          startDate: true,
          field: { select: { id: true, name: true, areaHectares: true } },
          campaign: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.field.findMany({ where: this.fieldWhere(filters), select: { id: true, areaHectares: true } }),
      this.prisma.harvest.findMany({
        where: this.harvestWhere(this.previousWindow(filters)),
        select: { tons: true },
      }),
    ]);

    const totalTons = round(rows.reduce((s, r) => s + Number(r.tons), 0));
    const totalHarvests = rows.length;
    const validTph = rows.filter((r) => r.tonsPerHectare !== null);
    const averageTonsPerHectare =
      validTph.length > 0 ? round(validTph.reduce((s, r) => s + Number(r.tonsPerHectare), 0) / validTph.length) : 0;
    const validSucrose = rows.filter((r) => r.sucrosePercentage !== null);
    const averageSucrose =
      validSucrose.length > 0 ? round(validSucrose.reduce((s, r) => s + Number(r.sucrosePercentage), 0) / validSucrose.length) : 0;
    const totalAreaHectares = round(fields.reduce((s, f) => s + Number(f.areaHectares), 0));

    const byFieldMap = new Map<string, { name: string; area: number; tons: number; tphSum: number; tphCount: number }>();
    for (const r of rows) {
      const id = r.field?.id ?? 'unknown';
      const e = byFieldMap.get(id) ?? { name: r.field?.name ?? 'Sin campo', area: Number(r.field?.areaHectares ?? 0), tons: 0, tphSum: 0, tphCount: 0 };
      e.tons += Number(r.tons);
      if (r.tonsPerHectare !== null) {
        e.tphSum += Number(r.tonsPerHectare);
        e.tphCount++;
      }
      byFieldMap.set(id, e);
    }
    const byField = Array.from(byFieldMap.entries())
      .map(([fieldId, v]) => ({
        fieldId,
        fieldName: v.name,
        areaHectares: v.area,
        tons: round(v.tons),
        tonsPerHectare: v.tphCount > 0 ? round(v.tphSum / v.tphCount) : 0,
        percentage: pct(v.tons, totalTons),
      }))
      .sort((a, b) => b.tons - a.tons);

    const byCampMap = new Map<string, { code: string; name: string; tons: number }>();
    for (const r of rows) {
      const id = r.campaign?.id ?? 'unknown';
      const e = byCampMap.get(id) ?? { code: r.campaign?.code ?? '', name: r.campaign?.name ?? 'Sin campaña', tons: 0 };
      e.tons += Number(r.tons);
      byCampMap.set(id, e);
    }
    const byCampaign = Array.from(byCampMap.entries())
      .map(([campaignId, v]) => ({
        campaignId,
        campaignName: v.name,
        campaignCode: v.code,
        value: round(v.tons),
        percentage: pct(v.tons, totalTons),
      }))
      .sort((a, b) => b.value - a.value);

    const byMonthMap = new Map<string, { year: number; month: string; value: number }>();
    for (const r of rows) {
      const d = new Date(r.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const e = byMonthMap.get(key) ?? {
        year: d.getFullYear(),
        month: d.toLocaleString('es-AR', { month: 'long' }),
        value: 0,
      };
      e.value += Number(r.tons);
      byMonthMap.set(key, e);
    }
    const byMonth = Array.from(byMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, value: round(v.value) }));

    let bestField: ProductionReport['bestField'] = null;
    let worstField: ProductionReport['worstField'] = null;
    for (const [fieldId, v] of byFieldMap) {
      const tph = v.tphCount > 0 ? v.tphSum / v.tphCount : 0;
      if (!bestField || tph > bestField.tonsPerHectare) bestField = { fieldId, fieldName: v.name, tonsPerHectare: round(tph) };
      if (!worstField || (v.tphCount > 0 && tph < worstField.tonsPerHectare)) worstField = { fieldId, fieldName: v.name, tonsPerHectare: round(tph) };
    }

    const previousTons = round(prevRows.reduce((s, r) => s + Number(r.tons), 0));
    const variation: Variation | null =
      prevRows.length > 0
        ? { previousValue: previousTons, variationPercent: previousTons > 0 ? round(((totalTons - previousTons) / previousTons) * 100) : 0 }
        : null;

    return {
      totalTons,
      totalHarvests,
      averageTonsPerHectare,
      averageSucrose,
      totalAreaHectares,
      byField,
      byCampaign,
      byMonth,
      bestField,
      worstField,
      variation,
    };
  }

  // ---------- costs ----------

  async getCosts(
    filters: ReportFilters,
  ): Promise<Omit<CostReport, keyof ReportContext> & { variation: Variation | null }> {
    const [rows, fields, harvests, prevRows] = await Promise.all([
      this.prisma.cost.findMany({
        where: this.costWhere(filters),
        select: {
          id: true,
          amount: true,
          costDate: true,
          costCategory: { select: { id: true, name: true, color: true } },
          field: { select: { id: true, name: true } },
          campaign: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.field.findMany({ where: this.fieldWhere(filters), select: { id: true, areaHectares: true } }),
      this.prisma.harvest.findMany({ where: this.harvestWhere(filters), select: { tons: true } }),
      this.prisma.cost.findMany({ where: this.costWhere(this.previousWindow(filters)), select: { amount: true } }),
    ]);

    const totalAmount = round(rows.reduce((s, r) => s + Number(r.amount), 0));
    const totalCosts = rows.length;
    const totalAreaHectares = fields.reduce((s, f) => s + Number(f.areaHectares), 0);
    const totalTons = harvests.reduce((s, h) => s + Number(h.tons), 0);
    const costPerHectare = totalAreaHectares > 0 ? round(totalAmount / totalAreaHectares) : 0;
    const costPerTon = totalTons > 0 ? round(totalAmount / totalTons) : 0;

    const monthsSet = new Set(rows.map((r) => new Date(r.costDate).toISOString().slice(0, 7)));
    const averageMonthlyCost = monthsSet.size > 0 ? round(totalAmount / monthsSet.size) : 0;

    const byCatMap = new Map<string, { name: string; color: string | null; total: number }>();
    for (const r of rows) {
      const id = r.costCategory?.id ?? 'unknown';
      const e = byCatMap.get(id) ?? { name: r.costCategory?.name ?? 'Sin categoría', color: r.costCategory?.color ?? null, total: 0 };
      e.total += Number(r.amount);
      byCatMap.set(id, e);
    }
    const byCategory = Array.from(byCatMap.entries())
      .map(([categoryId, v]) => ({ categoryId, categoryName: v.name, color: v.color, total: round(v.total), percentage: pct(v.total, totalAmount) }))
      .sort((a, b) => b.total - a.total);

    const byFieldMap = new Map<string, { name: string; total: number }>();
    for (const r of rows) {
      const id = r.field?.id ?? 'unknown';
      const e = byFieldMap.get(id) ?? { name: r.field?.name ?? 'Sin campo', total: 0 };
      e.total += Number(r.amount);
      byFieldMap.set(id, e);
    }
    const byField = Array.from(byFieldMap.entries())
      .map(([fieldId, v]) => ({ fieldId, fieldName: v.name, total: round(v.total), percentage: pct(v.total, totalAmount) }))
      .sort((a, b) => b.total - a.total);

    const byCampMap = new Map<string, { code: string; name: string; total: number }>();
    for (const r of rows) {
      const id = r.campaign?.id ?? 'unknown';
      const e = byCampMap.get(id) ?? { code: r.campaign?.code ?? '', name: r.campaign?.name ?? 'Sin campaña', total: 0 };
      e.total += Number(r.amount);
      byCampMap.set(id, e);
    }
    const byCampaign = Array.from(byCampMap.entries())
      .map(([campaignId, v]) => ({ campaignId, campaignName: v.name, campaignCode: v.code, value: round(v.total), percentage: pct(v.total, totalAmount) }))
      .sort((a, b) => b.value - a.value);

    const byMonthMap = new Map<string, { year: number; month: string; value: number }>();
    for (const r of rows) {
      const d = new Date(r.costDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const e = byMonthMap.get(key) ?? { year: d.getFullYear(), month: d.toLocaleString('es-AR', { month: 'long' }), value: 0 };
      e.value += Number(r.amount);
      byMonthMap.set(key, e);
    }
    const byMonth = Array.from(byMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, value: round(v.value) }));

    const previousAmount = round(prevRows.reduce((s, r) => s + Number(r.amount), 0));
    const variation: Variation | null =
      prevRows.length > 0
        ? { previousValue: previousAmount, variationPercent: previousAmount > 0 ? round(((totalAmount - previousAmount) / previousAmount) * 100) : 0 }
        : null;

    return { totalAmount, totalCosts, costPerHectare, costPerTon, averageMonthlyCost, byCategory, byField, byCampaign, byMonth, variation };
  }

  // ---------- profitability ----------

  async getProfitability(filters: ReportFilters, pricePerTon: number): Promise<Omit<ProfitabilityReport, keyof ReportContext>> {
    const [harvests, costs] = await Promise.all([
      this.prisma.harvest.findMany({
        where: this.harvestWhere(filters),
        select: {
          tons: true,
          field: { select: { id: true, name: true, areaHectares: true } },
          campaign: { select: { id: true, name: true } },
        },
      }),
      this.prisma.cost.findMany({
        where: this.costWhere(filters),
        select: { amount: true, field: { select: { id: true, name: true } }, campaign: { select: { id: true, name: true } } },
      }),
    ]);

    const totalTons = harvests.reduce((s, h) => s + Number(h.tons), 0);
    const revenue = round(totalTons * pricePerTon);
    const totalCost = round(costs.reduce((s, c) => s + Number(c.amount), 0));
    const profit = round(revenue - totalCost);
    const margin = revenue > 0 ? round((profit / revenue) * 100) : 0;
    const roi = totalCost > 0 ? round((profit / totalCost) * 100) : 0;

    const fieldMap = new Map<string, { name: string; area: number; tons: number; cost: number }>();
    const touch = (id: string, name: string, area: number) => {
      if (!fieldMap.has(id)) fieldMap.set(id, { name, area, tons: 0, cost: 0 });
    };
    for (const h of harvests) {
      const id = h.field?.id ?? 'unknown';
      touch(id, h.field?.name ?? 'Sin campo', Number(h.field?.areaHectares ?? 0));
      fieldMap.get(id)!.tons += Number(h.tons);
    }
    for (const c of costs) {
      const id = c.field?.id ?? 'unknown';
      touch(id, c.field?.name ?? 'Sin campo', 0);
      fieldMap.get(id)!.cost += Number(c.amount);
    }
    const byField = Array.from(fieldMap.entries())
      .map(([fieldId, v]) => {
        const rev = round(v.tons * pricePerTon);
        const cost = round(v.cost);
        const pr = round(rev - cost);
        return { fieldId, fieldName: v.name, tons: round(v.tons), areaHectares: v.area, revenue: rev, cost, profit: pr, margin: rev > 0 ? pct(pr, rev) : 0 };
      })
      .sort((a, b) => b.profit - a.profit);

    const campMap = new Map<string, { name: string; tons: number; cost: number }>();
    const touchCamp = (id: string, name: string) => {
      if (!campMap.has(id)) campMap.set(id, { name, tons: 0, cost: 0 });
    };
    for (const h of harvests) {
      const id = h.campaign?.id ?? 'unknown';
      touchCamp(id, h.campaign?.name ?? 'Sin campaña');
      campMap.get(id)!.tons += Number(h.tons);
    }
    for (const c of costs) {
      const id = c.campaign?.id ?? 'unknown';
      touchCamp(id, c.campaign?.name ?? 'Sin campaña');
      campMap.get(id)!.cost += Number(c.amount);
    }
    const byCampaign = Array.from(campMap.entries())
      .map(([campaignId, v]) => {
        const rev = round(v.tons * pricePerTon);
        const cost = round(v.cost);
        const pr = round(rev - cost);
        return { campaignId, campaignName: v.name, revenue: rev, cost, profit: pr, margin: rev > 0 ? pct(pr, rev) : 0 };
      })
      .sort((a, b) => b.profit - a.profit);

    const bestField = byField.length > 0 ? { fieldId: byField[0].fieldId, fieldName: byField[0].fieldName, profit: byField[0].profit, margin: byField[0].margin } : null;
    const worstField = byField.length > 0 ? { fieldId: byField[byField.length - 1].fieldId, fieldName: byField[byField.length - 1].fieldName, profit: byField[byField.length - 1].profit, margin: byField[byField.length - 1].margin } : null;
    const bestCampaign = byCampaign.length > 0 ? { campaignId: byCampaign[0].campaignId, campaignName: byCampaign[0].campaignName, profit: byCampaign[0].profit, margin: byCampaign[0].margin } : null;

    const totalArea = byField.reduce((s, f) => s + f.areaHectares, 0);

    return {
      pricePerTon,
      revenue,
      totalCost,
      profit,
      margin,
      roi,
      profitabilityPerHectare: totalArea > 0 ? round(profit / totalArea) : 0,
      profitabilityPerTon: totalTons > 0 ? round(profit / totalTons) : 0,
      byField,
      byCampaign,
      bestField,
      worstField,
      bestCampaign,
    };
  }

  // ---------- fields ----------

  async getFields(filters: ReportFilters): Promise<Omit<FieldsReport, keyof ReportContext>> {
    const [fields, harvests, costs] = await Promise.all([
      this.prisma.field.findMany({
        where: this.fieldWhere(filters),
        select: {
          id: true,
          name: true,
          areaHectares: true,
          ratoonNumber: true,
          healthScore: true,
          shiScore: true,
          shiLevel: true,
          estimatedProduction: true,
          lastActivityAt: true,
          fieldStatus: { select: { code: true, name: true } },
          variety: { select: { name: true } },
          farm: { select: { name: true } },
        },
      }),
      this.prisma.harvest.findMany({
        where: this.harvestWhere(filters),
        select: { tons: true, fieldId: true },
      }),
      this.prisma.cost.findMany({
        where: this.costWhere(filters),
        select: { amount: true, fieldId: true },
      }),
    ]);

    const tonsByField = new Map<string, number>();
    for (const h of harvests) {
      if (!h.fieldId) continue;
      tonsByField.set(h.fieldId, (tonsByField.get(h.fieldId) ?? 0) + Number(h.tons));
    }
    const costByField = new Map<string, number>();
    for (const c of costs) {
      if (!c.fieldId) continue;
      costByField.set(c.fieldId, (costByField.get(c.fieldId) ?? 0) + Number(c.amount));
    }

    const byField = fields.map((f) => ({
      fieldId: f.id,
      fieldName: f.name,
      farmName: f.farm?.name ?? '',
      areaHectares: Number(f.areaHectares),
      status: f.fieldStatus?.code ?? null,
      varietyName: f.variety?.name ?? null,
      ratoonNumber: f.ratoonNumber,
      healthScore: f.healthScore,
      shiScore: f.shiScore,
      shiLevel: f.shiLevel,
      estimatedProduction: f.estimatedProduction !== null ? Number(f.estimatedProduction) : null,
      tons: round(tonsByField.get(f.id) ?? 0),
      totalCost: round(costByField.get(f.id) ?? 0),
      lastActivityAt: f.lastActivityAt ? f.lastActivityAt.toISOString() : null,
    }));

    const totalFields = byField.length;
    const totalAreaHectares = round(byField.reduce((s, f) => s + f.areaHectares, 0));
    const shiValues = byField.filter((f) => f.shiScore !== null).map((f) => f.shiScore as number);
    const averageShi = shiValues.length > 0 ? round(shiValues.reduce((s, v) => s + v, 0) / shiValues.length) : 0;
    const healthValues = byField.filter((f) => f.healthScore !== null).map((f) => f.healthScore as number);
    const averageHealthScore = healthValues.length > 0 ? round(healthValues.reduce((s, v) => s + v, 0) / healthValues.length) : 0;

    return { totalFields, totalAreaHectares, averageShi, averageHealthScore, byField };
  }

  // ---------- activities ----------

  async getActivities(filters: ReportFilters): Promise<Omit<ActivitiesReport, keyof ReportContext>> {
    const [rows, recent] = await Promise.all([
      this.prisma.activity.findMany({
        where: this.activityWhere(filters),
        select: {
          id: true,
          title: true,
          activityDate: true,
          field: { select: { id: true, name: true } },
          activityType: { select: { id: true, name: true, icon: true } },
        },
      }),
      this.prisma.activity.findMany({
        where: this.activityWhere(filters),
        orderBy: { activityDate: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          activityDate: true,
          field: { select: { name: true } },
          activityType: { select: { name: true } },
        },
      }),
    ]);

    const totalActivities = rows.length;

    const byTypeMap = new Map<string, { name: string; icon: string | null; count: number }>();
    for (const r of rows) {
      const id = r.activityType?.id ?? 'unknown';
      const e = byTypeMap.get(id) ?? { name: r.activityType?.name ?? 'Sin tipo', icon: r.activityType?.icon ?? null, count: 0 };
      e.count++;
      byTypeMap.set(id, e);
    }
    const byType = Array.from(byTypeMap.entries())
      .map(([activityTypeId, v]) => ({ activityTypeId, activityTypeName: v.name, icon: v.icon, count: v.count, percentage: pct(v.count, totalActivities) }))
      .sort((a, b) => b.count - a.count);

    const byFieldMap = new Map<string, { name: string; count: number }>();
    for (const r of rows) {
      const id = r.field?.id ?? 'unknown';
      const e = byFieldMap.get(id) ?? { name: r.field?.name ?? 'Sin campo', count: 0 };
      e.count++;
      byFieldMap.set(id, e);
    }
    const byField = Array.from(byFieldMap.entries())
      .map(([fieldId, v]) => ({ fieldId, fieldName: v.name, count: v.count, percentage: pct(v.count, totalActivities) }))
      .sort((a, b) => b.count - a.count);

    const byMonthMap = new Map<string, { year: number; month: string; value: number }>();
    for (const r of rows) {
      const d = new Date(r.activityDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const e = byMonthMap.get(key) ?? { year: d.getFullYear(), month: d.toLocaleString('es-AR', { month: 'long' }), value: 0 };
      e.value++;
      byMonthMap.set(key, e);
    }
    const byMonth = Array.from(byMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, value: v.value }));

    return {
      totalActivities,
      byType,
      byField,
      byMonth,
      recent: recent.map((r) => ({
        id: r.id,
        title: r.title,
        activityDate: r.activityDate.toISOString(),
        fieldName: r.field?.name ?? 'Sin campo',
        activityTypeName: r.activityType?.name ?? 'Sin tipo',
      })),
    };
  }

  // ---------- campaigns ----------

  async getCampaigns(filters: ReportFilters): Promise<Omit<CampaignsReport, keyof ReportContext>> {
    const [harvests, costs] = await Promise.all([
      this.prisma.harvest.findMany({
        where: this.harvestWhere(filters),
        select: { tons: true, campaign: { select: { id: true, code: true, name: true, startDate: true, endDate: true, isActive: true } } },
      }),
      this.prisma.cost.findMany({
        where: this.costWhere(filters),
        select: { amount: true, campaign: { select: { id: true, code: true, name: true, startDate: true, endDate: true, isActive: true } } },
      }),
    ]);

    const campMap = new Map<string, { campaignId: string; code: string; name: string; startDate: Date; endDate: Date | null; isActive: boolean; tons: number; cost: number }>();
    const touch = (c: { id: string; code: string; name: string; startDate: Date; endDate: Date | null; isActive: boolean }) => {
      if (!campMap.has(c.id)) campMap.set(c.id, { campaignId: c.id, code: c.code, name: c.name, startDate: c.startDate, endDate: c.endDate, isActive: c.isActive, tons: 0, cost: 0 });
    };
    for (const h of harvests) {
      if (!h.campaign) continue;
      touch(h.campaign);
      campMap.get(h.campaign.id)!.tons += Number(h.tons);
    }
    for (const c of costs) {
      if (!c.campaign) continue;
      touch(c.campaign);
      campMap.get(c.campaign.id)!.cost += Number(c.amount);
    }

    const pricePerTon = await this.getPricePerTon(filters.companyId);
    const campaigns = Array.from(campMap.values())
      .map((c) => {
        const revenue = round(c.tons * pricePerTon);
        const cost = round(c.cost);
        const profit = round(revenue - cost);
        return {
          campaignId: c.campaignId,
          code: c.code,
          name: c.name,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate ? c.endDate.toISOString() : null,
          isActive: c.isActive,
          totalTons: round(c.tons),
          totalCost: cost,
          revenue,
          profit,
          margin: revenue > 0 ? pct(profit, revenue) : 0,
        };
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const bestCampaign = campaigns.length > 0 ? { campaignId: campaigns[0].campaignId, campaignName: campaigns[0].name, profit: campaigns[0].profit, margin: campaigns[0].margin } : null;

    const sortedByTons = [...campaigns].sort((a, b) => b.totalTons - a.totalTons);
    const productionVariation: Variation | null = sortedByTons.length > 1 ? { previousValue: sortedByTons[1].totalTons, variationPercent: sortedByTons[1].totalTons > 0 ? round(((sortedByTons[0].totalTons - sortedByTons[1].totalTons) / sortedByTons[1].totalTons) * 100) : 0 } : null;
    const sortedByCost = [...campaigns].sort((a, b) => b.totalCost - a.totalCost);
    const costVariation: Variation | null = sortedByCost.length > 1 ? { previousValue: sortedByCost[1].totalCost, variationPercent: sortedByCost[1].totalCost > 0 ? round(((sortedByCost[0].totalCost - sortedByCost[1].totalCost) / sortedByCost[1].totalCost) * 100) : 0 } : null;

    return { campaigns, bestCampaign, productionVariation, costVariation };
  }

  // ---------- summary ----------

  async getSummary(filters: ReportFilters): Promise<Omit<SummaryReport, keyof ReportContext>> {
    const [production, costs, profitability, fields, activities, alerts] = await Promise.all([
      this.getProduction(filters),
      this.getCosts(filters),
      this.getProfitability(filters, await this.getPricePerTon(filters.companyId)),
      this.getFields(filters),
      this.getActivities(filters),
      this.prisma.fieldAlert.findMany({
        where: { field: { deletedAt: null, farm: { companyId: filters.companyId, deletedAt: null } } },
        select: { priority: true },
      }),
    ]);

    const activeCampaign = await this.prisma.campaign.findFirst({ where: { isActive: true } });
    const critical = alerts.filter((a) => a.priority.toLowerCase() === 'critical').length;
    const high = alerts.filter((a) => a.priority.toLowerCase() === 'high').length;

    const overallScore = round(
      Math.max(0, Math.min(100, 40 + (production.averageTonsPerHectare / 100) * 30 - costs.costPerHectare / 2000 + (fields.averageShi - 50) * 0.2)),
    );

    return {
      production: {
        totalTons: production.totalTons,
        averageTonsPerHectare: production.averageTonsPerHectare,
        bestField: production.bestField,
      },
      costs: { totalAmount: costs.totalAmount, costPerHectare: costs.costPerHectare, costPerTon: costs.costPerTon },
      profitability: { revenue: profitability.revenue, profit: profitability.profit, margin: profitability.margin, roi: profitability.roi },
      fields: { totalFields: fields.totalFields, totalAreaHectares: fields.totalAreaHectares, averageShi: fields.averageShi },
      activities: { totalActivities: activities.totalActivities },
      campaigns: { activeCampaign: activeCampaign?.name ?? null, bestCampaign: (profitability as unknown as { bestCampaign?: { campaignName: string } | null }).bestCampaign?.campaignName ?? null },
      alerts: { total: alerts.length, critical, high },
      overallScore,
    };
  }

  // ---------- misc ----------

  async getPricePerTon(companyId: string): Promise<number> {
    const setting = await this.prisma.setting.findUnique({
      where: { companyId_key: { companyId, key: 'price_per_ton' } },
    });
    const value = setting ? Number(setting.value) : NaN;
    return Number.isFinite(value) && value > 0 ? value : 45000;
  }

  async listFarms(companyId: string): Promise<{ id: string; name: string }[]> {
    const farms = await this.prisma.farm.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return farms;
  }

  async listFields(companyId: string): Promise<{ id: string; name: string; farmId: string }[]> {
    const fields = await this.prisma.field.findMany({
      where: { deletedAt: null, farm: { companyId, deletedAt: null } },
      select: { id: true, name: true, farmId: true },
      orderBy: { name: 'asc' },
    });
    return fields;
  }

  async listCampaigns(companyId: string): Promise<{ id: string; code: string; name: string; isActive: boolean }[]> {
    const [campaigns, harvests, costs] = await Promise.all([
      this.prisma.campaign.findMany({ orderBy: { startDate: 'desc' } }),
      this.prisma.harvest.findMany({ where: { companyId, deletedAt: null }, select: { campaignId: true } }),
      this.prisma.cost.findMany({ where: { companyId, deletedAt: null }, select: { campaignId: true } }),
    ]);
    const used = new Set<string>([...harvests.map((h) => h.campaignId), ...costs.map((c) => c.campaignId)]);
    return campaigns
      .filter((c) => used.has(c.id))
      .map((c) => ({ id: c.id, code: c.code, name: c.name, isActive: c.isActive }));
  }
}
