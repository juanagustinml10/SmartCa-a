'use client';

import { useTheme } from '@/contexts/theme-context';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/types/settings';

const options: { mode: ThemeMode; icon: typeof Sun; label: string; desc: string }[] = [
  { mode: 'light', icon: Sun, label: 'Claro', desc: 'Fondo claro durante todo el día' },
  { mode: 'dark', icon: Moon, label: 'Oscuro', desc: 'Fondo oscuro para reducir fatiga visual' },
  { mode: 'auto', icon: Monitor, label: 'Automático', desc: 'Sigue la configuración de tu dispositivo' },
];

export function SettingsTheme() {
  const { mode, setMode } = useTheme();

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Tema</h2>
      <p className="text-sm text-text-tertiary mb-8">Personalizá la apariencia de la plataforma.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = mode === opt.mode;
          return (
            <button
              key={opt.mode}
              onClick={() => setMode(opt.mode)}
              className={cn(
                'flex flex-col items-center gap-3 p-5 rounded-xl border transition-all text-left',
                active
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500'
                  : 'border-border-default bg-bg-surface hover:border-text-tertiary',
              )}
            >
              <div className={cn('size-10 rounded-lg flex items-center justify-center', active ? 'bg-brand-500 text-white' : 'bg-bg-subtle text-text-secondary')}>
                <Icon className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">{opt.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-bg-subtle border border-border-default">
        <p className="text-xs text-text-tertiary">
          El cambio de tema se aplica automáticamente y se guarda para tu próxima visita.
        </p>
      </div>
    </div>
  );
}
