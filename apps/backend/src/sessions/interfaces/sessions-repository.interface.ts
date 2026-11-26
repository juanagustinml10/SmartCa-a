import type { Session } from '../../generated/prisma/client.js';

export interface ISessionsRepository {
  findByUser(userId: string): Promise<Session[]>;
  findById(id: string): Promise<Session | null>;
  create(data: {
    userId: string;
    tokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
  }): Promise<Session>;
  updateLastActive(id: string): Promise<Session>;
  revoke(id: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
}
