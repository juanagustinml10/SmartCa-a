import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ICompanyRepository } from './interfaces/company-repository.interface.js';
import type { CreateCompanyDto } from './dto/create-company.dto.js';
import type { UpdateCompanyDto } from './dto/update-company.dto.js';
import type { Company } from '../generated/prisma/client.js';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ where: { deletedAt: null } });
  }

  async findById(id: string): Promise<Company | null> {
    return this.prisma.company.findFirst({ where: { id, deletedAt: null } });
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({ data: dto });
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async softDelete(id: string): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
