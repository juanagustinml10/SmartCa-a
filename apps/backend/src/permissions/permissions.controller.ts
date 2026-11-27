import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  @Permissions('permissions.manage')
  async findAll(@Query('module') module?: string) {
    if (module) {
      const data = await this.service.findByModule(module);
      return { data };
    }
    const data = await this.service.findAll();
    return { data };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero')
  @Permissions('permissions.manage')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findById(id);
    return { data };
  }
}
