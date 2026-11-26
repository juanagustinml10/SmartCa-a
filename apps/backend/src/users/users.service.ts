import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { QueryUserDto } from './dto/query-user.dto.js';
import type { User } from '../generated/prisma/client.js';
import type { PaginatedResult } from '../fields/interfaces/fields-repository.interface.js';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findAll(
    companyId: string,
    query: QueryUserDto,
  ): Promise<PaginatedResult<User>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user)
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing)
      throw new ConflictException(`El email "${dto.email}" ya está registrado`);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.repository.create(dto, passwordHash);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

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

    return this.repository.update(id, dto, passwordHash);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.softDelete(id);
  }
}
