"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Send, ChevronRight, Lightbulb } from "lucide-react";
import { MOCK_AI_RECOMMENDATIONS } from "@/lib/mock-data";

export function AiCenter() {
  const [currentTip, setCurrentTip] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const cycleTip = () => {
    setCurrentTip((prev) => (prev + 1) % MOCK_AI_RECOMMENDATIONS.length);
  };

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

        <div className="relative mt-4 min-h-[100px] rounded-lg border border-ai-200/50 bg-bg-surface p-4 dark:border-ai-950/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ai-500" />
              <p className="text-sm leading-relaxed text-text-secondary">
                {MOCK_AI_RECOMMENDATIONS[currentTip]}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={cycleTip}
              className="flex items-center gap-1 text-xs font-medium text-ai-500 hover:text-ai-600 transition-colors"
            >
              Ver siguiente recomendación
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Consultar a SmartCaña..."
              className="h-10 w-full rounded-lg border border-border-default bg-bg-subtle px-4 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-ai-500 focus:outline-none focus:ring-1 focus:ring-ai-500/30"
            />
            <button className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-tertiary hover:bg-ai-50 hover:text-ai-500 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-ai-200/50 bg-ai-500/10 px-4 text-sm font-medium text-ai-600 hover:bg-ai-500/20 transition-colors dark:text-ai-500">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Consultar IA</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
