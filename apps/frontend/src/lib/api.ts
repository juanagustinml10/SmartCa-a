import {
  API_BASE_URL,
  getAccessToken,
  notifyAuthExpired,
  refreshStoredTokens,
} from './auth-tokens';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function errorMessage(body: unknown, status: number): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.map(String).join(', ');
  if (typeof message === 'string') return message;
  return `Error ${status}`;
}

async function readBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return { data: null } as T;
  return (await res.json()) as T;
}

/**
 * Cliente HTTP con JWT centralizado. El `companyId` nunca se envía desde el
 * cliente: el backend lo deriva del token.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // `...options` va antes de `headers` para que la cabecera construida no sea
  // sobrescrita por un `headers` externo.
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && allowRefresh && !endpoint.startsWith('/auth/')) {
    const refreshed = await refreshStoredTokens();
    if (refreshed) return request<T>(endpoint, options, false);
    throw new ApiError('Sesión expirada', 401, null);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(errorMessage(body, res.status), res.status, body);
  }

  return readBody<ApiResponse<T>>(res);
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

/** Endpoints de autenticación: nunca refrescan para evitar recursión. */
export const authApi = {
  login: <T>(credentials: { email: string; password: string; remember?: boolean }) =>
    request<T>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false),
  refresh: <T>(refreshToken: string) =>
    request<T>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false),
  me: <T>() => request<T>('/auth/me', {}, false),
  logout: () => request<null>('/auth/logout', { method: 'POST' }, false),
};

export { notifyAuthExpired };
