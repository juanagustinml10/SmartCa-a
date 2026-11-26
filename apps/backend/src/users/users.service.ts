import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { canAssignRole } from '../common/constants/roles.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { QueryUserDto } from './dto/query-user.dto.js';
import type { User } from '../generated/prisma/client.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryUserDto,
  ): Promise<PaginatedResult<User>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(companyId: string, id: string): Promise<User> {
    const user = await this.repository.findById(companyId, id);
    if (!user)
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    return user;
  }

  /** Impide que un actor asigne un rol de nivel superior al suyo. */
  private async assertRoleAssignable(roleId: string, actorRole: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.deletedAt)
      throw new BadRequestException(`Rol con ID "${roleId}" no encontrado`);
    if (!canAssignRole(actorRole, role.code)) {
      throw new ForbiddenException('No podés asignar un rol superior al tuyo');
    }
  }

  async create(
    companyId: string,
    actorRole: string,
    dto: CreateUserDto,
  ): Promise<User> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing)
      throw new ConflictException(`El email "${dto.email}" ya está registrado`);

    await this.assertRoleAssignable(dto.roleId, actorRole);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.repository.create(companyId, dto, passwordHash);
  }

  async update(
    companyId: string,
    actorRole: string,
    id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    await this.findById(companyId, id);

    if (dto.roleId) await this.assertRoleAssignable(dto.roleId, actorRole);

    if (dto.email) {
      const existing = await this.repository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `El email "${dto.email}" ya está registrado`,
        );
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.repository.update(companyId, id, dto, passwordHash);
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findById(companyId, id);
    await this.repository.softDelete(companyId, id);
  }
}
