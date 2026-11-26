import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  IHarvestsRepository,
  HarvestWithRelations,
  PaginatedResult,
  HarvestAnalytics,
} from './interfaces/harvests-repository.interface.js';
import type { CreateHarvestDto } from './dto/create-harvest.dto.js';
import type { UpdateHarvestDto } from './dto/update-harvest.dto.js';
import type { QueryHarvestDto } from './dto/query-harvest.dto.js';
import type { Harvest, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class HarvestsRepository implements IHarvestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryHarvestDto): Promise<PaginatedResult<Harvest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.HarvestWhereInput = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { method: { contains: query.search, mode: 'insensitive' } },
        { responsible: { contains: query.search, mode: 'insensitive' } },
        { observations: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.companyId) where.companyId = query.companyId;
    if (query.farmId) where.farmId = query.farmId;
    if (query.fieldId) where.fieldId = query.fieldId;
    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.method) where.method = query.method;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) where.startDate.gte = new Date(query.startDate);
      if (query.endDate) where.startDate.lte = new Date(query.endDate);
    }

    const orderBy: Prisma.HarvestOrderByWithRelationInput = {};
    if (query.sortKey) {
      const fieldMap: Record<string, string> = {
        date: 'startDate',
        tons: 'tons',
        tonsPerHectare: 'tonsPerHectare',
        sucrose: 'sucrosePercentage',
      };
      const field = (fieldMap[query.sortKey] ||
        'startDate') as keyof typeof orderBy;
      orderBy[field] = query.sortAsc === 'false' ? 'desc' : 'asc';
    } else {
      orderBy.startDate = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.harvest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          field: { select: { id: true, name: true } },
          farm: { select: { id: true, name: true } },
          campaign: { select: { id: true, code: true, name: true } },
          variety: { select: { id: true, code: true, name: true } },
        },
      }),
      this.prisma.harvest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<HarvestWithRelations | null> {
    return this.prisma.harvest.findFirst({
      where: { id, deletedAt: null },
      include: {
        field: { select: { id: true, name: true } },
        farm: { select: { id: true, name: true } },
        campaign: { select: { id: true, code: true, name: true } },
        variety: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async create(dto: CreateHarvestDto): Promise<Harvest> {
    return this.prisma.harvest.create({
      data: {
        companyId: dto.companyId,
        farmId: dto.farmId,
        fieldId: dto.fieldId,
        campaignId: dto.campaignId,
        varietyId: dto.varietyId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        responsible: dto.responsible,
        method: dto.method,
        tons: dto.tons,
        tonsPerHectare: dto.tonsPerHectare,
        estimatedYield: dto.estimatedYield,
        sucrosePercentage: dto.sucrosePercentage,
        qualityGrade: dto.qualityGrade,
        humidity: dto.humidity,
        status: dto.status ?? 'completed',
        attachments: dto.attachments
          ? (dto.attachments as unknown as Prisma.InputJsonValue[])
          : undefined,
        observations: dto.observations,
      },
    });
  }

  async update(id: string, dto: UpdateHarvestDto): Promise<Harvest> {
    const data: Record<string, unknown> = {};
    if (dto.companyId !== undefined) data.companyId = dto.companyId;
    if (dto.farmId !== undefined) data.farmId = dto.farmId;
    if (dto.fieldId !== undefined) data.fieldId = dto.fieldId;
    if (dto.campaignId !== undefined) data.campaignId = dto.campaignId;
    if (dto.varietyId !== undefined) data.varietyId = dto.varietyId;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.responsible !== undefined) data.responsible = dto.responsible;
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.tons !== undefined) data.tons = dto.tons;
    if (dto.tonsPerHectare !== undefined)
      data.tonsPerHectare = dto.tonsPerHectare;
    if (dto.estimatedYield !== undefined)
      data.estimatedYield = dto.estimatedYield;
    if (dto.sucrosePercentage !== undefined)
      data.sucrosePercentage = dto.sucrosePercentage;
    if (dto.qualityGrade !== undefined) data.qualityGrade = dto.qualityGrade;
    if (dto.humidity !== undefined) data.humidity = dto.humidity;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.attachments !== undefined) data.attachments = dto.attachments;
    if (dto.observations !== undefined) data.observations = dto.observations;
    return this.prisma.harvest.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Harvest> {
    return this.prisma.harvest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getAnalytics(filters: {
    companyId?: string;
    farmId?: string;
    fieldId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HarvestAnalytics> {
    const where: Prisma.HarvestWhereInput = { deletedAt: null };
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    }

    const rows = await this.prisma.harvest.findMany({
      where,
      select: {
        id: true,
        tons: true,
        tonsPerHectare: true,
        sucrosePercentage: true,
        startDate: true,
        field: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true } },
      },
    });

    const totalTons = rows.reduce((s, r) => s + Number(r.tons), 0);
    const totalHarvests = rows.length;
    const validTph = rows.filter((r) => r.tonsPerHectare !== null);
    const averageTonsPerHectare =
      validTph.length > 0
        ? validTph.reduce((s, r) => s + Number(r.tonsPerHectare), 0) /
          validTph.length
        : 0;
    const validSucrose = rows.filter((r) => r.sucrosePercentage !== null);
    const averageSucrose =
      validSucrose.length > 0
        ? validSucrose.reduce((s, r) => s + Number(r.sucrosePercentage), 0) /
          validSucrose.length
        : 0;

    const byFieldMap = new Map<
      string,
      { name: string; tons: number; tphSum: number; tphCount: number }
    >();
    for (const r of rows) {
      const fId = r.field?.id ?? 'unknown';
      const e = byFieldMap.get(fId);
      const tons = Number(r.tons);
      if (e) {
        e.tons += tons;
        if (r.tonsPerHectare !== null) {
          e.tphSum += Number(r.tonsPerHectare);
          e.tphCount++;
        }
      } else {
        byFieldMap.set(fId, {
          name: r.field?.name ?? 'Sin campo',
          tons,
          tphSum: r.tonsPerHectare !== null ? Number(r.tonsPerHectare) : 0,
          tphCount: r.tonsPerHectare !== null ? 1 : 0,
        });
      }
    }
    const totalByField = Array.from(byFieldMap.entries())
      .map(([fieldId, v]) => ({
        fieldId,
        fieldName: v.name,
        tons: v.tons,
        percentage:
          totalTons > 0 ? Math.round((v.tons / totalTons) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.tons - a.tons);

    const byCampMap = new Map<string, { name: string; tons: number }>();
    for (const r of rows) {
      const cId = r.campaign?.id ?? 'unknown';
      const e = byCampMap.get(cId);
      const tons = Number(r.tons);
      if (e) e.tons += tons;
      else
        byCampMap.set(cId, { name: r.campaign?.name ?? 'Sin campaña', tons });
    }
    const totalByCampaign = Array.from(byCampMap.entries())
      .map(([campaignId, v]) => ({
        campaignId,
        campaignName: v.name,
        tons: v.tons,
      }))
      .sort((a, b) => b.tons - a.tons);

    const byMonthMap = new Map<
      string,
      { month: string; year: number; tons: number }
    >();
    for (const r of rows) {
      const d = new Date(r.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const e = byMonthMap.get(key);
      const tons = Number(r.tons);
      if (e) e.tons += tons;
      else
        byMonthMap.set(key, {
          month: d.toLocaleString('es-AR', { month: 'long' }),
          year: d.getFullYear(),
          tons,
        });
    }
    const totalByMonth = Array.from(byMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ ...v, tons: Math.round(v.tons * 100) / 100 }));

    let bestField: {
      fieldId: string;
      fieldName: string;
      tonsPerHectare: number;
    } | null = null;
    let worstField: {
      fieldId: string;
      fieldName: string;
      tonsPerHectare: number;
    } | null = null;
    for (const [fieldId, v] of byFieldMap) {
      const avgTph = v.tphCount > 0 ? v.tphSum / v.tphCount : 0;
      if (!bestField || avgTph > bestField.tonsPerHectare)
        bestField = {
          fieldId,
          fieldName: v.name,
          tonsPerHectare: Math.round(avgTph * 100) / 100,
        };
      if (!worstField || (v.tphCount > 0 && avgTph < worstField.tonsPerHectare))
        worstField = {
          fieldId,
          fieldName: v.name,
          tonsPerHectare: Math.round(avgTph * 100) / 100,
        };
    }

    return {
      totalTons,
      averageTonsPerHectare,
      totalByField,
      totalByCampaign,
      totalByMonth,
      bestField,
      worstField,
      averageSucrose,
      totalHarvests,
    };
  }
}
