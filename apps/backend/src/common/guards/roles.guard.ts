import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { RoleCode } from '@smartcana/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { role: RoleCode };
    }>();
    const user = request.user;
    if (!user) throw new ForbiddenException('No autenticado');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole)
      throw new ForbiddenException('No tienes permisos para esta acción');

    return true;
  }
}
