import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from './company.repository.js';
import type { CreateCompanyDto } from './dto/create-company.dto.js';
import type { UpdateCompanyDto } from './dto/update-company.dto.js';
import type { Company } from '../generated/prisma/client.js';

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async findAll(): Promise<Company[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Company> {
    const company = await this.repository.findById(id);
    if (!company)
      throw new NotFoundException(`Empresa con ID "${id}" no encontrada`);
    return company;
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.softDelete(id);
  }
}
