'use client';

import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Lightbulb, ArrowUpRight, BarChart3, DollarSign, Shield, FileText } from 'lucide-react';
import { MOCK_IA_RECOMMENDATIONS, MOCK_IA_SUMMARY } from '@/lib/mock-executive';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  risk: { icon: AlertTriangle, color: 'text-error-500', bg: 'bg-error-50 dark:bg-error-950/20', label: 'Riesgo' },
  opportunity: { icon: TrendingUp, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/20', label: 'Oportunidad' },
  warning: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/20', label: 'Advertencia' },
  insight: { icon: Lightbulb, color: 'text-ai-500', bg: 'bg-ai-50 dark:bg-ai-950/20', label: 'Insight' },
};

const impactColors = { high: 'bg-error-500', medium: 'bg-warning-500', low: 'bg-info-500' };
const riskColors = { low: 'text-success-500', moderate: 'text-warning-500', high: 'text-error-500', critical: 'text-error-600' };

export function IaPanel() {
  const summary = MOCK_IA_SUMMARY;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ai-50 dark:bg-ai-950/20">
          <Brain className="h-3.5 w-3.5 text-ai-500" />
        </div>
        <span className="text-xs font-semibold text-text-primary">Panel IA</span>
        <span className="ml-auto text-[10px] text-text-tertiary">{new Date(summary.lastUpdated).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="rounded-lg border border-border-default bg-bg-surface p-2.5 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <FileText className="h-3 w-3 text-text-tertiary" />
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Resumen del día</span>
        </div>
        <p className="text-xs text-text-primary leading-snug">{summary.dailySummary}</p>
      </div>

      <div className="rounded-lg border border-border-default bg-bg-elevated/50 p-2.5 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shield className={`h-3 w-3 ${riskColors[summary.riskLevel]}`} />
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Recomendación principal</span>
        </div>
        <p className="text-xs font-medium text-text-primary leading-snug">{summary.mainRecommendation}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-semibold ${riskColors[summary.riskLevel]}`}>
            Riesgo: {summary.riskLevel === 'moderate' ? 'Moderado' : summary.riskLevel.charAt(0).toUpperCase() + summary.riskLevel.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
        <div className="rounded-lg border border-border-default bg-bg-surface p-2">
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 className="h-3 w-3 text-brand-500" />
            <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Producción</span>
          </div>
          <p className="font-mono text-sm font-bold text-text-primary">{summary.productionPrediction.value.toLocaleString()} <span className="text-[10px] font-medium text-text-tertiary">{summary.productionPrediction.unit}</span></p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="h-1 flex-1 bg-border-default rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${summary.productionPrediction.confidence}%` }} />
            </div>
            <span className="text-[9px] text-text-tertiary">{summary.productionPrediction.confidence}%</span>
          </div>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-accent-500" />
            <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Financiero</span>
          </div>
          <p className="font-mono text-sm font-bold text-text-primary">{(summary.financialPrediction.value / 1000000).toFixed(1)}M <span className="text-[10px] font-medium text-text-tertiary">{summary.financialPrediction.unit}</span></p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="h-1 flex-1 bg-border-default rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full" style={{ width: `${summary.financialPrediction.confidence}%` }} />
            </div>
            <span className="text-[9px] text-text-tertiary">{summary.financialPrediction.confidence}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Recomendaciones activas</span>
        {MOCK_IA_RECOMMENDATIONS.slice(0, 3).map((rec, i) => {
          const cfg = typeConfig[rec.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-border-default bg-bg-surface p-2.5 group hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cfg.bg} mt-0.5`}>
                  <Icon className={`h-3 w-3 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${impactColors[rec.impact]}`} />
                    <span className="text-[10px] text-text-tertiary">{rec.confidence}% confianza</span>
                  </div>
                  <p className="text-xs font-medium text-text-primary leading-snug">{rec.title}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5 leading-snug line-clamp-2">{rec.description}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
