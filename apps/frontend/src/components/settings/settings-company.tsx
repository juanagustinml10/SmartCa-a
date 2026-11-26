'use client';

import { useAuth } from '@/contexts/auth-context';

export function SettingsCompany() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Empresa</h2>
      <p className="text-sm text-text-tertiary mb-8">Información de tu empresa.</p>

      <div className="space-y-6">
        <SettingsField label="Nombre de la empresa" value={user?.companyName ?? ''} />
        <SettingsField label="CUIT" value="30-71543210-8" />
        <SettingsField label="Dirección" value="Ruta 301 km 12, Tucumán, Argentina" />
        <SettingsField label="Teléfono" value="+54 381 555-0100" />
        <SettingsField label="Email" value="info@fincarodriguez.com" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">12</p>
            <p className="text-xs text-text-tertiary mt-1">Campos activos</p>
          </div>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">185.2</p>
            <p className="text-xs text-text-tertiary mt-1">Hectáreas totales</p>
          </div>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">2025/2026</p>
            <p className="text-xs text-text-tertiary mt-1">Campaña activa</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button className="h-9 px-4 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

function SettingsField({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-text-tertiary">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full h-9 px-3 rounded-lg border border-border-default bg-bg-canvas text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
      />
    </div>
  );
}
