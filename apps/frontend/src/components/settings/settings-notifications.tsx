'use client';

import { useState } from 'react';
import type { NotificationPreferences } from '@/types/settings';

export function SettingsNotifications() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    fieldAlerts: true,
    weatherAlerts: true,
    costAlerts: false,
    harvestAlerts: true,
    systemUpdates: true,
  });

  function toggle(key: keyof NotificationPreferences) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const groups = [
    {
      label: 'Generales',
      items: [
        { key: 'emailAlerts' as const, label: 'Alertas por email' },
        { key: 'pushNotifications' as const, label: 'Notificaciones push' },
        { key: 'weeklyReport' as const, label: 'Reporte semanal' },
      ],
    },
    {
      label: 'Alertas del sistema',
      items: [
        { key: 'fieldAlerts' as const, label: 'Alertas de campos' },
        { key: 'weatherAlerts' as const, label: 'Alertas meteorológicas' },
        { key: 'costAlerts' as const, label: 'Alertas de costos' },
        { key: 'harvestAlerts' as const, label: 'Alertas de cosecha' },
        { key: 'systemUpdates' as const, label: 'Actualizaciones del sistema' },
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Notificaciones</h2>
      <p className="text-sm text-text-tertiary mb-8">Configurá qué notificaciones querés recibir.</p>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">{group.label}</h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-text-primary">{item.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={prefs[item.key]}
                      onChange={() => toggle(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full bg-border-default peer-checked:bg-brand-500 transition-colors peer-checked:[&>div]:translate-x-4">
                      <div className="size-4 rounded-full bg-white shadow-sm translate-x-0.5 mt-0.5 transition-transform" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="h-9 px-4 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors">
          Guardar preferencias
        </button>
      </div>
    </div>
  );
}
