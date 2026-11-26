import { Module } from '@nestjs/common';
import { CostCategoriesController } from './cost-categories.controller.js';
import { CostCategoriesService } from './cost-categories.service.js';
import { CostCategoriesRepository } from './cost-categories.repository.js';

@Module({
  controllers: [CostCategoriesController],
  providers: [CostCategoriesService, CostCategoriesRepository],
  exports: [CostCategoriesService],
})
export class CostCategoriesModule {}
