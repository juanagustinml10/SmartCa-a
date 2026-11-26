export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role:
    | 'super_admin'
    | 'admin'
    | 'gerente'
    | 'supervisor'
    | 'ingeniero'
    | 'operador'
    | 'invitado';
  companyId: string;
  companyName: string;
  position?: string;
  phone?: string;
  timezone: string;
  locale: string;
  lastAccess: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isFirstAccess: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: () => void;
  clearError: () => void;
}
