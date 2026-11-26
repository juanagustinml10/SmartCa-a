import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ISettingsRepository } from './interfaces/settings-repository.interface.js';
import type { CreateSettingDto } from './dto/create-setting.dto.js';
import type { Setting } from '../generated/prisma/client.js';

@Injectable()
export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<Setting[]> {
    return this.prisma.setting.findMany({ where: { companyId } });
  }

  async findByKey(companyId: string, key: string): Promise<Setting | null> {
    return this.prisma.setting.findUnique({
      where: { companyId_key: { companyId, key } },
    });
  }

  async upsert(companyId: string, dto: CreateSettingDto): Promise<Setting> {
    return this.prisma.setting.upsert({
      where: { companyId_key: { companyId, key: dto.key } },
      update: { value: dto.value },
      create: { companyId, key: dto.key, value: dto.value },
    });
  }

  async remove(companyId: string, key: string): Promise<void> {
    await this.prisma.setting.delete({
      where: { companyId_key: { companyId, key } },
    });
  }
}
