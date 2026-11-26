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
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  @Permissions('users.view')
  async findAll(@Query() query: QueryUserDto, @CurrentUser() user: JwtPayload) {
    const result = await this.service.findAll(user.companyId, query);
    return { data: result.data, meta: result.meta };
  }

  @Get(':id')
  @Roles('admin', 'ingeniero')
  @Permissions('users.view')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.findById(user.companyId, id);
    return { data };
  }

  @Post()
  @Roles('admin')
  @Permissions('users.create')
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    const data = await this.service.create(user.companyId, user.role, dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  @Permissions('users.edit')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.update(user.companyId, user.role, id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles('admin')
  @Permissions('users.delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.remove(user.companyId, id);
    return { data: null };
  }
}
