'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';

const reasons = [
  { icon: Shield, title: 'Seguridad y confianza', items: ['Datacenter propio en Argentina', 'Encriptación de extremo a extremo', 'Backups automáticos diarios', 'Cumplimiento normativo local'] },
  { icon: Zap, title: 'Rendimiento superior', items: ['Procesamiento en tiempo real', 'Dashboard sin recarga', 'Mapas interactivos sin latencia', 'App responsive offline-first'] },
  { icon: Users, title: 'Equipo experto', items: ['Ingenieros agrónomos en el equipo', 'Soporte técnico local', 'Capacitación personalizada', 'Actualizaciones mensuales'] },
  { icon: TrendingUp, title: 'Resultados medibles', items: ['ROI comprobado en 6 meses', 'Reducción de costos del 25%', 'Aumento de rendimiento del 15%', 'Reportes automáticos'] },
];

export default function WhySection() {
  return (
    <section id="por-qué" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-text-primary">¿Por qué SmartCaña?</h2>
          <p className="mt-4 text-base text-text-secondary max-w-2xl mx-auto">Construimos la plataforma que nos hubiera gustado tener cuando gestionábamos campos.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border-default bg-bg-surface/40 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Icon className="size-5 text-brand-500" />
                  </div>
                  <h3 className="text-base font-medium text-text-primary">{reason.title}</h3>
                </div>
                <ul className="space-y-2">
                  {reason.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <CheckCircle className="size-4 text-brand-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
