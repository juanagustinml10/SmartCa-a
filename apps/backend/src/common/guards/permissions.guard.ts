import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import type { PermissionCode } from '@smartcana/types';

/**
 * Guarda de permisos granulares. No modifica endpoints que no declaran
 * `@Permissions`, por lo que es compatible con el comportamiento existente.
 * Los permisos se toman del usuario rehidratado por JwtStrategy, nunca del
 * cuerpo o de la query.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { permissions?: string[] };
    }>();
    const granted = new Set(request.user?.permissions ?? []);
    if (!required.some((permission) => granted.has(permission))) {
      throw new ForbiddenException('Permiso insuficiente para esta acción');
    }
    return true;
  }
}
