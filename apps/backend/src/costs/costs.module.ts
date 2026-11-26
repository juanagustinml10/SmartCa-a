import { Module } from '@nestjs/common';
import { CostsController } from './costs.controller.js';
import { CostsService } from './costs.service.js';
import { CostsRepository } from './costs.repository.js';

@Module({
  controllers: [CostsController],
  providers: [CostsService, CostsRepository],
  exports: [CostsService],
})
export class CostsModule {}
