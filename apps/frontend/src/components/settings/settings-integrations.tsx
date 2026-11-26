'use client';

import { Link as LinkIcon, ExternalLink } from 'lucide-react';

const integrations = [
  { name: 'INTA', description: 'Datos meteorológicos y de suelo', status: 'connected', color: 'bg-success-500' },
  { name: 'Mercado Agro', description: 'Precios de insumos y commodities', status: 'connected', color: 'bg-success-500' },
  { name: 'Google Earth Engine', description: 'Imágenes satelitales y NDVI', status: 'connected', color: 'bg-success-500' },
  { name: 'AFIP', description: 'Facturación electrónica', status: 'pending', color: 'bg-warning-500' },
  { name: 'Banco Nación', description: 'Conciliación bancaria', status: 'disconnected', color: 'bg-text-tertiary' },
  { name: 'SAP', description: 'ERP corporativo', status: 'disconnected', color: 'bg-text-tertiary' },
];

export function SettingsIntegrations() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-1">Integraciones</h2>
      <p className="text-sm text-text-tertiary mb-8">Conectá SmartCaña con otras plataformas.</p>

      <div className="space-y-3">
        {integrations.map((int) => (
          <div key={int.name} className="flex items-center justify-between bg-bg-surface border border-border-default rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`size-9 rounded-lg bg-bg-subtle flex items-center justify-center`}>
                <LinkIcon className="size-4 text-text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{int.name}</p>
                  <div className={`size-1.5 rounded-full ${int.color}`} />
                </div>
                <p className="text-xs text-text-tertiary">{int.description}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors
              ${int.status === 'connected' ? 'bg-brand-500/10 text-brand-500 hover:bg-brand-500/20' : 'border border-border-default text-text-secondary hover:bg-bg-subtle'}">
              {int.status === 'connected' ? 'Conectado' : int.status === 'pending' ? 'Pendiente' : 'Conectar'}
              <ExternalLink className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
