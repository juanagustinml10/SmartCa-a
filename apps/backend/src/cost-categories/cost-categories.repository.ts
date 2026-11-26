import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ICostCategoriesRepository } from './interfaces/cost-categories-repository.interface.js';
import type { CreateCostCategoryDto } from './dto/create-cost-category.dto.js';
import type { UpdateCostCategoryDto } from './dto/update-cost-category.dto.js';
import type { CostCategory } from '../generated/prisma/client.js';

@Injectable()
export class CostCategoriesRepository implements ICostCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CostCategory[]> {
    return this.prisma.costCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<CostCategory | null> {
    return this.prisma.costCategory.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string): Promise<CostCategory | null> {
    return this.prisma.costCategory.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async create(dto: CreateCostCategoryDto): Promise<CostCategory> {
    return this.prisma.costCategory.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCostCategoryDto): Promise<CostCategory> {
    const data: Record<string, unknown> = {};
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.costCategory.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<CostCategory> {
    return this.prisma.costCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
