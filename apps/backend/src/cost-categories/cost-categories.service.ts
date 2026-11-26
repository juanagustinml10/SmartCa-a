import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CostCategoriesRepository } from './cost-categories.repository.js';
import type { CreateCostCategoryDto } from './dto/create-cost-category.dto.js';
import type { UpdateCostCategoryDto } from './dto/update-cost-category.dto.js';
import type { CostCategory } from '../generated/prisma/client.js';

@Injectable()
export class CostCategoriesService {
  constructor(private readonly repository: CostCategoriesRepository) {}

  async findAll(): Promise<CostCategory[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<CostCategory> {
    const cat = await this.repository.findById(id);
    if (!cat)
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    return cat;
  }

  async create(dto: CreateCostCategoryDto): Promise<CostCategory> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing)
      throw new ConflictException(
        `Ya existe una categoría con el código "${dto.code}"`,
      );
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCostCategoryDto): Promise<CostCategory> {
    const cat = await this.repository.findById(id);
    if (!cat)
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    if (dto.code && dto.code !== cat.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing)
        throw new ConflictException(
          `Ya existe una categoría con el código "${dto.code}"`,
        );
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const cat = await this.repository.findById(id);
    if (!cat)
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    await this.repository.softDelete(id);
  }
}
