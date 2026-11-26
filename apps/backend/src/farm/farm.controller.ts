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
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('farms')
export class FarmController {
  constructor(private readonly service: FarmService) {}

  @Get()
  @Roles('admin', 'ingeniero', 'supervisor')
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findAll(user.companyId);
    return { data };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero', 'supervisor')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findById(id);
    return { data };
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateFarmDto, @CurrentUser() user: JwtPayload) {
    const data = await this.service.create(user.companyId, dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin', 'ingeniero')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmDto,
  ) {
    const data = await this.service.update(id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
