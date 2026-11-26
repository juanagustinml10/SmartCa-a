import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { QueryRoleDto } from './dto/query-role.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  async findAll(@Query() query: QueryRoleDto, @CurrentUser() user: JwtPayload) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findById(id);
    return { data };
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    const data = await this.service.create(user.companyId, dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
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
