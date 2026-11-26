'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sprout } from 'lucide-react';

interface TransitionScreenProps {
  show: boolean;
  onComplete?: () => void;
}

export function TransitionScreen({ show, onComplete }: TransitionScreenProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-brand-900"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sprout className="size-16 text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
