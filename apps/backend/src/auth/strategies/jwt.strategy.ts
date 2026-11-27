import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import { requireEnv } from '../../common/config/required-env.js';
import { tokenMatches } from '../token-hash.js';
import type { JwtPayload } from '@smartcana/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token || !payload.sessionId) {
      throw new UnauthorizedException('Sesión inválida');
    }

    // Un access token sólo es válido mientras siga activa la sesión que lo
    // emitió. El ID de sesión y el usuario se validan juntos para impedir
    // reutilizar tokens entre cuentas o empresas.
    const session = await this.prisma.session.findFirst({
      where: { id: payload.sessionId, userId: payload.sub, isActive: true },
      select: { id: true, tokenHash: true, expiredAt: true },
    });
    if (!session || (session.expiredAt && session.expiredAt <= new Date())) {
      throw new UnauthorizedException('Sesión expirada o revocada');
    }
    if (!(await tokenMatches(token, session.tokenHash))) {
      throw new UnauthorizedException('Sesión inválida');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        status: true,
        deletedAt: true,
        companyId: true,
        email: true,
        role: {
          select: {
            code: true,
            rolePermissions: {
              select: { permission: { select: { code: true } } },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedException('Usuario inactivo o eliminado');
    }

    // El estado real se rehidrata en cada pedido: un cambio de rol, de empresa
    // o de permisos no queda congelado en un token vigente.
    return {
      sub: user.id,
      email: user.email,
      role: user.role.code as JwtPayload['role'],
      companyId: user.companyId,
      sessionId: session.id,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    };
  }
}
