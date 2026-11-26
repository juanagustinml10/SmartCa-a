import { Injectable, NotFoundException } from '@nestjs/common';
import { SuppliersRepository } from './suppliers.repository.js';
import type { CreateSupplierDto } from './dto/create-supplier.dto.js';
import type { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import type { QuerySupplierDto } from './dto/query-supplier.dto.js';
import type { PaginatedResult } from './interfaces/suppliers-repository.interface.js';
import type { Supplier } from '../generated/prisma/client.js';

@Injectable()
export class SuppliersService {
  constructor(private readonly repository: SuppliersRepository) {}

  async findAll(
    companyId: string,
    query: QuerySupplierDto,
  ): Promise<PaginatedResult<Supplier>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(companyId: string, id: string): Promise<Supplier> {
    const supplier = await this.repository.findById(companyId, id);
    if (!supplier)
      throw new NotFoundException(`Proveedor con ID "${id}" no encontrado`);
    return supplier;
  }

  async create(companyId: string, dto: CreateSupplierDto): Promise<Supplier> {
    // dto.companyId existe por compatibilidad del DTO, pero nunca se usa.
    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    await this.findById(companyId, id);
    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findById(companyId, id);
    await this.repository.softDelete(companyId, id);
  }
}
