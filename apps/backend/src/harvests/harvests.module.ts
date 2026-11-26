import { Module } from '@nestjs/common';
import { HarvestsController } from './harvests.controller.js';
import { HarvestsService } from './harvests.service.js';
import { HarvestsRepository } from './harvests.repository.js';

@Module({
  controllers: [HarvestsController],
  providers: [HarvestsService, HarvestsRepository],
  exports: [HarvestsService],
})
export class HarvestsModule {}
