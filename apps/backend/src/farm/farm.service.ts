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

  async findById(id: string): Promise<Farm> {
    const farm = await this.repository.findById(id);
    if (!farm)
      throw new NotFoundException(
        `Establecimiento con ID "${id}" no encontrado`,
      );
    return farm;
  }

  async create(companyId: string, dto: CreateFarmDto): Promise<Farm> {
    return this.repository.create(companyId, dto);
  }

  async update(id: string, dto: UpdateFarmDto): Promise<Farm> {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.softDelete(id);
  }
}
