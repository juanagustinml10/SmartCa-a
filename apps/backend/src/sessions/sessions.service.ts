import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Session } from '../generated/prisma/client.js';

@Injectable()
export class SessionsService {
  constructor(
    private readonly repository: SessionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByUser(userId: string): Promise<Session[]> {
    return this.repository.findByUser(userId);
  }

  async revoke(userId: string, id: string): Promise<void> {
    const session = await this.repository.findById(id);
    // No revelar si la sesión ajena existe: se responde como "no encontrada".
    if (!session || session.userId !== userId) {
      throw new NotFoundException(`Sesión con ID "${id}" no encontrada`);
    }
    await this.repository.revoke(id);
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.repository.revokeAll(userId);
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async createSession(data: {
    userId: string;
    tokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
  }): Promise<Session> {
    return this.repository.create(data);
  }

  async updateLastActive(id: string): Promise<void> {
    await this.repository.updateLastActive(id);
  }
}
