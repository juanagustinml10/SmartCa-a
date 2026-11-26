import type { Role } from '../../generated/prisma/client.js';
import type { CreateRoleDto } from '../dto/create-role.dto.js';
import type { UpdateRoleDto } from '../dto/update-role.dto.js';
import type { QueryRoleDto } from '../dto/query-role.dto.js';
import type { PaginatedResult } from '../../fields/interfaces/fields-repository.interface.js';

export interface RoleWithPermissions extends Role {
  rolePermissions: {
    id: string;
    permissionId: string;
    permission: {
      id: string;
      code: string;
      name: string;
      description: string | null;
      module: string;
    };
  }[];
}

export interface IRolesRepository {
  findAll(
    companyId: string,
    query: QueryRoleDto,
  ): Promise<PaginatedResult<RoleWithPermissions>>;
  findById(id: string): Promise<RoleWithPermissions | null>;
  findByCode(companyId: string, code: string): Promise<Role | null>;
  create(companyId: string, dto: CreateRoleDto): Promise<RoleWithPermissions>;
  update(id: string, dto: UpdateRoleDto): Promise<RoleWithPermissions>;
  delete(id: string): Promise<void>;
}
