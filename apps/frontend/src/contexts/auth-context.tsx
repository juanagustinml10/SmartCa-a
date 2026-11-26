'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AuthContextType, AuthState, User, LoginCredentials } from '@/types/auth';
import { ApiError, authApi } from '@/lib/api';
import {
  AUTH_EXPIRED_EVENT,
  clearStoredAuth,
  getAccessToken,
  readStoredAuth,
  refreshStoredTokens,
  writeStoredAuth,
} from '@/lib/auth-tokens';

interface BackendLoginUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: User['role'];
  companyId: string;
  companyName: string;
}

interface BackendProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  position: string | null;
  language: string;
  timezone: string;
  status: string;
  createdAt: string;
  lastAccessAt: string | null;
  role: { code: User['role']; name: string };
  company: {
    id: string;
    name: string;
    logo: string | null;
    locale: string;
    currency: string;
    timezone: string;
  };
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendLoginUser;
}

const UNAUTHENTICATED: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isFirstAccess: false,
};

function authenticatedState(user: User): AuthState {
  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    isFirstAccess: !user.onboardingCompleted,
  };
}

/** Convierte el perfil real del backend al modelo transversal del frontend. */
function mapProfile(profile: BackendProfile, previousUserId?: string): User {
  const storedUser = readStoredAuth()?.user;
  return {
    id: profile.id,
    email: profile.email,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    avatar: profile.avatar ?? undefined,
    role: profile.role.code,
    companyId: profile.company.id,
    companyName: profile.company.name,
    position: profile.position ?? undefined,
    phone: profile.phone ?? undefined,
    timezone: profile.timezone || profile.company.timezone,
    locale: profile.company.locale || profile.language,
    lastAccess: profile.lastAccessAt ?? profile.createdAt,
    createdAt: profile.createdAt,
    // El backend aún no expone onboarding; se conserva la preferencia local
    // únicamente para el mismo usuario, sin inventar un estado de servidor.
    onboardingCompleted:
      previousUserId === profile.id ? (storedUser?.onboardingCompleted ?? false) : false,
  };
}

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

/** Obtiene el perfil con el access token; si venció, refresca una sola vez. */
async function loadCurrentUser(): Promise<User> {
  const stored = readStoredAuth();
  if (!stored) throw new Error('Sesión no encontrada');

  try {
    const result = await authApi.me<BackendProfile>();
    return mapProfile(result.data, stored.user?.id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshed = await refreshStoredTokens();
      if (refreshed) {
        const retry = await authApi.me<BackendProfile>();
        return mapProfile(retry.data, stored.user?.id);
      }
    }
    throw error;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // La hidratación siempre pasa por `/auth/me`; mientras tanto se muestra loading
  // para que AuthGuard no redirija antes de verificar el token guardado.
  const [state, setState] = useState<AuthState>(() => ({
    ...UNAUTHENTICATED,
    isLoading: true,
  }));

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      if (!readStoredAuth()) {
        if (mounted) setState({ ...UNAUTHENTICATED });
        return;
      }
      try {
        const user = await loadCurrentUser();
        const stored = readStoredAuth();
        if (!stored) throw new Error('Sesión expirada');
        writeStoredAuth(
          {
            ...stored,
            user,
          },
          stored.remember,
        );
        if (mounted) setState(authenticatedState(user));
      } catch {
        clearStoredAuth();
        if (mounted) setState({ ...UNAUTHENTICATED });
      }
    }

    void hydrate();

    const onExpired = () => {
      if (mounted) setState({ ...UNAUTHENTICATED });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => {
      mounted = false;
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await authApi.login<LoginResponse>({
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
      });
      const { accessToken, refreshToken } = result.data;

      // Se guardan los tokens antes de pedir el perfil: `/auth/me` exige JWT.
      writeStoredAuth(
        { user: null, accessToken, refreshToken, remember: Boolean(credentials.remember) },
        Boolean(credentials.remember),
      );

      const user = await loadCurrentUser();
      const stored = readStoredAuth();
      if (!stored) throw new Error('Sesión expirada');
      writeStoredAuth({ ...stored, user }, stored.remember);
      setState(authenticatedState(user));
    } catch (error) {
      clearStoredAuth();
      const message = messageOf(
        error,
        'No se pudo iniciar sesión. Verificá tus credenciales e intentá nuevamente.',
      );
      setState({ ...UNAUTHENTICATED, error: message });
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    if (getAccessToken()) {
      // Se envía la revocación antes de borrar el token local.
      void authApi.logout().catch(() => undefined);
    }
    clearStoredAuth();
    setState({ ...UNAUTHENTICATED });
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...data };
      const stored = readStoredAuth();
      if (stored) writeStoredAuth({ ...stored, user: updated }, stored.remember);
      return { ...prev, user: updated };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, onboardingCompleted: true };
      const stored = readStoredAuth();
      if (stored) writeStoredAuth({ ...stored, user: updated }, stored.remember);
      return { ...prev, user: updated, isFirstAccess: false };
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, completeOnboarding, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
