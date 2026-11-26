import { Injectable, NotFoundException } from '@nestjs/common';
import { SuppliersRepository } from './suppliers.repository.js';
import type { CreateSupplierDto } from './dto/create-supplier.dto.js';
import type { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import type { QuerySupplierDto } from './dto/query-supplier.dto.js';
import type { PaginatedResult } from './interfaces/suppliers-repository.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Supplier } from '../generated/prisma/client.js';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly repository: SuppliersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: QuerySupplierDto): Promise<PaginatedResult<Supplier>> {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.repository.findById(id);
    if (!supplier)
      throw new NotFoundException(`Proveedor con ID "${id}" no encontrado`);
    return supplier;
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const company = await this.prisma.company.findFirst({
      where: { id: dto.companyId, deletedAt: null },
    });
    if (!company)
      throw new NotFoundException(
        `Empresa con ID "${dto.companyId}" no encontrada`,
      );
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.repository.findById(id);
    if (!supplier)
      throw new NotFoundException(`Proveedor con ID "${id}" no encontrado`);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.repository.findById(id);
    if (!supplier)
      throw new NotFoundException(`Proveedor con ID "${id}" no encontrado`);
    await this.repository.softDelete(id);
  }
}
