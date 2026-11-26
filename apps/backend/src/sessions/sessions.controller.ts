import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Get()
  @Permissions('sessions.view')
  async findMySessions(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findByUser(user.sub);
    return { data };
  }

  @Post(':id/revoke')
  @Permissions('sessions.revoke')
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.revoke(user.sub, id);
    return { data: null };
  }

  @Post('revoke-all')
  @Permissions('sessions.revoke')
  async revokeAll(@CurrentUser() user: JwtPayload) {
    await this.service.revokeAll(user.sub);
    return { data: null };
  }
}
