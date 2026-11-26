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
import { CostsService } from './costs.service.js';
import { CreateCostDto } from './dto/create-cost.dto.js';
import { UpdateCostDto } from './dto/update-cost.dto.js';
import { QueryCostDto } from './dto/query-cost.dto.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('costs')
export class CostsController {
  constructor(private readonly service: CostsService) {}

  @Get()
  @Permissions('costs.view')
  async findAll(
    @Query() query: QueryCostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get('analytics')
  @Permissions('costs.view')
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
  @Permissions('costs.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const cost = await this.service.findById(user.companyId, id);
    return { data: cost };
  }

  @Post()
  @Permissions('costs.create')
  async create(@Body() dto: CreateCostDto, @CurrentUser() user: JwtPayload) {
    const cost = await this.service.create(user.companyId, dto);
    return { data: cost };
  }

  @Patch(':id')
  @Permissions('costs.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const cost = await this.service.update(user.companyId, id, dto);
    return { data: cost };
  }

  @Delete(':id')
  @Permissions('costs.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
