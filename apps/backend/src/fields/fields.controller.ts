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

@Controller('fields')
export class FieldsController {
  constructor(private readonly service: FieldsService) {}

  @Get()
  async findAll(@Query() query: QueryFieldDto) {
    const result = await this.service.findAll(query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const field = await this.service.findById(id);
    return { data: field };
  }

  @Post()
  async create(@Body() dto: CreateFieldDto) {
    const field = await this.service.create(dto);
    return { data: field };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldDto,
  ) {
    const field = await this.service.update(id, dto);
    return { data: field };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { data: null };
  }
}
