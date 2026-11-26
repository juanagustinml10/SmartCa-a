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
import { FieldsService } from './fields.service.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { QueryFieldDto } from './dto/query-field.dto.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('fields')
export class FieldsController {
  constructor(private readonly service: FieldsService) {}

  @Get()
  @Permissions('fields.view')
  async findAll(
    @Query() query: QueryFieldDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @Permissions('fields.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const field = await this.service.findById(user.companyId, id);
    return { data: field };
  }

  @Post()
  @Permissions('fields.create')
  async create(@Body() dto: CreateFieldDto, @CurrentUser() user: JwtPayload) {
    const field = await this.service.create(user.companyId, dto);
    return { data: field };
  }

  @Patch(':id')
  @Permissions('fields.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const field = await this.service.update(user.companyId, id, dto);
    return { data: field };
  }

  @Delete(':id')
  @Permissions('fields.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
