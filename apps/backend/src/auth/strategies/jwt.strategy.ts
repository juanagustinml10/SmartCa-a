import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { requireEnv } from '../../common/config/required-env.js';
import type { JwtPayload } from '@smartcana/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
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
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    };
  }
}
