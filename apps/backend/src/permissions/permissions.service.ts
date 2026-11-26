import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository.js';
import type { Permission } from '../generated/prisma/client.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly repository: PermissionsRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.repository.findById(id);
    if (!permission)
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    return permission;
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.repository.findByModule(module);
  }
}
