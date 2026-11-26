'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, Shield } from 'lucide-react';

const benefits = [
  { icon: TrendingUp, value: '25%', label: 'Ahorro en costos operativos', desc: 'Optimización de insumos, maquinaria y mano de obra mediante análisis predictivo.' },
  { icon: DollarSign, value: '98%', label: 'Precisión en predicciones', desc: 'Modelos de IA entrenados con datos históricos de más de 10,000 hectáreas.' },
  { icon: Clock, value: '60%', label: 'Menos tiempo en reportes', desc: 'Automatización de informes y dashboards en tiempo real sin planillas manuales.' },
  { icon: Shield, value: '40%', label: 'Reducción de riesgos', desc: 'Alertas tempranas de plagas, clima y estrés hídrico para tomar acción preventiva.' },
];

export default function BenefitsSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-medium text-text-primary">Resultados comprobados</h2>
          <p className="mt-4 text-base text-text-secondary max-w-2xl mx-auto">Productores cañeros de toda Argentina ya están transformando su operación con SmartCaña.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-border-default bg-bg-surface/40 backdrop-blur-sm"
              >
                <div className="size-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="size-6 text-brand-500" />
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1">{b.value}</div>
                <div className="text-sm font-medium text-text-primary mb-2">{b.label}</div>
                <p className="text-xs text-text-secondary leading-relaxed">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
