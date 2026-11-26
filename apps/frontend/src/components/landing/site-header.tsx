'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export default function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <motion.a
          href="/"
          className="flex items-center gap-2.5 text-text-primary font-semibold text-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="size-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Sprout className="size-4 text-white" />
          </div>
          SmartCaña
        </motion.a>

        <motion.nav
          className="hidden md:flex items-center gap-8 text-sm text-text-secondary"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          {['Funcionalidades', 'Tecnología', 'Precios', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-text-primary transition-colors duration-200">
              {item}
            </a>
          ))}
        </motion.nav>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors duration-200"
          >
            Acceder
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
