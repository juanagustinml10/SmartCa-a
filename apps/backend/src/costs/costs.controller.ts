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

@Controller('costs')
export class CostsController {
  constructor(private readonly service: CostsService) {}

  @Get()
  async findAll(@Query() query: QueryCostDto) {
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
    const cost = await this.service.findById(id);
    return { data: cost };
  }

  @Post()
  async create(@Body() dto: CreateCostDto) {
    const cost = await this.service.create(dto);
    return { data: cost };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostDto,
  ) {
    const cost = await this.service.update(id, dto);
    return { data: cost };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
