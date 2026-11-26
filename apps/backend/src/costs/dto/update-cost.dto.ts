import { PartialType } from '@nestjs/mapped-types';
import { CreateCostDto } from './create-cost.dto.js';

export class UpdateCostDto extends PartialType(CreateCostDto) {}
