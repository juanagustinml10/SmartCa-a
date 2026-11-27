import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';

/**
 * Los JWT pueden superar los 72 bytes que bcrypt procesa. Se hashéa primero
 * con SHA-256 y se guarda ese digest para que la comparisión cubra el token
 * completo sin revelarlo.
 */
function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hashToken(token: string): Promise<string> {
  return bcrypt.hash(digest(token), 10);
}

export function tokenMatches(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(digest(token), hash);
}
