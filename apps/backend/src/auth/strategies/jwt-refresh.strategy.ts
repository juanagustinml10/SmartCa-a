import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret-change-me',
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: { sub: string },
  ): { sub: string; refreshToken: string } {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.replace('Bearer ', '');
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token requerido');
    return { sub: payload.sub, refreshToken };
  }
}
