'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sprout, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { PasswordInput } from '@/components/auth/password-input';

type Stage = 'form' | 'success';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStage('success');
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">Enlace inválido o expirado.</p>
          <Link href="/forgot-password" className="text-sm text-brand-500 hover:text-brand-400 mt-2 inline-block">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {stage === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="size-16 rounded-full bg-success-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-8 text-success-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Contraseña actualizada</h2>
            <p className="text-sm text-text-tertiary mb-6">Tu contraseña se restableció correctamente.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Iniciar sesión
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8"
            >
              <ArrowLeft className="size-3.5" />
              Volver
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-brand-500 flex items-center justify-center">
                <Sprout className="size-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary">SmartCaña</span>
            </div>

            <h1 className="text-xl font-semibold text-text-primary mb-1">Nueva contraseña</h1>
            <p className="text-sm text-text-tertiary mb-8">Ingresá tu nueva contraseña para acceder al sistema.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                autoFocus
              />
              <PasswordInput
                label="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                error={error}
              />

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full h-10 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-text-tertiary" />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
