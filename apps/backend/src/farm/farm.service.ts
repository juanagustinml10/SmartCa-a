import { Injectable, NotFoundException } from '@nestjs/common';
import { FarmRepository } from './farm.repository.js';
import type { CreateFarmDto } from './dto/create-farm.dto.js';
import type { UpdateFarmDto } from './dto/update-farm.dto.js';
import type { Farm } from '../generated/prisma/client.js';

@Injectable()
export class FarmService {
  constructor(private readonly repository: FarmRepository) {}

  async findAll(companyId: string): Promise<Farm[]> {
    return this.repository.findAll(companyId);
  }

  async findById(companyId: string, id: string): Promise<Farm> {
    // El ID nunca basta: el filtro por empresa ocurre en el repositorio.
    const farm = await this.repository.findById(companyId, id);
    if (!farm)
      throw new NotFoundException(
        `Establecimiento con ID "${id}" no encontrado`,
      );
    return farm;
  }

  async create(companyId: string, dto: CreateFarmDto): Promise<Farm> {
    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateFarmDto,
  ): Promise<Farm> {
    await this.findById(companyId, id);
    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findById(companyId, id);
    await this.repository.softDelete(companyId, id);
  }
}
