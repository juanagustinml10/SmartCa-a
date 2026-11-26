import { Injectable, NotFoundException } from '@nestjs/common';
import { SettingsRepository } from './settings.repository.js';
import type { CreateSettingDto } from './dto/create-setting.dto.js';
import type { Setting } from '../generated/prisma/client.js';

@Injectable()
export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  async findAll(companyId: string): Promise<Setting[]> {
    return this.repository.findAll(companyId);
  }

  async get(companyId: string, key: string): Promise<string | null> {
    const setting = await this.repository.findByKey(companyId, key);
    return setting?.value ?? null;
  }

  async set(companyId: string, dto: CreateSettingDto): Promise<Setting> {
    return this.repository.upsert(companyId, dto);
  }

  async remove(companyId: string, key: string): Promise<void> {
    const setting = await this.repository.findByKey(companyId, key);
    if (!setting)
      throw new NotFoundException(`Configuración "${key}" no encontrada`);
    await this.repository.remove(companyId, key);
  }
}
