import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  IFieldsRepository,
  FieldWithRelations,
  PaginatedResult,
} from './interfaces/fields-repository.interface.js';
import type { CreateFieldDto } from './dto/create-field.dto.js';
import type { UpdateFieldDto } from './dto/update-field.dto.js';
import type { QueryFieldDto } from './dto/query-field.dto.js';
import type { Field, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class FieldsRepository implements IFieldsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    query: QueryFieldDto,
  ): Promise<PaginatedResult<Field>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.FieldWhereInput = {
      deletedAt: null,
      farm: { companyId, deletedAt: null },
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { soilType: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.fieldStatus = { code: query.status };
    }

    if (query.variety) {
      where.variety = { code: query.variety };
    }

    if (query.campaign) {
      where.campaignCode = query.campaign;
    }

    const orderBy: Prisma.FieldOrderByWithRelationInput = {};
    if (query.sortKey) {
      const fieldMap: Record<string, string> = {
        name: 'name',
        surfaceHa: 'areaHectares',
        estimatedProduction: 'estimatedProduction',
        healthScore: 'healthScore',
      };
      const field = (fieldMap[query.sortKey] || 'name') as keyof typeof orderBy;
      orderBy[field] = query.sortAsc === 'false' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.field.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          fieldStatus: { select: { code: true, name: true } },
          variety: { select: { code: true, name: true } },
        },
      }),
      this.prisma.field.count({ where }),
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

  async findById(
    companyId: string,
    id: string,
  ): Promise<FieldWithRelations | null> {
    const result = await this.prisma.field.findFirst({
      where: {
        id,
        deletedAt: null,
        farm: { companyId, deletedAt: null },
      },
      include: {
        fieldStatus: { select: { code: true, name: true } },
        variety: { select: { code: true, name: true } },
        activities: {
          where: { deletedAt: null },
          orderBy: { activityDate: 'desc' },
          take: 20,
          include: {
            activityType: { select: { code: true, name: true, icon: true } },
          },
        },
        costs: {
          where: { deletedAt: null },
          include: { costCategory: { select: { code: true, name: true } } },
        },
        harvests: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
          include: { campaign: { select: { code: true, name: true } } },
        },
        alerts: {
          orderBy: [{ priority: 'asc' }],
        },
      },
    });
    return result;
  }

  async create(companyId: string, dto: CreateFieldDto): Promise<Field> {
    // `companyId` se valida en el servicio contra el establecimiento; aquí se
    // declara explícitamente para que la consulta no dependa del body.
    void companyId;
    return this.prisma.field.create({
      data: {
        farmId: dto.farmId,
        name: dto.name,
        description: dto.description,
        areaHectares: dto.areaHectares,
        fieldStatusId: dto.fieldStatusId,
        varietyId: dto.varietyId,
        plantingDate: dto.plantingDate ? new Date(dto.plantingDate) : undefined,
        ratoonNumber: dto.ratoonNumber ?? 1,
        soilType: dto.soilType,
        soilPh: dto.soilPh,
        estimatedProduction: dto.estimatedProduction,
        healthScore: dto.healthScore,
        color: dto.color,
        latitude: dto.latitude,
        longitude: dto.longitude,
        campaignCode: dto.campaignCode,
      },
      include: {
        fieldStatus: { select: { code: true, name: true } },
        variety: { select: { code: true, name: true } },
      },
    });
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateFieldDto,
  ): Promise<Field> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.areaHectares !== undefined) data.areaHectares = dto.areaHectares;
    if (dto.fieldStatusId !== undefined) data.fieldStatusId = dto.fieldStatusId;
    if (dto.varietyId !== undefined) data.varietyId = dto.varietyId;
    if (dto.plantingDate !== undefined)
      data.plantingDate = new Date(dto.plantingDate);
    if (dto.ratoonNumber !== undefined) data.ratoonNumber = dto.ratoonNumber;
    if (dto.soilType !== undefined) data.soilType = dto.soilType;
    if (dto.soilPh !== undefined) data.soilPh = dto.soilPh;
    if (dto.estimatedProduction !== undefined)
      data.estimatedProduction = dto.estimatedProduction;
    if (dto.healthScore !== undefined) data.healthScore = dto.healthScore;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.campaignCode !== undefined) data.campaignCode = dto.campaignCode;

    return this.prisma.field.update({
      where: { id, farm: { companyId } },
      data,
      include: {
        fieldStatus: { select: { code: true, name: true } },
        variety: { select: { code: true, name: true } },
      },
    });
  }

  async softDelete(companyId: string, id: string): Promise<Field> {
    return this.prisma.field.update({
      where: { id, farm: { companyId } },
      data: { deletedAt: new Date() },
    });
  }
}
