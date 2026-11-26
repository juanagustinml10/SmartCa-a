import { Injectable, NotFoundException } from '@nestjs/common';
import { HarvestsRepository } from './harvests.repository.js';
import type { CreateHarvestDto } from './dto/create-harvest.dto.js';
import type { UpdateHarvestDto } from './dto/update-harvest.dto.js';
import type { QueryHarvestDto } from './dto/query-harvest.dto.js';
import type {
  PaginatedResult,
  HarvestWithRelations,
  HarvestAnalytics,
} from './interfaces/harvests-repository.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Harvest } from '../generated/prisma/client.js';

@Injectable()
export class HarvestsService {
  constructor(
    private readonly repository: HarvestsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryHarvestDto,
  ): Promise<PaginatedResult<Harvest>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(
    companyId: string,
    id: string,
  ): Promise<HarvestWithRelations> {
    const harvest = await this.repository.findById(companyId, id);
    if (!harvest)
      throw new NotFoundException(`Cosecha con ID "${id}" no encontrada`);
    return harvest;
  }

  async create(companyId: string, dto: CreateHarvestDto): Promise<Harvest> {
    await this.validateReferences(
      companyId,
      dto.farmId,
      dto.fieldId,
      dto.campaignId,
      dto.varietyId,
    );
    // dto.companyId existe por compatibilidad del DTO, pero nunca se usa.
    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateHarvestDto,
  ): Promise<Harvest> {
    const harvest = await this.findById(companyId, id);
    if (dto.farmId || dto.fieldId || dto.campaignId || dto.varietyId) {
      await this.validateReferences(
        companyId,
        dto.farmId ?? harvest.farmId ?? undefined,
        dto.fieldId ?? harvest.fieldId,
        dto.campaignId ?? harvest.campaignId,
        dto.varietyId ?? harvest.varietyId ?? undefined,
      );
    }
    // dto.companyId se ignora: una cosecha no puede cambiar de empresa.
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
  ): Promise<HarvestAnalytics> {
    return this.repository.getAnalytics(companyId, filters);
  }

  private async validateReferences(
    companyId: string,
    farmId?: string,
    fieldId?: string,
    campaignId?: string,
    varietyId?: string,
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
    if (campaignId) {
      const camp = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!camp)
        throw new NotFoundException(
          `Campaña con ID "${campaignId}" no encontrada`,
        );
    }
    if (varietyId) {
      const variety = await this.prisma.variety.findUnique({
        where: { id: varietyId },
      });
      if (!variety)
        throw new NotFoundException(
          `Variedad con ID "${varietyId}" no encontrada`,
        );
    }
  }
}
