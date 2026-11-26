'use client';

import { motion } from 'framer-motion';
import { Sprout, Brain, Map, BarChart3, DollarSign } from 'lucide-react';

const floatingIcons = [
  { Icon: Brain, x: '15%', y: '20%', delay: 0, size: 24, color: 'text-ai-500/20' },
  { Icon: Map, x: '75%', y: '25%', delay: 1.5, size: 28, color: 'text-brand-500/20' },
  { Icon: BarChart3, x: '20%', y: '65%', delay: 3, size: 22, color: 'text-accent-500/20' },
  { Icon: DollarSign, x: '80%', y: '70%', delay: 0.8, size: 26, color: 'text-success-500/20' },
  { Icon: Sprout, x: '50%', y: '15%', delay: 2.2, size: 32, color: 'text-brand-500/15' },
];

export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 h-full bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      {floatingIcons.map(({ Icon, x, y, delay, size, color }) => (
        <motion.div
          key={Icon.name}
          className={`absolute ${color}`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col justify-center h-full px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Sprout className="size-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SmartCaña</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Gestioná tus campos
            <br />
            <span className="text-brand-200">con inteligencia</span>
          </h2>

          <p className="text-brand-200/80 text-sm leading-relaxed max-w-md mb-10">
            La plataforma integral para la gestión cañera. Monitoreo satelital, inteligencia artificial,
            y análisis predictivo en un solo lugar.
          </p>
        </motion.div>

        <div className="space-y-4">
          {[
            { label: 'Monitoreo satelital en tiempo real', sub: 'NDVI, estrés hídrico, vigor vegetal' },
            { label: 'IA predictiva para cosecha', sub: 'Rendimiento estimado con 98% de precisión' },
            { label: 'Gestión financiera integrada', sub: 'Costos, rentabilidad y presupuestos' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
              className="flex items-start gap-3"
            >
              <div className="size-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-brand-300">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-16 right-16"
        >
          <div className="flex items-center gap-4 text-brand-300/60 text-xs">
            <span>© 2026 SmartCaña</span>
            <span className="w-1 h-1 rounded-full bg-brand-500/40" />
            <span>Agricultura inteligente</span>
            <span className="w-1 h-1 rounded-full bg-brand-500/40" />
            <span>v2.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
