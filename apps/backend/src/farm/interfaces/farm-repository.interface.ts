import type { Farm } from '../../generated/prisma/client.js';
import type { CreateFarmDto } from '../dto/create-farm.dto.js';
import type { UpdateFarmDto } from '../dto/update-farm.dto.js';

export interface IFarmRepository {
  findAll(companyId: string): Promise<Farm[]>;
  findById(companyId: string, id: string): Promise<Farm | null>;
  create(companyId: string, dto: CreateFarmDto): Promise<Farm>;
  update(
    companyId: string,
    id: string,
    dto: UpdateFarmDto,
  ): Promise<Farm>;
  softDelete(companyId: string, id: string): Promise<Farm>;
}
