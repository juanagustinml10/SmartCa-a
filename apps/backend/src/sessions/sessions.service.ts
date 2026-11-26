import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository.js';
import type { Session } from '../generated/prisma/client.js';

@Injectable()
export class SessionsService {
  constructor(private readonly repository: SessionsRepository) {}

  async findByUser(userId: string): Promise<Session[]> {
    return this.repository.findByUser(userId);
  }

  async revoke(id: string): Promise<void> {
    const session = await this.repository.findById(id);
    if (!session)
      throw new NotFoundException(`Sesión con ID "${id}" no encontrada`);
    await this.repository.revoke(id);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.repository.revokeAll(userId);
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
