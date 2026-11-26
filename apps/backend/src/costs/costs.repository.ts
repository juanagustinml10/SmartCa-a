import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ICostsRepository,
  CostWithRelations,
  PaginatedResult,
  CostAnalytics,
} from './interfaces/costs-repository.interface.js';
import type { CreateCostDto } from './dto/create-cost.dto.js';
import type { UpdateCostDto } from './dto/update-cost.dto.js';
import type { QueryCostDto } from './dto/query-cost.dto.js';
import type { Cost, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CostsRepository implements ICostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCostDto): Promise<PaginatedResult<Cost>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CostWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { observations: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.companyId) where.companyId = query.companyId;
    if (query.farmId) where.farmId = query.farmId;
    if (query.fieldId) where.fieldId = query.fieldId;
    if (query.costCategoryId) where.costCategoryId = query.costCategoryId;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;
    if (query.startDate || query.endDate) {
      where.costDate = {};
      if (query.startDate) where.costDate.gte = new Date(query.startDate);
      if (query.endDate) where.costDate.lte = new Date(query.endDate);
    }

    const orderBy: Prisma.CostOrderByWithRelationInput = {};
    if (query.sortKey) {
      const fieldMap: Record<string, string> = {
        date: 'costDate',
        amount: 'amount',
        description: 'description',
        status: 'status',
      };
      const field = (fieldMap[query.sortKey] ||
        'costDate') as keyof typeof orderBy;
      orderBy[field] = query.sortAsc === 'false' ? 'desc' : 'asc';
    } else {
      orderBy.costDate = 'desc';
    }

    const include = {
      costCategory: {
        select: { id: true, code: true, name: true, icon: true, color: true },
      },
      supplier: { select: { id: true, name: true, cuit: true } },
      field: { select: { id: true, name: true } },
      farm: { select: { id: true, name: true } },
      campaign: { select: { id: true, code: true, name: true } },
      activity: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    };

    const [data, total] = await Promise.all([
      this.prisma.cost.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      this.prisma.cost.count({ where }),
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

  async findById(id: string): Promise<CostWithRelations | null> {
    return this.prisma.cost.findFirst({
      where: { id, deletedAt: null },
      include: {
        costCategory: true,
        supplier: true,
        field: { select: { id: true, name: true } },
        farm: { select: { id: true, name: true } },
        campaign: { select: { id: true, code: true, name: true } },
        activity: { select: { id: true, title: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async create(dto: CreateCostDto): Promise<Cost> {
    return this.prisma.cost.create({
      data: {
        companyId: dto.companyId,
        farmId: dto.farmId,
        fieldId: dto.fieldId,
        costCategoryId: dto.costCategoryId,
        supplierId: dto.supplierId,
        activityId: dto.activityId,
        campaignId: dto.campaignId,
        userId: dto.userId,
        description: dto.description,
        quantity: dto.quantity,
        unit: dto.unit,
        unitPrice: dto.unitPrice,
        amount: dto.amount,
        currency: dto.currency ?? 'ARS',
        costDate: new Date(dto.costDate),
        status: dto.status ?? 'active',
        receiptUrl: dto.receiptUrl,
        observations: dto.observations,
      },
    });
  }

  async update(id: string, dto: UpdateCostDto): Promise<Cost> {
    const data: Record<string, unknown> = {};
    if (dto.companyId !== undefined) data.companyId = dto.companyId;
    if (dto.farmId !== undefined) data.farmId = dto.farmId;
    if (dto.fieldId !== undefined) data.fieldId = dto.fieldId;
    if (dto.costCategoryId !== undefined)
      data.costCategoryId = dto.costCategoryId;
    if (dto.supplierId !== undefined) data.supplierId = dto.supplierId;
    if (dto.activityId !== undefined) data.activityId = dto.activityId;
    if (dto.campaignId !== undefined) data.campaignId = dto.campaignId;
    if (dto.userId !== undefined) data.userId = dto.userId;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.unitPrice !== undefined) data.unitPrice = dto.unitPrice;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.costDate !== undefined) data.costDate = new Date(dto.costDate);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;
    if (dto.observations !== undefined) data.observations = dto.observations;

    return this.prisma.cost.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Cost> {
    return this.prisma.cost.update({
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
  }): Promise<CostAnalytics> {
    const where: Prisma.CostWhereInput = { deletedAt: null };
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.farmId) where.farmId = filters.farmId;
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.startDate || filters.endDate) {
      where.costDate = {};
      if (filters.startDate) where.costDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.costDate.lte = new Date(filters.endDate);
    }

    const costRows = await this.prisma.cost.findMany({
      where,
      select: {
        amount: true,
        costDate: true,
        costCategory: { select: { id: true, name: true } },
        field: { select: { id: true, name: true, areaHectares: true } },
        campaign: { select: { id: true, name: true } },
      },
    });

    const totalAmount = costRows.reduce(
      (sum, row) => sum + Number(row.amount),
      0,
    );

    const catAgg = new Map<string, { name: string; total: number }>();
    for (const row of costRows) {
      const catId = row.costCategory?.id ?? 'unknown';
      const e = catAgg.get(catId);
      const amt = Number(row.amount);
      if (e) e.total += amt;
      else
        catAgg.set(catId, {
          name: row.costCategory?.name ?? 'Sin categoría',
          total: amt,
        });
    }
    const totalByCategory = Array.from(catAgg.entries())
      .map(([categoryId, v]) => ({
        categoryId,
        categoryName: v.name,
        total: v.total,
        percentage:
          totalAmount > 0
            ? Math.round((v.total / totalAmount) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const fieldAgg = new Map<string, { name: string; total: number }>();
    for (const row of costRows) {
      const fId = row.field?.id ?? 'unknown';
      const e = fieldAgg.get(fId);
      const amt = Number(row.amount);
      if (e) e.total += amt;
      else
        fieldAgg.set(fId, { name: row.field?.name ?? 'Sin campo', total: amt });
    }
    const totalByField = Array.from(fieldAgg.entries())
      .map(([fieldId, v]) => ({
        fieldId,
        fieldName: v.name,
        total: v.total,
        percentage:
          totalAmount > 0
            ? Math.round((v.total / totalAmount) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const monthAgg = new Map<
      string,
      { month: string; year: number; total: number }
    >();
    for (const row of costRows) {
      const d = new Date(row.costDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const e = monthAgg.get(key);
      const amt = Number(row.amount);
      if (e) e.total += amt;
      else
        monthAgg.set(key, {
          month: d.toLocaleString('es-AR', { month: 'long' }),
          year: d.getFullYear(),
          total: amt,
        });
    }
    const totalByMonth = Array.from(monthAgg.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    const campAgg = new Map<string, { name: string; total: number }>();
    for (const row of costRows) {
      const cId = row.campaign?.id ?? 'unknown';
      const e = campAgg.get(cId);
      const amt = Number(row.amount);
      if (e) e.total += amt;
      else
        campAgg.set(cId, {
          name: row.campaign?.name ?? 'Sin campaña',
          total: amt,
        });
    }
    const totalByCampaign = Array.from(campAgg.entries())
      .map(([campaignId, v]) => ({
        campaignId,
        campaignName: v.name,
        total: v.total,
      }))
      .sort((a, b) => b.total - a.total);

    const totalHa = costRows.reduce(
      (sum, row) => sum + Number(row.field?.areaHectares ?? 0),
      0,
    );
    const costPerHectare =
      totalHa > 0 ? Math.round((totalAmount / totalHa) * 100) / 100 : 0;
    const uniqueMonths = monthAgg.size || 1;
    const averageMonthlyCost =
      Math.round((totalAmount / uniqueMonths) * 100) / 100;

    return {
      totalAmount,
      totalByCategory,
      totalByField,
      totalByMonth,
      totalByCampaign,
      costPerHectare,
      averageMonthlyCost,
    };
  }
}
