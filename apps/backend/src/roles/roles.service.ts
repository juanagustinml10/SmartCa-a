import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';
import type { QueryRoleDto } from './dto/query-role.dto.js';
import type { RoleWithPermissions } from './interfaces/roles-repository.interface.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class RolesService {
  constructor(private readonly repository: RolesRepository) {}

  async findAll(
    companyId: string,
    query: QueryRoleDto,
  ): Promise<PaginatedResult<RoleWithPermissions>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(id: string): Promise<RoleWithPermissions> {
    const role = await this.repository.findById(id);
    if (!role) throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    return role;
  }

  async create(
    companyId: string,
    dto: CreateRoleDto,
  ): Promise<RoleWithPermissions> {
    const existing = await this.repository.findByCode(companyId, dto.code);
    if (existing) {
      throw new ConflictException(
        `Ya existe un rol con el código "${dto.code}" en esta empresa`,
      );
    }

    return this.repository.create(companyId, dto);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleWithPermissions> {
    const role = await this.findById(id);

    if (role.isSystem) {
      throw new ForbiddenException('No se pueden modificar roles del sistema');
    }

    if (dto.code && dto.code !== role.code) {
      const existing = await this.repository.findByCode(
        role.companyId,
        dto.code,
      );
      if (existing) {
        throw new ConflictException(
          `Ya existe un rol con el código "${dto.code}" en esta empresa`,
        );
      }
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);

    if (role.isSystem) {
      throw new ForbiddenException('No se pueden eliminar roles del sistema');
    }

    await this.repository.delete(id);
  }
}
