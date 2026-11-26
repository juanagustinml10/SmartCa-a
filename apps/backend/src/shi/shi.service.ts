import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ShiInput {
  fieldId: string;
  healthScore: number | null;
  status: string;
  activeAlerts: number;
  recentActivities: number;
  activityDelays: number;
  historicalProduction: number | null;
  accumulatedCosts: number;
  sanitaryCondition: 'good' | 'fair' | 'poor' | 'unknown';
}

export interface ShiResult {
  score: number;
  level: 'excelente' | 'bueno' | 'regular' | 'critico';
  breakdown: {
    healthScore: number;
    fieldStatus: number;
    alerts: number;
    activities: number;
    production: number;
    costs: number;
    sanitary: number;
  };
  calculatedAt: Date;
}

@Injectable()
export class ShiService {
  constructor(private readonly prisma: PrismaService) {}

  calculate(input: ShiInput): ShiResult {
    const breakdown = {
      healthScore: this.normalizeHealthScore(input.healthScore),
      fieldStatus: this.calcFieldStatus(input.status),
      alerts: this.calcAlerts(input.activeAlerts),
      activities: this.calcActivities(
        input.recentActivities,
        input.activityDelays,
      ),
      production: this.calcHistoricalProduction(input.historicalProduction),
      costs: this.calcCosts(input.accumulatedCosts),
      sanitary: this.calcSanitary(input.sanitaryCondition),
    };

    const weights = {
      healthScore: 0.25,
      fieldStatus: 0.15,
      alerts: 0.15,
      activities: 0.15,
      production: 0.1,
      costs: 0.1,
      sanitary: 0.1,
    };

    const weightedScore = Object.entries(weights).reduce(
      (sum, [key, weight]) =>
        sum + breakdown[key as keyof typeof breakdown] * weight,
      0,
    );

    const score = Math.round(Math.max(0, Math.min(100, weightedScore)));

    return {
      score,
      level:
        score >= 80
          ? 'excelente'
          : score >= 60
            ? 'bueno'
            : score >= 40
              ? 'regular'
              : 'critico',
      breakdown,
      calculatedAt: new Date(),
    };
  }

  async calculateForField(
    companyId: string,
    fieldId: string,
  ): Promise<ShiResult> {
    const field = await this.prisma.field.findFirst({
      where: {
        id: fieldId,
        deletedAt: null,
        farm: { companyId, deletedAt: null },
      },
      include: {
        fieldStatus: true,
        alerts: { where: { priority: { in: ['high', 'critical'] } } },
        activities: {
          where: { deletedAt: null },
          orderBy: { activityDate: 'desc' },
          take: 20,
        },
        harvests: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        costs: { where: { deletedAt: null }, take: 50 },
      },
    });

    if (!field) {
      return this.calculate({
        fieldId,
        healthScore: null,
        status: 'inactive',
        activeAlerts: 0,
        recentActivities: 0,
        activityDelays: 0,
        historicalProduction: null,
        accumulatedCosts: 0,
        sanitaryCondition: 'unknown',
      });
    }

    const activeAlerts = field.alerts.length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivities = field.activities.filter(
      (a) => new Date(a.activityDate) >= thirtyDaysAgo,
    ).length;
    const hasDelays = field.activities.some(
      (a) =>
        a.activityDate &&
        new Date(a.activityDate) < thirtyDaysAgo &&
        !a.observations?.includes('completada'),
    );
    const totalProduction = field.harvests.reduce(
      (s, h) => s + Number(h.tons),
      0,
    );
    const totalCosts = field.costs.reduce((s, c) => Number(c.amount), 0);
    const sanitaryCondition: 'good' | 'fair' | 'poor' | 'unknown' =
      field.healthScore && field.healthScore >= 70
        ? 'good'
        : field.healthScore && field.healthScore >= 40
          ? 'fair'
          : 'poor';

    return this.calculate({
      fieldId,
      healthScore: field.healthScore,
      status: field.fieldStatus?.code ?? 'active',
      activeAlerts,
      recentActivities,
      activityDelays: hasDelays ? 1 : 0,
      historicalProduction: totalProduction > 0 ? totalProduction : null,
      accumulatedCosts: totalCosts,
      sanitaryCondition,
    });
  }

  private normalizeHealthScore(score: number | null): number {
    if (score === null) return 50;
    return Math.max(0, Math.min(100, score));
  }

  private calcFieldStatus(status: string): number {
    const map: Record<string, number> = {
      active: 90,
      harvesting: 80,
      resting: 50,
      inactive: 20,
    };
    return map[status] ?? 50;
  }

  private calcAlerts(count: number): number {
    if (count === 0) return 100;
    if (count === 1) return 70;
    if (count <= 3) return 40;
    return 10;
  }

  private calcActivities(recent: number, delays: number): number {
    let score = recent >= 5 ? 100 : recent >= 3 ? 80 : recent >= 1 ? 60 : 30;
    if (delays > 0) score = Math.max(0, score - 30);
    return score;
  }

  private calcHistoricalProduction(production: number | null): number {
    if (production === null) return 50;
    const threshold = 500;
    if (production >= threshold * 2) return 100;
    if (production >= threshold) return 75;
    if (production >= threshold / 2) return 50;
    return 25;
  }

  private calcCosts(costs: number): number {
    if (costs <= 0) return 80;
    if (costs < 50000) return 90;
    if (costs < 100000) return 70;
    if (costs < 200000) return 50;
    return 30;
  }

  private calcSanitary(
    condition: 'good' | 'fair' | 'poor' | 'unknown',
  ): number {
    const map: Record<string, number> = {
      good: 90,
      fair: 60,
      poor: 20,
      unknown: 50,
    };
    return map[condition];
  }
}
