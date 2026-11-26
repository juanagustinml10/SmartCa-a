import type { Supplier } from '../../generated/prisma/client.js';
import type { CreateSupplierDto } from '../dto/create-supplier.dto.js';
import type { UpdateSupplierDto } from '../dto/update-supplier.dto.js';
import type { QuerySupplierDto } from '../dto/query-supplier.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ISuppliersRepository {
  findAll(
    companyId: string,
    query: QuerySupplierDto,
  ): Promise<PaginatedResult<Supplier>>;
  findById(companyId: string, id: string): Promise<Supplier | null>;
  create(companyId: string, dto: CreateSupplierDto): Promise<Supplier>;
  update(
    companyId: string,
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier>;
  softDelete(companyId: string, id: string): Promise<Supplier>;
}
