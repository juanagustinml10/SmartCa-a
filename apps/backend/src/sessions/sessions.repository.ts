import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ISessionsRepository } from './interfaces/sessions-repository.interface.js';
import type { Session } from '../generated/prisma/client.js';

@Injectable()
export class SessionsRepository implements ISessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  async create(data: {
    userId: string;
    tokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
  }): Promise<Session> {
    return this.prisma.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceInfo: data.deviceInfo,
        location: data.location,
      },
    });
  }

  async updateLastActive(id: string): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { isActive: false, expiredAt: new Date() },
    });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, expiredAt: new Date() },
    });
  }
}
