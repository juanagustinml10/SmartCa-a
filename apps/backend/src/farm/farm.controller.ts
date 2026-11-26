import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FarmService } from './farm.service.js';
import { CreateFarmDto } from './dto/create-farm.dto.js';
import { UpdateFarmDto } from './dto/update-farm.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('farms')
export class FarmController {
  constructor(private readonly service: FarmService) {}

  @Get()
  @Roles('admin', 'ingeniero', 'supervisor')
  @Permissions('fields.view')
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findAll(user.companyId);
    return { data };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero', 'supervisor')
  @Permissions('fields.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.findById(user.companyId, id);
    return { data };
  }

  @Post()
  @Roles('admin')
  @Permissions('fields.create')
  async create(@Body() dto: CreateFarmDto, @CurrentUser() user: JwtPayload) {
    const data = await this.service.create(user.companyId, dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin', 'ingeniero')
  @Permissions('fields.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.update(user.companyId, id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles('admin')
  @Permissions('fields.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
