import type { User } from '@/types/auth';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const AUTH_STORAGE_KEY = 'smartcana_auth';
export const AUTH_EXPIRED_EVENT = 'smartcana:auth-expired';

export interface StoredAuth {
  // El perfil se carga desde `/auth/me`; mientras tanto puede ser null.
  user: User | null;
  accessToken: string;
  refreshToken: string;
  remember: boolean;
}

function readFrom(store: Storage | null): StoredAuth | null {
  if (!store) return null;
  const raw = store.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (
      typeof parsed?.accessToken !== 'string' ||
      typeof parsed?.refreshToken !== 'string' ||
      !parsed.accessToken ||
      !parsed.refreshToken
    ) {
      store.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    store.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function readStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  const local = readFrom(window.localStorage);
  if (local) return local;
  return readFrom(window.sessionStorage);
}

export function writeStoredAuth(auth: StoredAuth, remember: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  const target = remember ? window.localStorage : window.sessionStorage;
  target.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...auth, remember }));
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return readStoredAuth()?.accessToken ?? null;
}

export function notifyAuthExpired(): void {
  clearStoredAuth();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

/** Renueva la sesión con el refresh token guardado. Nunca imprime tokens. */
export async function refreshStoredTokens(): Promise<boolean> {
  const stored = readStoredAuth();
  if (!stored?.refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });
    if (!res.ok) {
      notifyAuthExpired();
      return false;
    }

    const body = (await res.json()) as {
      data?: { accessToken?: string; refreshToken?: string };
    };
    const accessToken = body.data?.accessToken;
    const refreshToken = body.data?.refreshToken;
    if (!accessToken || !refreshToken) {
      notifyAuthExpired();
      return false;
    }

    writeStoredAuth(
      { ...stored, accessToken, refreshToken },
      stored.remember,
    );
    return true;
  } catch {
    // Sin conectividad no se inventa una sesión: se marca como expirada.
    notifyAuthExpired();
    return false;
  }
}
