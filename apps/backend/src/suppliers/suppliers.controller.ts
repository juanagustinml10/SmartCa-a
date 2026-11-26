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
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @Permissions('suppliers.view')
  async findAll(
    @Query() query: QuerySupplierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @Permissions('suppliers.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const supplier = await this.service.findById(user.companyId, id);
    return { data: supplier };
  }

  @Post()
  @Permissions('suppliers.create')
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const supplier = await this.service.create(user.companyId, dto);
    return { data: supplier };
  }

  @Patch(':id')
  @Permissions('suppliers.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const supplier = await this.service.update(user.companyId, id, dto);
    return { data: supplier };
  }

  @Delete(':id')
  @Permissions('suppliers.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
