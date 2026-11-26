import type { Setting } from '../../generated/prisma/client.js';
import type { CreateSettingDto } from '../dto/create-setting.dto.js';

export interface ISettingsRepository {
  findAll(companyId: string): Promise<Setting[]>;
  findByKey(companyId: string, key: string): Promise<Setting | null>;
  upsert(companyId: string, dto: CreateSettingDto): Promise<Setting>;
  remove(companyId: string, key: string): Promise<void>;
}
