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
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { QuerySupplierDto } from './dto/query-supplier.dto.js';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  async findAll(@Query() query: QuerySupplierDto) {
    const result = await this.service.findAll(query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const supplier = await this.service.findById(id);
    return { data: supplier };
  }

  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    const supplier = await this.service.create(dto);
    return { data: supplier };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    const supplier = await this.service.update(id, dto);
    return { data: supplier };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
