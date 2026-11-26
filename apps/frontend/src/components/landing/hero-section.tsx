'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-default bg-bg-surface/40 backdrop-blur-sm text-xs text-text-secondary mb-8">
            <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
            Agricultura de precisión impulsada por IA
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-text-primary leading-[1.08]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
        >
          Gestiona tus campos de caña{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-400">
            con inteligencia
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
        >
          Monitoreo satelital, predicción de rendimiento, análisis de costos y
          alertas inteligentes. Todo en una plataforma diseñada para productores
          cañeros.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.45 }}
        >
          <a
            href="/login"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-brand-500 text-white text-base font-medium hover:bg-brand-600 transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
          >
            Explorar plataforma
            <svg className="ml-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-border-default text-text-secondary text-base font-medium hover:bg-bg-surface/40 transition-all duration-200"
          >
            Ver funcionalidades
          </a>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-8 sm:gap-12 text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <div className="text-center">
            <div className="text-xl font-semibold text-text-primary">10k+</div>
            <div className="text-xs mt-1">Hectáreas monitoreadas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-text-primary">98%</div>
            <div className="text-xs mt-1">Precisión predictiva</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-text-primary">25%</div>
            <div className="text-xs mt-1">Ahorro en costos</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
