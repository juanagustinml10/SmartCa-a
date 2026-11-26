import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from './company.repository.js';
import type { CreateCompanyDto } from './dto/create-company.dto.js';
import type { UpdateCompanyDto } from './dto/update-company.dto.js';
import type { Company } from '../generated/prisma/client.js';

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async findAll(companyId: string): Promise<Company[]> {
    return this.repository.findAll(companyId);
  }

  async findById(companyId: string, id: string): Promise<Company> {
    const company = await this.repository.findById(companyId, id);
    if (!company)
      throw new NotFoundException(`Empresa con ID "${id}" no encontrada`);
    return company;
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.repository.create(dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.findById(companyId, id);
    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findById(companyId, id);
    await this.repository.softDelete(companyId, id);
  }
}
