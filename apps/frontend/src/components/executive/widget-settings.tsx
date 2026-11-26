'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useExecutive } from '@/contexts/executive-context';
import type { WidgetId } from '@/types/executive';

const WIDGET_LABELS: Record<WidgetId, string> = {
  kpis: 'Indicadores KPIs',
  map: 'Mapa GIS',
  ia: 'Panel IA',
  timeline: 'Timeline',
  charts: 'Tablero de Gráficos',
  alerts: 'Alertas',
};

export function WidgetSettings() {
  const { layout, settingsOpen, setSettingsOpen, toggleWidget } = useExecutive();

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border-default bg-bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <h2 className="text-sm font-semibold text-text-primary">Personalizar Widgets</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] text-text-tertiary mb-3">Muestra u oculta los widgets del centro de comando.</p>
              {(Object.keys(layout.widgets) as WidgetId[]).map((id) => {
                const widget = layout.widgets[id];
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-elevated/50 px-3 py-2.5"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-text-tertiary opacity-40" />
                    <span className="flex-1 text-xs font-medium text-text-primary">{WIDGET_LABELS[id]}</span>
                    <button
                      onClick={() => toggleWidget(id)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 h-7 text-[10px] font-medium transition-colors ${
                        widget.visible
                          ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20'
                          : 'bg-bg-subtle text-text-tertiary'
                      }`}
                    >
                      {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {widget.visible ? 'Visible' : 'Oculto'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-border-default flex justify-end">
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg bg-brand-500 px-4 h-8 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Listo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
