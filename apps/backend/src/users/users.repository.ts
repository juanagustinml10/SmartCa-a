import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { IUsersRepository } from './interfaces/users-repository.interface.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { QueryUserDto } from './dto/query-user.dto.js';
import type { User } from '../generated/prisma/client.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    query: QueryUserDto,
  ): Promise<PaginatedResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId, deletedAt: null };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.role) where.role = { code: query.role };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: { select: { code: true, name: true } } },
      }),
      this.prisma.user.count({ where }),
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

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        companyId: dto.companyId,
        roleId: dto.roleId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        avatar: dto.avatar,
        phone: dto.phone,
        position: dto.position,
        language: dto.language,
        timezone: dto.timezone,
        status: dto.status ?? 'active',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    passwordHash?: string,
  ): Promise<User> {
    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.status !== undefined) data.status = dto.status;
    if (passwordHash !== undefined) data.passwordHash = passwordHash;

    return this.prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
