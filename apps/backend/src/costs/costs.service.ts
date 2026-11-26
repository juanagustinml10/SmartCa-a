import { Injectable, NotFoundException } from '@nestjs/common';
import { CostsRepository } from './costs.repository.js';
import type { CreateCostDto } from './dto/create-cost.dto.js';
import type { UpdateCostDto } from './dto/update-cost.dto.js';
import type { QueryCostDto } from './dto/query-cost.dto.js';
import type {
  PaginatedResult,
  CostWithRelations,
  CostAnalytics,
} from './interfaces/costs-repository.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Cost } from '../generated/prisma/client.js';

@Injectable()
export class CostsService {
  constructor(
    private readonly repository: CostsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryCostDto,
  ): Promise<PaginatedResult<Cost>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(companyId: string, id: string): Promise<CostWithRelations> {
    const cost = await this.repository.findById(companyId, id);
    if (!cost)
      throw new NotFoundException(`Costo con ID "${id}" no encontrado`);
    return cost;
  }

  async create(companyId: string, dto: CreateCostDto): Promise<Cost> {
    await this.validateReferences(
      companyId,
      dto.farmId,
      dto.fieldId,
      dto.costCategoryId,
      dto.supplierId,
      dto.campaignId,
      dto.activityId,
      dto.userId,
    );
    // dto.companyId existe por compatibilidad del DTO, pero nunca se usa.
    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCostDto,
  ): Promise<Cost> {
    const cost = await this.findById(companyId, id);
    if (
      dto.farmId ||
      dto.fieldId ||
      dto.costCategoryId ||
      dto.supplierId ||
      dto.campaignId ||
      dto.activityId ||
      dto.userId
    ) {
      await this.validateReferences(
        companyId,
        dto.farmId ?? cost.farmId ?? undefined,
        dto.fieldId ?? cost.fieldId ?? undefined,
        dto.costCategoryId ?? cost.costCategoryId,
        dto.supplierId ?? cost.supplierId ?? undefined,
        dto.campaignId ?? cost.campaignId,
        dto.activityId ?? cost.activityId ?? undefined,
        dto.userId ?? cost.userId ?? undefined,
      );
    }
    // dto.companyId se ignora: un costo no puede cambiar de empresa.
    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findById(companyId, id);
    await this.repository.softDelete(companyId, id);
  }

  async getAnalytics(
    companyId: string,
    filters: {
      farmId?: string;
      fieldId?: string;
      campaignId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<CostAnalytics> {
    return this.repository.getAnalytics(companyId, filters);
  }

  /** Todas las referencias se validan dentro de la empresa del token. */
  private async validateReferences(
    companyId: string,
    farmId?: string,
    fieldId?: string,
    costCategoryId?: string,
    supplierId?: string,
    campaignId?: string,
    activityId?: string,
    userId?: string,
  ): Promise<void> {
    if (farmId) {
      const farm = await this.prisma.farm.findFirst({
        where: { id: farmId, companyId, deletedAt: null },
      });
      if (!farm)
        throw new NotFoundException(
          `Establecimiento con ID "${farmId}" no encontrado`,
        );
    }
    if (fieldId) {
      const field = await this.prisma.field.findFirst({
        where: { id: fieldId, farm: { companyId }, deletedAt: null },
      });
      if (!field)
        throw new NotFoundException(`Campo con ID "${fieldId}" no encontrado`);
    }
    if (costCategoryId) {
      const cat = await this.prisma.costCategory.findFirst({
        where: { id: costCategoryId, deletedAt: null },
      });
      if (!cat)
        throw new NotFoundException(
          `Categoría con ID "${costCategoryId}" no encontrada`,
        );
    }
    if (supplierId) {
      const sup = await this.prisma.supplier.findFirst({
        where: { id: supplierId, companyId, deletedAt: null },
      });
      if (!sup)
        throw new NotFoundException(
          `Proveedor con ID "${supplierId}" no encontrado`,
        );
    }
    if (campaignId) {
      const camp = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!camp)
        throw new NotFoundException(
          `Campaña con ID "${campaignId}" no encontrada`,
        );
    }
    if (activityId) {
      const act = await this.prisma.activity.findFirst({
        where: {
          id: activityId,
          deletedAt: null,
          field: { farm: { companyId } },
        },
      });
      if (!act)
        throw new NotFoundException(
          `Actividad con ID "${activityId}" no encontrada`,
        );
    }
    if (userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, companyId, deletedAt: null },
      });
      if (!user)
        throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }
  }
}
