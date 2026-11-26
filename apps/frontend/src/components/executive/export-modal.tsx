'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileImage, FileText, Download, Presentation, FileSpreadsheet } from 'lucide-react';
import { useExecutive } from '@/contexts/executive-context';

const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', desc: 'Documento portátil listo para imprimir', icon: FileText, color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-950/20' },
  { id: 'image', label: 'Imagen PNG', desc: 'Captura del dashboard completo', icon: FileImage, color: 'text-info-500', bg: 'bg-info-50 dark:bg-info-950/20' },
  { id: 'powerpoint', label: 'PowerPoint', desc: 'Presentación editable con datos', icon: Presentation, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950/20' },
  { id: 'excel', label: 'Excel', desc: 'Datos en tabla para análisis', icon: FileSpreadsheet, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/20' },
];

export function ExportModal() {
  const { exportOpen, setExportOpen } = useExecutive();

  return (
    <AnimatePresence>
      {exportOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setExportOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border-default bg-bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">Exportar Dashboard</h2>
              </div>
              <button
                onClick={() => setExportOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] text-text-tertiary mb-2">Selecciona el formato de exportación. La funcionalidad completa estará disponible próximamente.</p>
              {EXPORT_FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.id}
                    className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-elevated/50 px-3 py-2.5 opacity-60 cursor-not-allowed"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${fmt.bg}`}>
                      <Icon className={`h-4 w-4 ${fmt.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-text-primary">{fmt.label}</p>
                      <p className="text-[10px] text-text-tertiary">{fmt.desc}</p>
                    </div>
                    <span className="text-[9px] text-text-tertiary bg-bg-subtle rounded-md px-1.5 py-0.5">Próximamente</span>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-border-default flex justify-end">
              <button
                onClick={() => setExportOpen(false)}
                className="rounded-lg bg-brand-500 px-4 h-8 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
