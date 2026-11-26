'use client';

import { motion } from 'framer-motion';
import { Bot, Map, BarChart3, DollarSign, ClipboardList, LayoutDashboard } from 'lucide-react';

const modules = [
  { icon: LayoutDashboard, name: 'Dashboard', desc: 'Centro de control con KPIs en tiempo real', color: 'bg-brand-500' },
  { icon: Map, name: 'Mapa GIS', desc: 'Visualización satelital de lotes y parcelas', color: 'bg-accent-500' },
  { icon: BarChart3, name: 'Producción', desc: 'Analítica de cosechas y rendimiento', color: 'bg-success-500' },
  { icon: DollarSign, name: 'Costos', desc: 'Gestión financiera por campo', color: 'bg-warning-500' },
  { icon: ClipboardList, name: 'Actividades', desc: 'Planificación y seguimiento de tareas', color: 'bg-info-500' },
  { icon: Bot, name: 'Asistente IA', desc: 'Recomendaciones predictivas', color: 'bg-ai-500' },
];

export default function ModulesSection() {
  return (
    <section id="tecnología" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-default bg-bg-surface/40 backdrop-blur-sm text-xs text-text-secondary mb-6">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Módulos del sistema
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-text-primary">Una plataforma, múltiples herramientas</h2>
          <p className="mt-4 text-base text-text-secondary max-w-2xl mx-auto">Cada módulo está diseñado para resolver un aspecto específico de la gestión cañera.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-default bg-bg-surface/40 backdrop-blur-sm hover:bg-bg-surface/60 transition-colors"
              >
                <div className={`size-10 rounded-lg ${mod.color} flex items-center justify-center shrink-0`}>
                  <Icon className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{mod.name}</p>
                  <p className="text-xs text-text-tertiary">{mod.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
