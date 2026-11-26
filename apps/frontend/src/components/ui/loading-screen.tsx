'use client';

import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

export function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-canvas">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="size-14 rounded-2xl bg-brand-500 flex items-center justify-center">
          <Sprout className="size-7 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="size-5 rounded-full border-2 border-brand-500/30 border-t-brand-500"
          />
          <p className="text-sm text-text-tertiary">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}
