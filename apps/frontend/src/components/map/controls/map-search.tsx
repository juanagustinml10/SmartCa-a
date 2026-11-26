'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import type { FieldData } from '@/types/fields';
import type { SearchResult } from '../types';

interface MapSearchProps {
  fields: FieldData[];
  onSelect: (result: SearchResult) => void;
}

export default function MapSearch({ fields, onSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length >= 1
    ? fields
        .filter((f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.alias?.toLowerCase().includes(query.toLowerCase())),
        )
        .slice(0, 6)
        .map(
          (f) =>
            ({
              id: f.id,
              type: 'field' as const,
              label: f.name,
              subtitle: `${f.alias ?? ''} · ${f.variety} · ${f.campaign}`,
            }) as SearchResult,
        )
    : [];

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelect(result);
      setQuery(result.label);
      setFocused(false);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center h-10 px-3 rounded-lg border border-border-default bg-bg-surface/90 backdrop-blur-sm shadow-sm">
        <Search className="size-4 text-text-tertiary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar campos..."
          className="flex-1 ml-2 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        {query && (
          <button onClick={handleClear} className="p-0.5 text-text-tertiary hover:text-text-secondary">
            <X className="size-4" />
          </button>
        )}
      </div>

      {focused && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-border-default bg-bg-elevated shadow-lg overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-bg-subtle transition-colors"
            >
              <MapPin className="size-4 text-brand-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{r.label}</div>
                <div className="text-xs text-text-tertiary truncate">{r.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
