import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await this.service.login(
      dto.email,
      dto.password,
      ip,
      ua,
      dto.remember,
    );
    return { data: result };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await this.service.refresh(dto.refreshToken, ip, ua);
    return { data: result };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    await this.service.logout(user.sub, ip, ua);
    return { data: null };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    const profile = await this.service.getProfile(user.sub);
    return { data: profile };
  }
}
