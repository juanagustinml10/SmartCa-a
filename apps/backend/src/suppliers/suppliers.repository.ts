import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ISuppliersRepository,
  PaginatedResult,
} from './interfaces/suppliers-repository.interface.js';
import type { CreateSupplierDto } from './dto/create-supplier.dto.js';
import type { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import type { QuerySupplierDto } from './dto/query-supplier.dto.js';
import type { Supplier, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class SuppliersRepository implements ISuppliersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    query: QuerySupplierDto,
  ): Promise<PaginatedResult<Supplier>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // `query.companyId` se ignora: el único ámbito válido es el del JWT.
    const where: Prisma.SupplierWhereInput = { companyId, deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
        { cuit: { contains: query.search } },
      ];
    }
    if (query.status) where.status = query.status;

    const orderBy: Prisma.SupplierOrderByWithRelationInput = {};
    if (query.sortKey) {
      orderBy[query.sortKey as keyof typeof orderBy] =
        query.sortAsc === 'false' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.supplier.count({ where }),
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

  async findById(companyId: string, id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async create(companyId: string, dto: CreateSupplierDto): Promise<Supplier> {
    return this.prisma.supplier.create({
      data: {
        companyId,
        name: dto.name,
        cuit: dto.cuit,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
        status: dto.status ?? 'active',
      },
    });
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.cuit !== undefined) data.cuit = dto.cuit;
    if (dto.contactName !== undefined) data.contactName = dto.contactName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.supplier.update({ where: { id, companyId }, data });
  }

  async softDelete(companyId: string, id: string): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }
}
