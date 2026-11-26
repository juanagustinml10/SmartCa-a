import type { Company } from '../../generated/prisma/client.js';
import type { CreateCompanyDto } from '../dto/create-company.dto.js';
import type { UpdateCompanyDto } from '../dto/update-company.dto.js';

export interface ICompanyRepository {
  findAll(companyId: string): Promise<Company[]>;
  findById(companyId: string, id: string): Promise<Company | null>;
  create(dto: CreateCompanyDto): Promise<Company>;
  update(
    companyId: string,
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company>;
  softDelete(companyId: string, id: string): Promise<Company>;
}
