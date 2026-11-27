"use client";

import { motion } from "framer-motion";
import { Bot, Lightbulb } from "lucide-react";

export function AiCenter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-ai-200 bg-gradient-to-br from-ai-50 via-bg-surface to-bg-surface p-5 dark:border-ai-950/30 dark:from-ai-950/10"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ai-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand-500/5 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai-500/10">
              <Bot className="h-5 w-5 text-ai-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Asistente SmartCaña</h3>
              <p className="text-xs text-text-tertiary">Copiloto inteligente para tu campo</p>
            </div>
          </div>
          <span className="rounded-full bg-ai-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-ai-500">
            IA
          </span>
        </div>

        <div className="relative mt-4 flex min-h-[100px] items-center justify-center rounded-lg border border-ai-200/50 bg-bg-surface p-4 dark:border-ai-950/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ai-500" />
            <p className="text-sm leading-relaxed text-text-secondary">
              No hay recomendaciones generadas todavía.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
