'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sprout, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

type Stage = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStage('sent');
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {stage === 'sent' ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="size-16 rounded-full bg-success-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-8 text-success-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Correo enviado</h2>
            <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
              Si existe una cuenta con <span className="font-medium text-text-secondary">{email}</span>,
              vas a recibir un enlace para restablecer tu contraseña.
            </p>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-400 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio de sesión
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

            <h1 className="text-xl font-semibold text-text-primary mb-1">Recuperar contraseña</h1>
            <p className="text-sm text-text-tertiary mb-8 leading-relaxed">
              Ingresá el email asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoFocus
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-10 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
