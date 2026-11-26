'use client';

import { memo } from 'react';
import { GripVertical, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useExecutive } from '@/contexts/executive-context';
import type { WidgetId } from '@/types/executive';

interface WidgetWrapperProps {
  id: WidgetId;
  title: string;
  children: ReactNode;
  className?: string;
}

function WidgetWrapperInner({ id, title, children, className = '' }: WidgetWrapperProps) {
  const { toggleWidget } = useExecutive();

  return (
    <div
      id={id}
      className={`rounded-lg border border-border-default bg-bg-surface overflow-hidden flex flex-col h-full ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default bg-bg-elevated/50">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="h-3 w-3 text-text-tertiary cursor-grab active:cursor-grabbing opacity-50 shrink-0" />
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider truncate">{title}</span>
        </div>
        <button
          onClick={() => toggleWidget(id)}
          className="flex h-5 w-5 items-center justify-center rounded text-text-tertiary hover:text-text-secondary hover:bg-bg-subtle transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
          title="Ocultar widget"
        >
          <EyeOff className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 p-3 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export const WidgetWrapper = memo(WidgetWrapperInner);
