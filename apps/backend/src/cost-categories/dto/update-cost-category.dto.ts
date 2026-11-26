import { PartialType } from '@nestjs/mapped-types';
import { CreateCostCategoryDto } from './create-cost-category.dto.js';

export class UpdateCostCategoryDto extends PartialType(CreateCostCategoryDto) {}
