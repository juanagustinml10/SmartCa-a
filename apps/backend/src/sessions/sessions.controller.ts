import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Get()
  async findMySessions(@CurrentUser() user: JwtPayload) {
    const data = await this.service.findByUser(user.sub);
    return { data };
  }

  @Post(':id/revoke')
  async revoke(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.revoke(id);
    return { data: null };
  }

  @Post('revoke-all')
  async revokeAll(@CurrentUser() user: JwtPayload) {
    await this.service.revokeAll(user.sub);
    return { data: null };
  }
}
