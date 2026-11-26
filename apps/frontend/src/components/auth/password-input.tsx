'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function PasswordInput({ error, label = 'Contraseña', className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className={`w-full h-10 px-3 pr-10 rounded-lg border bg-bg-surface text-sm text-text-primary placeholder:text-text-tertiary transition-colors
            ${error ? 'border-error-500 ring-1 ring-error-500' : 'border-border-default focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
            outline-none ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          tabIndex={-1}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  );
}
