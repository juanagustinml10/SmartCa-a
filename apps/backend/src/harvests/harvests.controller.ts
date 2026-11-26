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

@Controller('harvests')
export class HarvestsController {
  constructor(private readonly service: HarvestsService) {}

  @Get()
  async findAll(@Query() query: QueryHarvestDto) {
    const result = await this.service.findAll(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('analytics')
  async getAnalytics(
    @Query('companyId') companyId?: string,
    @Query('farmId') farmId?: string,
    @Query('fieldId') fieldId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analytics = await this.service.getAnalytics({
      companyId,
      farmId,
      fieldId,
      campaignId,
      startDate,
      endDate,
    });
    return { data: analytics };
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const harvest = await this.service.findById(id);
    return { data: harvest };
  }

  @Post()
  async create(@Body() dto: CreateHarvestDto) {
    const harvest = await this.service.create(dto);
    return { data: harvest };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHarvestDto,
  ) {
    const harvest = await this.service.update(id, dto);
    return { data: harvest };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
