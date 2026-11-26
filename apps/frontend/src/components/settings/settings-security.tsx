'use client';

import { useState } from 'react';
import { Smartphone, Laptop, Shield, ShieldOff, Clock } from 'lucide-react';
import type { SessionInfo, SecuritySettings as SecuritySettingsType } from '@/types/settings';

const MOCK_SESSIONS: SessionInfo[] = [
  { id: 's1', device: 'Windows 11', browser: 'Chrome 125', location: 'Tucumán, Argentina', ip: '190.45.67.89', lastActive: new Date().toISOString(), isCurrent: true },
  { id: 's2', device: 'iPhone 15', browser: 'Safari 18', location: 'Tucumán, Argentina', ip: '190.45.67.90', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
  { id: 's3', device: 'macOS Sonoma', browser: 'Firefox 128', location: 'Buenos Aires, Argentina', ip: '181.45.67.91', lastActive: new Date(Date.now() - 172800000).toISOString(), isCurrent: false },
];

export function SettingsSecurity() {
  const [settings] = useState<SecuritySettingsType>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    activeSessions: MOCK_SESSIONS,
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Seguridad</h2>
      <p className="text-sm text-text-tertiary mb-8">Gestioná la seguridad de tu cuenta.</p>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Contraseña</h3>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4">
            <p className="text-sm text-text-secondary mb-1">Último cambio: hace 3 meses</p>
            <p className="text-xs text-text-tertiary mb-4">Recomendamos cambiar la contraseña cada 90 días.</p>
            <button className="h-9 px-4 rounded-lg border border-border-default text-xs font-medium text-text-secondary hover:bg-bg-subtle transition-colors">
              Cambiar contraseña
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Autenticación en dos pasos</h3>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center ${settings.twoFactorEnabled ? 'bg-success-500/10 text-success-500' : 'bg-bg-subtle text-text-tertiary'}`}>
                  {settings.twoFactorEnabled ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Verificación en dos pasos</p>
                  <p className="text-xs text-text-tertiary">Añadí una capa extra de seguridad a tu cuenta</p>
                </div>
              </div>
              <button className="h-8 px-3 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
                {settings.twoFactorEnabled ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Tiempo de sesión</h3>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-lg bg-bg-subtle flex items-center justify-center">
                <Clock className="size-4 text-text-tertiary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Tiempo máximo de inactividad</p>
                <p className="text-xs text-text-tertiary">Cerrar sesión automáticamente después de</p>
              </div>
            </div>
            <select className="h-9 px-3 rounded-lg border border-border-default bg-bg-canvas text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
              <option value="15">15 minutos</option>
              <option value="30" selected>30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="0">Nunca</option>
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Sesiones activas</h3>
          <div className="space-y-2">
            {MOCK_SESSIONS.map((session) => (
              <div key={session.id} className="flex items-center justify-between bg-bg-surface border border-border-default rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-bg-subtle flex items-center justify-center">
                    {session.device.includes('iPhone') ? <Smartphone className="size-4 text-text-tertiary" /> : <Laptop className="size-4 text-text-tertiary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{session.device}</p>
                      {session.isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium">Actual</span>}
                    </div>
                    <p className="text-xs text-text-tertiary">{session.browser} · {session.location}</p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button className="text-xs text-text-tertiary hover:text-error-500 transition-colors">Cerrar</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
