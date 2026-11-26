'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { PasswordInput } from './password-input';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

export function LoginForm() {
  const { login, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [state, setState] = useState<LoginState>('idle');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    if (!password) errs.password = 'La contraseña es requerida';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setState('loading');
    clearError();
    try {
      await login({ email, password, remember });
      setState('success');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const isDisabled = state === 'loading' || state === 'success';

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <Sprout className="size-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-text-primary">SmartCaña</span>
            <p className="text-[10px] text-text-tertiary">Plataforma de gestión cañera</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-1">Iniciar sesión</h1>
        <p className="text-sm text-text-tertiary mb-8">Ingresá tus credenciales para acceder al sistema</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-12"
          >
            <div className="size-16 rounded-full bg-success-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-8 text-success-500" />
            </div>
            <p className="text-sm font-medium text-text-primary">Acceso correcto</p>
            <p className="text-xs text-text-tertiary mt-1">Redirigiendo al dashboard...</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-error-500/10 border border-error-500/20"
              >
                <AlertCircle className="size-4 text-error-500 shrink-0 mt-0.5" />
                <p className="text-xs text-error-500">{authError}</p>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                className={`w-full h-10 px-3 rounded-lg border bg-bg-surface text-sm text-text-primary placeholder:text-text-tertiary transition-colors outline-none
                  ${errors.email ? 'border-error-500 ring-1 ring-error-500' : 'border-border-default focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
                `}
                disabled={isDisabled}
              />
              {errors.email && <p className="text-xs text-error-500">{errors.email}</p>}
            </div>

            <PasswordInput
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
              disabled={isDisabled}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-border-default text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs text-text-secondary">Recordarme</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="relative w-full h-10 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] overflow-hidden"
            >
              {state === 'loading' && (
                <motion.div
                  className="absolute inset-0 bg-brand-400"
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {state === 'loading' && <Loader2 className="size-4 animate-spin" />}
                {state === 'loading' ? 'Verificando...' : 'Ingresar'}
              </span>
            </button>

          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
