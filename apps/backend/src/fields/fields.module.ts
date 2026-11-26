import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller.js';
import { FieldsService } from './fields.service.js';
import { FieldsRepository } from './fields.repository.js';

@Module({
  controllers: [FieldsController],
  providers: [FieldsService, FieldsRepository],
  exports: [FieldsService],
})
export class FieldsModule {}
