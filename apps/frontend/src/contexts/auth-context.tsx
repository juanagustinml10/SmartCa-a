'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthContextType, AuthState, User, LoginCredentials } from '@/types/auth';

const MOCK_USER: User = {
  id: 'user-1',
  email: 'juan@fincarodriguez.com',
  name: 'Juan Rodriguez',
  role: 'owner',
  companyId: 'default',
  companyName: 'Finca Rodriguez S.A.',
  position: 'Gerente General',
  phone: '+54 381 555-0100',
  timezone: 'America/Argentina/Tucuman',
  locale: 'es-AR',
  lastAccess: new Date().toISOString(),
  createdAt: '2024-01-15T00:00:00.000Z',
  onboardingCompleted: false,
};

const AUTH_STORAGE_KEY = 'smartcana_auth';

function getInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, isLoading: false, error: null, isFirstAccess: false };
  }
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      const user = JSON.parse(stored) as User;
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isFirstAccess: !user.onboardingCompleted,
      };
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return { user: null, isAuthenticated: false, isLoading: false, error: null, isFirstAccess: false };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (credentials.email === 'demo@smartcana.com' && credentials.password === 'demo1234') {
      const user: User = {
        ...MOCK_USER,
        email: credentials.email,
        name: 'Usuario Demo',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isFirstAccess: !user.onboardingCompleted,
      });
      return;
    }

    if (credentials.email && credentials.password.length >= 4) {
      const user: User = {
        ...MOCK_USER,
        email: credentials.email,
      };
      if (credentials.remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isFirstAccess: !user.onboardingCompleted,
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 400));
    setState((prev) => ({ ...prev, isLoading: false, error: 'Credenciales inválidas. Verificá tu email y contraseña.' }));
    throw new Error('Credenciales inválidas');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null, isFirstAccess: false });
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...data };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, onboardingCompleted: true };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
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
