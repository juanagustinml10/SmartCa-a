import type { User } from '../../generated/prisma/client.js';
import type { CreateUserDto } from '../dto/create-user.dto.js';
import type { UpdateUserDto } from '../dto/update-user.dto.js';
import type { QueryUserDto } from '../dto/query-user.dto.js';
import type { PaginatedResult } from '../../fields/interfaces/fields-repository.interface.js';

export interface IUsersRepository {
  findAll(
    companyId: string,
    query: QueryUserDto,
  ): Promise<PaginatedResult<User>>;
  findById(companyId: string, id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(
    companyId: string,
    dto: CreateUserDto,
    passwordHash: string,
  ): Promise<User>;
  update(
    companyId: string,
    id: string,
    dto: UpdateUserDto,
    passwordHash?: string,
  ): Promise<User>;
  softDelete(companyId: string, id: string): Promise<User>;
}
