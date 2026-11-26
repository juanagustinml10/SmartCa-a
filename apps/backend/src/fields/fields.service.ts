import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FieldsRepository } from './fields.repository.js';
import type { CreateFieldDto } from './dto/create-field.dto.js';
import type { UpdateFieldDto } from './dto/update-field.dto.js';
import type { QueryFieldDto } from './dto/query-field.dto.js';
import type {
  PaginatedResult,
  FieldWithRelations,
} from './interfaces/fields-repository.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Field } from '../generated/prisma/client.js';

@Injectable()
export class FieldsService {
  constructor(
    private readonly repository: FieldsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryFieldDto,
  ): Promise<PaginatedResult<Field>> {
    return this.repository.findAll(companyId, query);
  }

  async findById(companyId: string, id: string): Promise<FieldWithRelations> {
    const field = await this.repository.findById(companyId, id);
    if (!field) {
      throw new NotFoundException(`Campo con ID "${id}" no encontrado`);
    }
    return field;
  }

  async create(companyId: string, dto: CreateFieldDto): Promise<Field> {
    const existing = await this.prisma.field.findFirst({
      where: {
        name: dto.name,
        deletedAt: null,
        farm: { companyId, deletedAt: null },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un campo con el nombre "${dto.name}" en esta empresa`,
      );
    }

    // El establecimiento tiene que pertenecer a la empresa del token.
    const farm = await this.prisma.farm.findFirst({
      where: { id: dto.farmId, companyId, deletedAt: null },
    });
    if (!farm)
      throw new NotFoundException(
        `Establecimiento con ID "${dto.farmId}" no encontrado`,
      );

    if (dto.varietyId) {
      const variety = await this.prisma.variety.findUnique({
        where: { id: dto.varietyId },
      });
      if (!variety)
        throw new NotFoundException(
          `Variedad con ID "${dto.varietyId}" no encontrada`,
        );
    }

    const status = await this.prisma.fieldStatus.findUnique({
      where: { id: dto.fieldStatusId },
    });
    if (!status)
      throw new NotFoundException(
        `Estado con ID "${dto.fieldStatusId}" no encontrado`,
      );

    return this.repository.create(companyId, dto);
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateFieldDto,
  ): Promise<Field> {
    const field = await this.repository.findById(companyId, id);
    if (!field)
      throw new NotFoundException(`Campo con ID "${id}" no encontrado`);

    if (dto.name && dto.name !== field.name) {
      const existing = await this.prisma.field.findFirst({
        where: {
          name: dto.name,
          deletedAt: null,
          id: { not: id },
          farm: { companyId, deletedAt: null },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe un campo con el nombre "${dto.name}" en esta empresa`,
        );
      }
    }

    if (dto.varietyId) {
      const variety = await this.prisma.variety.findUnique({
        where: { id: dto.varietyId },
      });
      if (!variety)
        throw new NotFoundException(
          `Variedad con ID "${dto.varietyId}" no encontrada`,
        );
    }

    if (dto.fieldStatusId) {
      const status = await this.prisma.fieldStatus.findUnique({
        where: { id: dto.fieldStatusId },
      });
      if (!status)
        throw new NotFoundException(
          `Estado con ID "${dto.fieldStatusId}" no encontrado`,
        );
    }

    return this.repository.update(companyId, id, dto);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const field = await this.repository.findById(companyId, id);
    if (!field)
      throw new NotFoundException(`Campo con ID "${id}" no encontrado`);
    await this.repository.softDelete(companyId, id);
  }
}
