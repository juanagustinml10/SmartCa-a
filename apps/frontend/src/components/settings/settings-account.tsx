'use client';

import { useAuth } from '@/contexts/auth-context';
import { Pencil } from 'lucide-react';

export function SettingsAccount() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Cuenta</h2>
      <p className="text-sm text-text-tertiary mb-8">Información de tu cuenta personal.</p>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-xl bg-brand-500 flex items-center justify-center text-white text-lg font-bold">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 size-6 rounded-full bg-bg-surface border border-border-default flex items-center justify-center hover:bg-bg-subtle transition-colors">
              <Pencil className="size-3 text-text-secondary" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{user.name}</p>
            <p className="text-xs text-text-tertiary">{user.email}</p>
          </div>
        </div>

        <SettingsField label="Nombre completo" value={user.name} />
        <SettingsField label="Email" value={user.email} type="email" />
        <SettingsField label="Teléfono" value={user.phone ?? ''} placeholder="+54 381 555-0000" />
        <SettingsField label="Cargo" value={user.position ?? ''} placeholder="Gerente General" />

        <div className="pt-4 flex justify-end gap-3">
          <button className="h-9 px-4 rounded-lg border border-border-default text-xs font-medium text-text-secondary hover:bg-bg-subtle transition-colors">
            Cancelar
          </button>
          <button className="h-9 px-4 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsField({ label, value, placeholder, type = 'text' }: { label: string; value: string; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-text-tertiary">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-border-default bg-bg-canvas text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
      />
    </div>
  );
}
