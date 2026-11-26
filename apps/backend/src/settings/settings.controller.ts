import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import type { UpdateSettingDto } from './dto/update-setting.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  async findAll(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findAll(user.companyId);
    return { data };
  }

  @Get(':key')
  @Roles('admin', 'ingeniero', 'supervisor')
  async get(@Param('key') key: string, @CurrentUser() user: JwtPayload) {
    const value = await this.service.get(user.companyId, key);
    return { data: { key, value } };
  }

  @Put(':key')
  @Roles('admin')
  async set(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.service.set(user.companyId, {
      key,
      value: dto.value,
    });
    return { data };
  }

  @Delete(':key')
  @Roles('admin')
  async remove(@Param('key') key: string, @CurrentUser() user: JwtPayload) {
    await this.service.remove(user.companyId, key);
    return { data: null };
  }
}
