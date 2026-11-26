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
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  @Roles('admin')
  @Permissions('companies.view')
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findAll(user.companyId);
    return { data };
  }

  @Get(':id')
  @Roles('admin')
  @Permissions('companies.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.findById(user.companyId, id);
    return { data };
  }

  @Post()
  @Roles('super_admin')
  @Permissions('companies.manage')
  async create(@Body() dto: CreateCompanyDto) {
    const data = await this.service.create(dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  @Permissions('companies.manage')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.update(user.companyId, id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles('admin')
  @Permissions('companies.manage')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
