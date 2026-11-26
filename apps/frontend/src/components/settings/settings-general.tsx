'use client';

export function SettingsGeneral() {

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">General</h2>
      <p className="text-sm text-text-tertiary mb-8">Configuración general de la plataforma.</p>

      <div className="space-y-6">
        <Section label="Idioma" description="Idioma de la interfaz">
          <select className="h-9 px-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
            <option value="es-AR">Español (Argentina)</option>
            <option value="en-US">English (US)</option>
            <option value="pt-BR">Português (Brasil)</option>
          </select>
        </Section>

        <Section label="Zona horaria" description="Formato de fechas y horas">
          <select className="h-9 px-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
            <option value="America/Argentina/Tucuman">Tucumán (GMT-3)</option>
            <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
            <option value="America/Argentina/Cordoba">Córdoba (GMT-3)</option>
          </select>
        </Section>

        <Section label="Formato de fecha" description="Cómo se muestran las fechas">
          <select className="h-9 px-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </Section>

        <Section label="Formato numérico" description="Separadores de miles y decimales">
          <select className="h-9 px-3 rounded-lg border border-border-default bg-bg-surface text-sm text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
            <option value="es-AR">1.234,56</option>
            <option value="en-US">1,234.56</option>
          </select>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-tertiary">{description}</p>
      </div>
      <div className="w-48 shrink-0">{children}</div>
    </div>
  );
}
