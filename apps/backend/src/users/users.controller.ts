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
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  async findAll(@Query() query: QueryUserDto, @CurrentUser() user: JwtPayload) {
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
  async create(@Body() dto: CreateUserDto) {
    const data = await this.service.create(dto);
    return { data };
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
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
