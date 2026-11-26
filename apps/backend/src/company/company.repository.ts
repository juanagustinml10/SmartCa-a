import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ICompanyRepository } from './interfaces/company-repository.interface.js';
import type { CreateCompanyDto } from './dto/create-company.dto.js';
import type { UpdateCompanyDto } from './dto/update-company.dto.js';
import type { Company } from '../generated/prisma/client.js';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { id: companyId, deletedAt: null },
    });
  }

  async findById(companyId: string, id: string): Promise<Company | null> {
    // La empresa no tiene un `companyId` propio: su propio ID es el límite.
    if (id !== companyId) return null;
    return this.prisma.company.findFirst({ where: { id, deletedAt: null } });
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({ data: dto });
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    if (id !== companyId) {
      throw new Error('Empresa fuera del alcance del usuario autenticado');
    }
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async softDelete(companyId: string, id: string): Promise<Company> {
    if (id !== companyId) {
      throw new Error('Empresa fuera del alcance del usuario autenticado');
    }
    return this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
