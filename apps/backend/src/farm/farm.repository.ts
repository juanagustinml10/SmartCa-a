import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { IFarmRepository } from './interfaces/farm-repository.interface.js';
import type { CreateFarmDto } from './dto/create-farm.dto.js';
import type { UpdateFarmDto } from './dto/update-farm.dto.js';
import type { Farm } from '../generated/prisma/client.js';

@Injectable()
export class FarmRepository implements IFarmRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<Farm[]> {
    return this.prisma.farm.findMany({
      where: { companyId, deletedAt: null },
      include: { _count: { select: { fields: true } } },
    });
  }

  async findById(id: string): Promise<Farm | null> {
    return this.prisma.farm.findFirst({
      where: { id, deletedAt: null },
      include: { fields: { where: { deletedAt: null } } },
    });
  }

  async create(companyId: string, dto: CreateFarmDto): Promise<Farm> {
    return this.prisma.farm.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        location: dto.location,
        totalArea: dto.totalArea,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status ?? 'active',
      },
    });
  }

  async update(id: string, dto: UpdateFarmDto): Promise<Farm> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.totalArea !== undefined) data.totalArea = dto.totalArea;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.farm.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Farm> {
    return this.prisma.farm.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
