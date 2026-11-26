import { Module } from '@nestjs/common';
import { FarmController } from './farm.controller.js';
import { FarmService } from './farm.service.js';
import { FarmRepository } from './farm.repository.js';

@Module({
  controllers: [FarmController],
  providers: [FarmService, FarmRepository],
  exports: [FarmService],
})
export class FarmModule {}
