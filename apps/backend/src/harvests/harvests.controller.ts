import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HarvestsService } from './harvests.service.js';
import { CreateHarvestDto } from './dto/create-harvest.dto.js';
import { UpdateHarvestDto } from './dto/update-harvest.dto.js';
import { QueryHarvestDto } from './dto/query-harvest.dto.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('harvests')
export class HarvestsController {
  constructor(private readonly service: HarvestsService) {}

  @Get()
  @Permissions('harvests.view')
  async findAll(
    @Query() query: QueryHarvestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get('analytics')
  @Permissions('harvests.view')
  async getAnalytics(
    @Query('farmId') farmId?: string,
    @Query('fieldId') fieldId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    // Se ignora cualquier `?companyId=` del cliente: el ámbito es el token.
    const analytics = await this.service.getAnalytics(user!.companyId, {
      farmId,
      fieldId,
      campaignId,
      startDate,
      endDate,
    });
    return { data: analytics };
  }

  @Get(':id')
  @Permissions('harvests.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const harvest = await this.service.findById(user.companyId, id);
    return { data: harvest };
  }

  @Post()
  @Permissions('harvests.create')
  async create(
    @Body() dto: CreateHarvestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const harvest = await this.service.create(user.companyId, dto);
    return { data: harvest };
  }

  @Patch(':id')
  @Permissions('harvests.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHarvestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const harvest = await this.service.update(user.companyId, id, dto);
    return { data: harvest };
  }

  @Delete(':id')
  // El catálogo de permisos no define `harvests.delete`; se usa `harvests.edit`.
  @Permissions('harvests.edit')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
