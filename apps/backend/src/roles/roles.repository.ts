import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  IRolesRepository,
  RoleWithPermissions,
} from './interfaces/roles-repository.interface.js';
import type { CreateRoleDto } from './dto/create-role.dto.js';
import type { UpdateRoleDto } from './dto/update-role.dto.js';
import type { QueryRoleDto } from './dto/query-role.dto.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRolePermissions = {
    rolePermissions: {
      include: {
        permission: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            module: true,
          },
        },
      },
    },
  } as const;

  async findAll(
    companyId: string,
    query: QueryRoleDto,
  ): Promise<PaginatedResult<RoleWithPermissions>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { companyId, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: this.includeRolePermissions,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(
    companyId: string,
    id: string,
  ): Promise<RoleWithPermissions | null> {
    return this.prisma.role.findFirst({
      where: { id, companyId, deletedAt: null },
      include: this.includeRolePermissions,
    });
  }

  async findByCode(companyId: string, code: string) {
    return this.prisma.role.findUnique({
      where: { companyId_code: { companyId, code } },
    });
  }

  async create(
    companyId: string,
    dto: CreateRoleDto,
  ): Promise<RoleWithPermissions> {
    return this.prisma.role.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: dto.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: this.includeRolePermissions,
    });
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleWithPermissions> {
    const updateData: Record<string, unknown> = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;

    if (dto.permissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id, role: { companyId } },
      });

      return this.prisma.role.update({
        where: { id, companyId },
        data: {
          ...updateData,
          rolePermissions: {
            create: dto.permissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
        include: this.includeRolePermissions,
      });
    }

    return this.prisma.role.update({
      where: { id, companyId },
      data: updateData,
      include: this.includeRolePermissions,
    });
  }

  async delete(companyId: string, id: string): Promise<void> {
    await this.prisma.role.update({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }
}
