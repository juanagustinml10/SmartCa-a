"use client";

import { motion } from "framer-motion";
import { Sprout, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No hay campos registrados",
  description = "Comienza agregando tu primer campo para empezar a gestionar tus cultivos de caña de azúcar.",
  actionLabel = "Crear primer campo",
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface px-6 py-20"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/20">
        <Sprout className="h-7 w-7 text-brand-500" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">{description}</p>
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
