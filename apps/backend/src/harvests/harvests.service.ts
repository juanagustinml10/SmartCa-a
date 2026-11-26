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

  async findAll(query: QueryHarvestDto): Promise<PaginatedResult<Harvest>> {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<HarvestWithRelations> {
    const harvest = await this.repository.findById(id);
    if (!harvest)
      throw new NotFoundException(`Cosecha con ID "${id}" no encontrada`);
    return harvest;
  }

  async create(dto: CreateHarvestDto): Promise<Harvest> {
    await this.validateReferences(
      dto.companyId,
      dto.farmId,
      dto.fieldId,
      dto.campaignId,
      dto.varietyId,
    );
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateHarvestDto): Promise<Harvest> {
    const harvest = await this.repository.findById(id);
    if (!harvest)
      throw new NotFoundException(`Cosecha con ID "${id}" no encontrada`);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const harvest = await this.repository.findById(id);
    if (!harvest)
      throw new NotFoundException(`Cosecha con ID "${id}" no encontrada`);
    await this.repository.softDelete(id);
  }

  async getAnalytics(filters: {
    companyId?: string;
    farmId?: string;
    fieldId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HarvestAnalytics> {
    return this.repository.getAnalytics(filters);
  }

  private async validateReferences(
    companyId?: string,
    farmId?: string,
    fieldId?: string,
    campaignId?: string,
    varietyId?: string,
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
