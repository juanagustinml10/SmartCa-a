'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import {
  Monitor, Smartphone, Tablet, MapPin, Clock, Shield, LogOut,
  AlertTriangle, Globe, CheckCircle,
} from 'lucide-react';
import { MOCK_SESSIONS } from '@/lib/mock-sessions';
import type { Session } from '@/types/audit';

const deviceIcons: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function SessionsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  function revokeSession(id: string) {
    setRevokingId(id);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setRevokingId(null);
    }, 500);
  }

  function revokeAllOthers() {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setConfirmRevokeAll(false);
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={sidebarMobile} onMobileClose={() => setSidebarMobile(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarMobile(true)} />
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Sesiones</h1>
                <p className="text-sm text-text-secondary">Administra tus sesiones activas en el sistema</p>
              </div>
              {otherSessions.length > 0 && (
                <div className="relative">
                  {!confirmRevokeAll ? (
                    <button onClick={() => setConfirmRevokeAll(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-50 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50/80 transition-colors">
                      <LogOut className="h-4 w-4" />
                      Revocar todas las demás
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-50 p-2">
                      <span className="text-sm text-error-600">¿Revocar {otherSessions.length} sesión{otherSessions.length > 1 ? 'es' : ''}?</span>
                      <button onClick={revokeAllOthers} className="rounded-md bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600 transition-colors">Sí</button>
                      <button onClick={() => setConfirmRevokeAll(false)} className="rounded-md bg-bg-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-elevated transition-colors">No</button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Sesiones activas</h2>
              <AnimatePresence>
                {sessions.map((session, i) => {
                  const DeviceIcon = deviceIcons[session.device] || Monitor;
                  return (
                    <motion.div key={session.id} layout
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className={`rounded-xl border p-4 transition-colors ${
                        session.isCurrent
                          ? 'border-brand-500/30 bg-brand-50/50'
                          : 'border-border-default bg-bg-surface hover:bg-bg-subtle/30'
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          session.isCurrent ? 'bg-brand-100 text-brand-600' : 'bg-bg-subtle text-text-secondary'
                        }`}>
                          <DeviceIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-text-primary">{session.os}</span>
                            <span className="text-text-tertiary">·</span>
                            <span className="text-sm text-text-secondary">{session.browser}</span>
                            {session.isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
                                <CheckCircle className="h-3 w-3" /> Sesión actual
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{session.ipAddress}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(session.lastActiveAt)}</span>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button onClick={() => revokeSession(session.id)} disabled={revokingId === session.id}
                            className="shrink-0 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-error-50 hover:text-error-600 hover:border-error-500/30 transition-colors disabled:opacity-40">
                            {revokingId === session.id ? 'Revocando...' : 'Revocar'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {sessions.length === 0 && (
                <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-tertiary">No hay sesiones activas.</div>
              )}
            </div>

            <div className="rounded-xl border border-border-default bg-bg-surface p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-500" />
                <h3 className="font-semibold text-text-primary">Consejos de seguridad</h3>
              </div>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning-500" />
                  <span>Revoca sesiones que no reconozcas inmediatamente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning-500" />
                  <span>Cierra sesión en dispositivos compartidos o públicos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning-500" />
                  <span>Activa la autenticación de dos factores para mayor seguridad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning-500" />
                  <span>Si sospechas de acceso no autorizado, cambia tu contraseña.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
