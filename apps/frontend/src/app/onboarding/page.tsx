'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sprout, LayoutDashboard, Map, Bot, Settings, ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface StepData {
  title: string;
  description: string;
  icon: typeof Sprout;
  color: string;
  content: string[];
}

const STEPS: StepData[] = [
  {
    title: 'Bienvenido a SmartCaña',
    description: 'La plataforma inteligente para la gestión de tus campos de caña de azúcar',
    icon: Sprout,
    color: 'bg-brand-500',
    content: [
      'Monitoreá tus campos en tiempo real.',
      'Tomá decisiones basadas en datos.',
      'Optimizá costos y maximizá producción.',
      'Todo impulsado por inteligencia artificial.',
    ],
  },
  {
    title: 'Dashboard',
    description: 'Tu centro de control',
    icon: LayoutDashboard,
    color: 'bg-brand-500',
    content: [
      'Resumen ejecutivo de toda tu operación.',
      'KPIs en tiempo real de producción y costos.',
      'Alertas inteligentes y recomendaciones IA.',
      'Acceso rápido a todas las secciones.',
    ],
  },
  {
    title: 'Campos y Mapa',
    description: 'Gestión geoespacial',
    icon: Map,
    color: 'bg-accent-500',
    content: [
      'Visualizá todos tus lotes en el mapa interactivo.',
      'Monitoreo satelital NDVI y estrés hídrico.',
      'Historial de producción por campo.',
      'Índice SHI para cada lote.',
    ],
  },
  {
    title: 'Producción y Costos',
    description: 'Analítica completa',
    icon: BarChart3,
    color: 'bg-success-500',
    content: [
      'Registro detallado de cosechas.',
      'Análisis de rendimiento por campaña.',
      'Control de costos por categoría y campo.',
      'Proyecciones y alertas financieras.',
    ],
  },
  {
    title: 'IA y Reportes',
    description: 'El poder de la inteligencia artificial',
    icon: Bot,
    color: 'bg-ai-500',
    content: [
      'Recomendaciones predictivas de cosecha.',
      'Análisis de rentabilidad por lote.',
      'Reportes exportables.',
      'Asistente virtual para consultas.',
    ],
  },
  {
    title: 'Configuración',
    description: 'Personalizá tu experiencia',
    icon: Settings,
    color: 'bg-text-secondary',
    content: [
      'Gestioná tu perfil y empresa.',
      'Configurá notificaciones y alertas.',
      'Personalizá el tema (claro/oscuro).',
      'Administrá usuarios y permisos.',
    ],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100; void progress;

  function next() {
    if (isLast) {
      completeOnboarding();
      router.push('/dashboard');
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function prev() {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function skip() {
    completeOnboarding();
    router.push('/dashboard');
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-canvas">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sprout className="size-5 text-brand-500" />
          <span className="text-sm font-bold text-text-primary">SmartCaña</span>
        </div>
        <button onClick={skip} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          Omitir recorrido
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              <div className={`size-20 rounded-2xl ${current.color} flex items-center justify-center mb-6`}>
                <current.icon className="size-10 text-white" />
              </div>

              <h2 className="text-xl font-semibold text-text-primary mb-2">{current.title}</h2>
              <p className="text-sm text-text-tertiary mb-8">{current.description}</p>

              <div className="text-left space-y-3 w-full max-w-xs mx-auto">
                {current.content.map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="size-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <p className="text-sm text-text-secondary">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t border-border-default px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-brand-500' : 'w-2 bg-border-default'}`}
              />
            ))}
          </div>
          <span className="text-xs text-text-tertiary">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 h-9 px-4 rounded-lg text-xs font-medium text-text-secondary hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <button
            onClick={next}
            className="flex items-center gap-1 h-9 px-5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-all active:scale-[0.97]"
          >
            {isLast ? 'Comenzar' : 'Siguiente'}
            {!isLast && <ChevronRight className="size-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
