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
import { CompanyService } from './company.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get(':id')
  @Roles('admin')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findById(id);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    const data = await this.service.create(dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
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
