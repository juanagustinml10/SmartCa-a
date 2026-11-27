import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { requireEnv } from '../common/config/required-env.js';
import { hashToken, tokenMatches } from './token-hash.js';
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

    // La sesión se crea con un ID conocido antes de firmar el access token:
    // así el JWT queda atado a una fila real y puede revocarse.
    const sessionId = randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code as JwtPayload['role'],
      companyId: user.companyId,
      sessionId,
    };

    const accessTokenExpiry = remember ? '7d' : '2h';
    const refreshTokenExpiry = remember ? '30d' : '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessTokenExpiry }),
      this.jwtService.signAsync(
        { sub: user.id, tokenId: randomUUID(), sessionId },
        {
          secret: requireEnv('JWT_REFRESH_SECRET'),
          expiresIn: refreshTokenExpiry,
        },
      ),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await hashToken(refreshToken),
        lastAccessAt: new Date(),
      },
    });

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash: await hashToken(accessToken),
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
    let payload: { sub: string; sessionId?: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: requireEnv('JWT_REFRESH_SECRET'),
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

    const tokenValid = await tokenMatches(refreshToken, user.refreshTokenHash);
    if (!tokenValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // El refresh token hereda la sesión del login; no se aceptan tokens de
    // sesiones revocadas ni de sesiones ajenas al usuario.
    if (!payload.sessionId) {
      throw new UnauthorizedException('Sesión expirada');
    }
    const session = await this.prisma.session.findFirst({
      where: { id: payload.sessionId, userId: user.id, isActive: true },
    });
    if (!session || (session.expiredAt && session.expiredAt <= new Date())) {
      throw new UnauthorizedException('Sesión expirada');
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.code as JwtPayload['role'],
      companyId: user.companyId,
      sessionId: session.id,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, { expiresIn: '2h' }),
      this.jwtService.signAsync(
        { sub: user.id, tokenId: randomUUID(), sessionId: session.id },
        {
          secret: requireEnv('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await hashToken(newRefreshToken) },
    });

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        tokenHash: await hashToken(newAccessToken),
        lastActiveAt: new Date(),
      },
    });

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

      // Cerrar todas las sesiones del usuario, no sólo las de una IP.
      await this.prisma.session.updateMany({
        where: { userId, isActive: true },
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
        createdAt: true,
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
