import type {
  Field,
  FieldAlert,
  Activity,
  Cost,
  Harvest,
} from '../../generated/prisma/client.js';
import type { CreateFieldDto } from '../dto/create-field.dto.js';
import type { UpdateFieldDto } from '../dto/update-field.dto.js';
import type { QueryFieldDto } from '../dto/query-field.dto.js';

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

export interface FieldWithRelations extends Field {
  fieldStatus?: { code: string; name: string } | null;
  variety?: { code: string; name: string } | null;
  activities?: Activity[];
  costs?: Cost[];
  harvests?: Harvest[];
  alerts?: FieldAlert[];
}

export interface IFieldsRepository {
  findAll(query: QueryFieldDto): Promise<PaginatedResult<Field>>;
  findById(id: string): Promise<FieldWithRelations | null>;
  create(dto: CreateFieldDto): Promise<Field>;
  update(id: string, dto: UpdateFieldDto): Promise<Field>;
  softDelete(id: string): Promise<Field>;
}
