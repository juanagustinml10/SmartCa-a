import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  DashboardAlert,
  DashboardCostCategory,
  DashboardCostPoint,
  DashboardField,
  DashboardFieldStatus,
  DashboardOverview,
  DashboardProductionPoint,
  DashboardTrend,
  DashboardTrends,
} from '@smartcana/types';

interface DashboardQuery {
  from?: string;
  to?: string;
  campaignId?: string;
}

function parseDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  }
  return new Date(value);
}

function num(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function trend(current: number, previous: number): DashboardTrend {
  return {
    previous: round(previous),
    percent: previous > 0 ? round(((current - previous) / previous) * 100, 1) : null,
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(
    companyId: string,
    query: DashboardQuery,
  ): Promise<DashboardOverview> {
    let fromDate = parseDate(query.from);
    let toDate = parseDate(query.to, true);
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('El rango de fechas es inválido');
    }

    // Las campañas son un catálogo global; no exponen datos de otras empresas.
    const campaigns = await this.prisma.campaign.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });
    const campaign = query.campaignId
      ? campaigns.find((item) => item.id === query.campaignId)
      : undefined;
    if (query.campaignId && !campaign) {
      throw new BadRequestException('Campaña no encontrada');
    }

    // Al elegir una campaña se usa su vigencia como rango temporal cuando el
    // cliente no envió fechas explícitas. Así alertas y eventos sin campaignId
    // quedan dentro del mismo período que el resto de los indicadores.
    if (campaign && !query.from && !query.to) {
      fromDate = campaign.startDate;
      if (campaign.endDate) {
        toDate = new Date(campaign.endDate);
        toDate.setUTCHours(23, 59, 59, 999);
      } else {
        toDate = new Date();
      }
    }

    const range = fromDate || toDate
      ? { gte: fromDate, lte: toDate }
      : undefined;
    const periodLength = fromDate && toDate ? toDate.getTime() - fromDate.getTime() : 0;
    const previousRange = fromDate && periodLength > 0 && !query.campaignId
      ? { gte: new Date(fromDate.getTime() - periodLength), lt: fromDate }
      : undefined;

    const farmScope = { companyId, deletedAt: null } as const;
    const fieldScope = {
      farm: farmScope,
      deletedAt: null,
      ...(campaign ? { campaignCode: campaign.code } : {}),
    };
    const activityScope = {
      field: { deletedAt: null, farm: farmScope },
      deletedAt: null,
      ...(range ? { activityDate: range } : {}),
      ...(query.campaignId ? { campaignId: query.campaignId } : {}),
    };
    const costScope = {
      companyId,
      deletedAt: null,
      ...(range ? { costDate: range } : {}),
      ...(query.campaignId ? { campaignId: query.campaignId } : {}),
    };
    const harvestScope = {
      companyId,
      deletedAt: null,
      ...(range ? { startDate: range } : {}),
      ...(query.campaignId ? { campaignId: query.campaignId } : {}),
    };
    const alertScope = {
      field: { deletedAt: null, farm: farmScope },
      ...(range ? { createdAt: range } : {}),
    };

    const [
      farms,
      fields,
      activities,
      activityCount,
      costs,
      harvests,
      alerts,
      statusCatalog,
      previousActivities,
      previousCosts,
      previousHarvests,
      previousAlerts,
    ] = await Promise.all([
      this.prisma.farm.count({ where: farmScope }),
      this.prisma.field.findMany({
        where: fieldScope,
        select: {
          id: true,
          name: true,
          areaHectares: true,
          campaignCode: true,
          estimatedProduction: true,
          healthScore: true,
          shiScore: true,
          shiLevel: true,
          color: true,
          fieldStatus: { select: { code: true, name: true } },
          farm: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.activity.findMany({
        where: activityScope,
        select: {
          id: true,
          title: true,
          activityDate: true,
          observations: true,
          productName: true,
          activityType: { select: { code: true } },
          field: { select: { name: true } },
        },
        orderBy: { activityDate: 'desc' },
        take: 6,
      }),
      this.prisma.activity.count({ where: activityScope }),
      this.prisma.cost.findMany({
        where: costScope,
        select: {
          amount: true,
          costDate: true,
          costCategory: { select: { id: true, name: true, color: true } },
        },
      }),
      this.prisma.harvest.findMany({
        where: harvestScope,
        select: {
          tons: true,
          tonsPerHectare: true,
          field: { select: { areaHectares: true } },
          campaign: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.fieldAlert.findMany({
        where: alertScope,
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          createdAt: true,
          field: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fieldStatus.findMany({
        select: { code: true, name: true },
        orderBy: { name: 'asc' },
      }),
      previousRange
        ? this.prisma.activity.count({
            where: { ...activityScope, activityDate: previousRange },
          })
        : Promise.resolve(0),
      previousRange
        ? this.prisma.cost.aggregate({
            where: { ...costScope, costDate: previousRange },
            _sum: { amount: true },
          })
        : Promise.resolve(null),
      previousRange
        ? this.prisma.harvest.aggregate({
            where: { ...harvestScope, startDate: previousRange },
            _sum: { tons: true },
          })
        : Promise.resolve(null),
      previousRange
        ? this.prisma.fieldAlert.count({
            where: { ...alertScope, createdAt: previousRange },
          })
        : Promise.resolve(0),
    ]);

    const areaHectares = fields.reduce((sum, field) => sum + num(field.areaHectares), 0);
    const shiScores = fields
      .map((field) => field.shiScore)
      .filter((score): score is number => score !== null);
    const averageShi = shiScores.length
      ? round(shiScores.reduce((sum, score) => sum + score, 0) / shiScores.length, 0)
      : null;
    const costsTotal = costs.reduce((sum, cost) => sum + num(cost.amount), 0);
    const productionTons = harvests.reduce((sum, harvest) => sum + num(harvest.tons), 0);

    const trendData: DashboardTrends = {
      activities: previousRange ? trend(activityCount, previousActivities) : null,
      costsTotal: previousRange
        ? trend(costsTotal, num(previousCosts?._sum.amount))
        : null,
      productionTons: previousRange
        ? trend(productionTons, num(previousHarvests?._sum.tons))
        : null,
      activeAlerts: previousRange ? trend(alerts.length, previousAlerts) : null,
    };

    return {
      filters: {
        from: fromDate?.toISOString() ?? null,
        to: toDate?.toISOString() ?? null,
        campaignId: campaign?.id ?? null,
      },
      campaigns: campaigns.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        startDate: item.startDate.toISOString(),
        endDate: item.endDate?.toISOString() ?? null,
        isActive: item.isActive,
      })),
      metrics: {
        farms,
        fields: fields.length,
        areaHectares: round(areaHectares),
        activities: activityCount,
        costsTotal: round(costsTotal),
        harvests: harvests.length,
        productionTons: round(productionTons),
        activeAlerts: alerts.length,
        averageShi,
        costPerHectare: areaHectares > 0 ? round(costsTotal / areaHectares) : null,
      },
      trends: trendData,
      fieldStatus: this.buildFieldStatus(statusCatalog, fields),
      costByCategory: this.buildCostByCategory(costs),
      costByMonth: this.buildCostByMonth(costs),
      productionByCampaign: this.buildProduction(harvests, fields),
      alerts: alerts.map((alert): DashboardAlert => ({
        id: alert.id,
        title: alert.title,
        description: alert.field ? `Campo ${alert.field.name}` : '',
        priority: (['critical', 'high', 'medium', 'low'].includes(alert.priority)
          ? alert.priority
          : 'low') as DashboardAlert['priority'],
        category: alert.type,
        timestamp: alert.createdAt.toISOString(),
        field: alert.field?.name ?? null,
      })),
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.activityType.code,
        title: activity.title,
        description: activity.observations ?? activity.productName ?? '',
        timestamp: activity.activityDate.toISOString(),
        field: activity.field?.name ?? null,
      })),
      fields: fields.map((field): DashboardField => ({
        id: field.id,
        name: field.name,
        farmName: field.farm.name,
        areaHectares: round(num(field.areaHectares)),
        statusCode: field.fieldStatus.code,
        statusName: field.fieldStatus.name,
        healthScore: field.healthScore,
        shiScore: field.shiScore,
        shiLevel: field.shiLevel,
        color: field.color,
      })),
    };
  }

  private buildFieldStatus(
    catalog: { code: string; name: string }[],
    fields: { areaHectares: unknown; fieldStatus: { code: string; name: string } }[],
  ): DashboardFieldStatus[] {
    return catalog.map((status) => {
      const matching = fields.filter((field) => field.fieldStatus.code === status.code);
      return {
        code: status.code,
        name: status.name,
        count: matching.length,
        areaHectares: round(
          matching.reduce((sum, field) => sum + num(field.areaHectares), 0),
        ),
      };
    });
  }

  private buildCostByCategory(
    costs: {
      amount: unknown;
      costCategory: { id: string; name: string; color: string | null };
    }[],
  ): DashboardCostCategory[] {
    const grouped = new Map<string, DashboardCostCategory>();
    for (const cost of costs) {
      const category = cost.costCategory;
      const current = grouped.get(category.id) ?? {
        id: category.id,
        name: category.name,
        color: category.color ?? '#10B981',
        total: 0,
      };
      current.total += num(cost.amount);
      grouped.set(category.id, current);
    }
    return [...grouped.values()]
      .map((item) => ({ ...item, total: round(item.total) }))
      .sort((a, b) => b.total - a.total);
  }

  private buildCostByMonth(
    costs: { amount: unknown; costDate: Date }[],
  ): DashboardCostPoint[] {
    const grouped = new Map<string, number>();
    for (const cost of costs) {
      const month = cost.costDate.toISOString().slice(0, 7);
      grouped.set(month, (grouped.get(month) ?? 0) + num(cost.amount));
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: round(total) }));
  }

  private buildProduction(
    harvests: {
      tons: unknown;
      tonsPerHectare: unknown;
      field: { areaHectares: unknown };
      campaign: { id: string; code: string; name: string };
    }[],
    fields: { campaignCode: string | null; estimatedProduction: unknown }[],
  ): DashboardProductionPoint[] {
    const grouped = new Map<string, DashboardProductionPoint & { area: number; weighted: number }>();
    for (const harvest of harvests) {
      const campaign = harvest.campaign;
      const current = grouped.get(campaign.id) ?? {
        campaignCode: campaign.code,
        campaignName: campaign.name,
        production: 0,
        yieldPerHectare: 0,
        target: 0,
        area: 0,
        weighted: 0,
      };
      const area = num(harvest.field.areaHectares);
      const yieldValue = num(harvest.tonsPerHectare) > 0
        ? num(harvest.tonsPerHectare)
        : area > 0
          ? num(harvest.tons) / area
          : 0;
      current.production += num(harvest.tons);
      current.area += area;
      current.weighted += yieldValue * area;
      grouped.set(campaign.id, current);
    }

    return [...grouped.values()]
      .map((item) => {
        const target = fields
          .filter((field) => field.campaignCode === item.campaignCode)
          .reduce((sum, field) => sum + num(field.estimatedProduction), 0);
        return {
          campaignCode: item.campaignCode,
          campaignName: item.campaignName,
          production: round(item.production),
          yieldPerHectare: round(item.area > 0 ? item.weighted / item.area : 0),
          target: round(target),
        };
      })
      .sort((a, b) => a.campaignCode.localeCompare(b.campaignCode));
  }
}
