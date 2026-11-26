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
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  @Permissions('roles.view')
  async findAll(@Query() query: QueryRoleDto, @CurrentUser() user: JwtPayload) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero')
  @Permissions('roles.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.findById(user.companyId, id);
    return { data };
  }

  @Post()
  @Roles('admin')
  @Permissions('roles.manage')
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    const data = await this.service.create(user.companyId, user.permissions ?? [], dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  @Permissions('roles.manage')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.update(
      user.companyId,
      user.permissions ?? [],
      id,
      dto,
    );
    return { data };
  }

  @Delete(':id')
  @Roles('admin')
  @Permissions('roles.manage')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
