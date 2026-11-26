import type { Permission } from '../../generated/prisma/client.js';

export interface IPermissionsRepository {
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByModule(module: string): Promise<Permission[]>;
}
