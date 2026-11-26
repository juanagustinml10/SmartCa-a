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

  async findAll(query: QueryCostDto): Promise<PaginatedResult<Cost>> {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<CostWithRelations> {
    const cost = await this.repository.findById(id);
    if (!cost)
      throw new NotFoundException(`Costo con ID "${id}" no encontrado`);
    return cost;
  }

  async create(dto: CreateCostDto): Promise<Cost> {
    await this.validateReferences(
      dto.companyId,
      dto.farmId,
      dto.fieldId,
      dto.costCategoryId,
      dto.supplierId,
      dto.campaignId,
      dto.activityId,
    );
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCostDto): Promise<Cost> {
    const cost = await this.repository.findById(id);
    if (!cost)
      throw new NotFoundException(`Costo con ID "${id}" no encontrado`);
    if (
      dto.companyId ||
      dto.farmId ||
      dto.fieldId ||
      dto.costCategoryId ||
      dto.supplierId ||
      dto.campaignId ||
      dto.activityId
    ) {
      await this.validateReferences(
        dto.companyId ?? cost.companyId,
        dto.farmId ?? cost.farmId ?? undefined,
        dto.fieldId ?? cost.fieldId ?? undefined,
        dto.costCategoryId ?? cost.costCategoryId,
        dto.supplierId ?? cost.supplierId ?? undefined,
        dto.campaignId ?? cost.campaignId,
        dto.activityId ?? cost.activityId ?? undefined,
      );
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const cost = await this.repository.findById(id);
    if (!cost)
      throw new NotFoundException(`Costo con ID "${id}" no encontrado`);
    await this.repository.softDelete(id);
  }

  async getAnalytics(filters: {
    companyId?: string;
    farmId?: string;
    fieldId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CostAnalytics> {
    return this.repository.getAnalytics(filters);
  }

  private async validateReferences(
    companyId?: string,
    farmId?: string,
    fieldId?: string,
    costCategoryId?: string,
    supplierId?: string,
    campaignId?: string,
    activityId?: string,
  ): Promise<void> {
    if (companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: companyId, deletedAt: null },
      });
      if (!company)
        throw new NotFoundException(
          `Empresa con ID "${companyId}" no encontrada`,
        );
    }
    if (farmId) {
      const farm = await this.prisma.farm.findFirst({
        where: { id: farmId, deletedAt: null },
      });
      if (!farm)
        throw new NotFoundException(
          `Establecimiento con ID "${farmId}" no encontrado`,
        );
    }
    if (fieldId) {
      const field = await this.prisma.field.findFirst({
        where: { id: fieldId, deletedAt: null },
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
        where: { id: supplierId, deletedAt: null },
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
        where: { id: activityId, deletedAt: null },
      });
      if (!act)
        throw new NotFoundException(
          `Actividad con ID "${activityId}" no encontrada`,
        );
    }
  }
}
