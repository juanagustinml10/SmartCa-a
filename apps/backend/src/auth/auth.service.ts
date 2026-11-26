import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LoggerService } from '../logger/logger.service.js';
import type { JwtPayload } from '@smartcana/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
    private readonly logger: LoggerService,
  ) {}

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
    remember?: boolean,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true, company: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code as JwtPayload['role'],
      companyId: user.companyId,
    };

    const accessTokenExpiry = remember ? '7d' : '2h';
    const refreshTokenExpiry = remember ? '30d' : '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessTokenExpiry }),
      this.jwtService.signAsync(
        { sub: user.id, tokenId: crypto.randomUUID() },
        {
          secret:
            process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret-change-me',
          expiresIn: refreshTokenExpiry,
        },
      ),
    ]);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: refreshHash, lastAccessAt: new Date() },
    });

    const tokenHash = await bcrypt.hash(accessToken, 10);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress,
        userAgent,
      },
    });

    this.logger.info(`Login exitoso: ${user.email}`, 'Auth', {
      userId: user.id,
    });
    await this.audit.log({
      userId: user.id,
      companyId: user.companyId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'login',
      entity: 'User',
      entityId: user.id,
      description: `Inicio de sesión${remember ? ' (recordar)' : ''}`,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.code,
        companyId: user.companyId,
        companyName: user.company.name,
      },
    };
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret-change-me',
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedException('Usuario no disponible');
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión expirada');
    }

    const tokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!tokenValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code as JwtPayload['role'],
      companyId: user.companyId,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, { expiresIn: '2h' }),
      this.jwtService.signAsync(
        { sub: user.id, tokenId: crypto.randomUUID() },
        {
          secret:
            process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret-change-me',
          expiresIn: '7d',
        },
      ),
    ]);

    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshHash },
    });

    const sessionTokenHash = await bcrypt.hash(newAccessToken, 10);
    const existingSession = await this.prisma.session.findFirst({
      where: { userId: user.id, isActive: true, ipAddress },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSession) {
      await this.prisma.session.update({
        where: { id: existingSession.id },
        data: { tokenHash: sessionTokenHash, lastActiveAt: new Date() },
      });
    }

    this.logger.info(`Token refrescado: ${user.email}`, 'Auth', {
      userId: user.id,
    });
    await this.audit.log({
      userId: user.id,
      companyId: user.companyId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'token_refresh',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });

      await this.prisma.session.updateMany({
        where: { userId, isActive: true, ipAddress },
        data: { isActive: false, expiredAt: new Date() },
      });

      await this.audit.log({
        userId,
        companyId: user.companyId,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'logout',
        entity: 'User',
        entityId: userId,
        ipAddress,
        userAgent,
      });
      this.logger.info(`Logout: ${user.email}`, 'Auth', { userId });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        phone: true,
        position: true,
        language: true,
        timezone: true,
        status: true,
        lastAccessAt: true,
        role: { select: { code: true, name: true } },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            locale: true,
            currency: true,
            timezone: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }
}
