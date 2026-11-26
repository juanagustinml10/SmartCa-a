'use client';

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useState } from 'react';
import type { CostAlert } from '@/types/costs';

interface CostAlertsProps {
  alerts: CostAlert[];
}

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-error-500', bg: 'bg-error-500/10', border: 'border-error-500/20' },
  high: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-500/10', border: 'border-warning-500/20' },
  medium: { icon: Info, color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
  low: { icon: Info, color: 'text-text-tertiary', bg: 'bg-bg-subtle', border: 'border-border-default' },
};

export function CostAlerts({ alerts }: CostAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => {
        const cfg = severityConfig[alert.severity];
        const Icon = cfg.icon;
        return (
          <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
            <Icon className={`size-4 mt-0.5 shrink-0 ${cfg.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">{alert.title}</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{alert.description}</p>
              {alert.percentage && (
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-1.5 rounded-full flex-1 bg-bg-subtle overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${alert.severity === 'critical' ? 'bg-error-500' : alert.severity === 'high' ? 'bg-warning-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(Math.abs(alert.percentage), 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-tertiary tabular-nums">{alert.percentage > 0 ? '+' : ''}{alert.percentage}%</span>
                </div>
              )}
            </div>
            <button onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))} className="text-text-tertiary hover:text-text-primary transition-colors">
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
