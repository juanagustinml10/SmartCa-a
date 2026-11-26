'use client';

import { motion } from 'framer-motion';
import { Brain, Map, BarChart3, DollarSign, Bell, Satellite } from 'lucide-react';

const features = [
  { icon: Satellite, title: 'Monitoreo Satelital', description: 'NDVI, estrés hídrico y vigor vegetal en tiempo real. Cobertura multiespectral con actualización semanal.' },
  { icon: Brain, title: 'IA Predictiva', description: 'Algoritmos de machine learning para predecir rendimiento, plagas y momento óptimo de cosecha con 98% de precisión.' },
  { icon: Map, title: 'Mapa GIS Interactivo', description: 'Visualización geoespacial de todos tus lotes. Capas personalizables, análisis por polígono y zonificación.' },
  { icon: BarChart3, title: 'Analítica de Producción', description: 'Dashboard interactivo con KPIs en tiempo real. Comparativas por campaña, campo y variedad.' },
  { icon: DollarSign, title: 'Gestión de Costos', description: 'Control presupuestario por lote. Categorización automática, alertas de desviación y rentabilidad por campo.' },
  { icon: Bell, title: 'Alertas Inteligentes', description: 'Notificaciones predictivas sobre condiciones climáticas, plagas, riesgos financieros y ventanas de cosecha.' },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" className="relative py-32 px-6">
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
            Plataforma integral
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-text-primary">Todo lo que necesitás para gestionar tu campo</h2>
          <p className="mt-4 text-base text-text-secondary max-w-2xl mx-auto">Una plataforma unificada que combina monitoreo satelital, inteligencia artificial y gestión financiera.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-border-default bg-bg-surface/40 backdrop-blur-sm hover:bg-bg-surface/60 hover:border-brand-500/30 transition-all duration-300"
              >
                <div className="size-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="size-5 text-brand-500" />
                </div>
                <h3 className="text-base font-medium text-text-primary mb-2">{feat.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
