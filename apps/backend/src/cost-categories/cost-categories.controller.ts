import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CostCategoriesService } from './cost-categories.service.js';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto.js';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto.js';

@Controller('cost-categories')
export class CostCategoriesController {
  constructor(private readonly service: CostCategoriesService) {}

  @Get()
  async findAll() {
    const categories = await this.service.findAll();
    return { data: categories };
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.service.findById(id);
    return { data: category };
  }

  @Post()
  async create(@Body() dto: CreateCostCategoryDto) {
    const category = await this.service.create(dto);
    return { data: category };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostCategoryDto,
  ) {
    const category = await this.service.update(id, dto);
    return { data: category };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
