"use client";

import { GitBranch, ExternalLink } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="mt-8 border-t border-border-default bg-bg-surface">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span>SmartCaña v0.1.0</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Tesis — TUP, UTN</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full bg-success-500`} />
            Todos los sistemas operativos
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Repositorio
          </a>
          <a
            href="/docs"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Documentación
          </a>
        </div>
      </div>
    </footer>
  );
}
