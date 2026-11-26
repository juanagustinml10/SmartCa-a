import type { Company } from '../../generated/prisma/client.js';
import type { CreateCompanyDto } from '../dto/create-company.dto.js';
import type { UpdateCompanyDto } from '../dto/update-company.dto.js';

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  create(dto: CreateCompanyDto): Promise<Company>;
  update(id: string, dto: UpdateCompanyDto): Promise<Company>;
  softDelete(id: string): Promise<Company>;
}
