import type { CostCategory } from '../../generated/prisma/client.js';
import type { CreateCostCategoryDto } from '../dto/create-cost-category.dto.js';
import type { UpdateCostCategoryDto } from '../dto/update-cost-category.dto.js';

export interface ICostCategoriesRepository {
  findAll(): Promise<CostCategory[]>;
  findById(id: string): Promise<CostCategory | null>;
  findByCode(code: string): Promise<CostCategory | null>;
  create(dto: CreateCostCategoryDto): Promise<CostCategory>;
  update(id: string, dto: UpdateCostCategoryDto): Promise<CostCategory>;
  softDelete(id: string): Promise<CostCategory>;
}
