import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { isRoleAtLeast } from '../constants/roles.js';
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

    // Un rol jerárquicamente superior también satisface el requisito. Así
    // super_admin y gerente no quedan excluidos de los endpoints existentes.
    const hasRole = requiredRoles.some((required) =>
      isRoleAtLeast(user.role, required),
    );
    if (!hasRole)
      throw new ForbiddenException('No tienes permisos para esta acción');

    return true;
  }
}
