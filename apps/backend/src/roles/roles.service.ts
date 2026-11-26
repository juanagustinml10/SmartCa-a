import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';
import type { QueryRoleDto } from './dto/query-role.dto.js';
import type { RoleWithPermissions } from './interfaces/roles-repository.interface.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RolesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryRoleDto,
  ): Promise<PaginatedResult<RoleWithPermissions>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(
    companyId: string,
    id: string,
  ): Promise<RoleWithPermissions> {
    const role = await this.repository.findById(companyId, id);
    if (!role) throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    return role;
  }

  /**
   * Nadie puede otorgar permisos que él mismo no posee. Esto evita que un
   * administrador cree un rol con `permissions.manage` o `companies.manage`.
   */
  private async assertPermissionsAssignable(
    permissionIds: string[],
    actorPermissions: string[],
  ) {
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true, code: true },
    });
    if (permissions.length !== new Set(permissionIds).size) {
      throw new BadRequestException('Uno de los permisos indicados no existe');
    }
    if (permissions.some((p) => !actorPermissions.includes(p.code))) {
      throw new ForbiddenException(
        'No podés otorgar permisos que no tenés asignados',
      );
    }
  }

  async create(
    companyId: string,
    actorPermissions: string[],
    dto: CreateRoleDto,
  ): Promise<RoleWithPermissions> {
    const existing = await this.repository.findByCode(companyId, dto.code);
    if (existing) {
      throw new ConflictException(
        `Ya existe un rol con el código "${dto.code}" en esta empresa`,
      );
    }
    await this.assertPermissionsAssignable(dto.permissionIds, actorPermissions);
    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    actorPermissions: string[],
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleWithPermissions> {
    const role = await this.findById(companyId, id);

    if (role.isSystem) {
      throw new ForbiddenException('No se pueden modificar roles del sistema');
    }

    if (dto.code && dto.code !== role.code) {
      const existing = await this.repository.findByCode(companyId, dto.code);
      if (existing) {
        throw new ConflictException(
          `Ya existe un rol con el código "${dto.code}" en esta empresa`,
        );
      }
    }

    if (dto.permissionIds) {
      await this.assertPermissionsAssignable(dto.permissionIds, actorPermissions);
    }

    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const role = await this.findById(companyId, id);

    if (role.isSystem) {
      throw new ForbiddenException('No se pueden eliminar roles del sistema');
    }

    await this.repository.delete(companyId, id);
  }
}
