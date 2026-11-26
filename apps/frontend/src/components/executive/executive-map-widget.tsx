'use client';

import dynamic from 'next/dynamic';
import { useExecutive } from '@/contexts/executive-context';
import { MOCK_FIELD_DETAIL } from '@/lib/mock-executive';

const ExecutiveMapInner = dynamic(
  () => import('./executive-map-inner'),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-xs text-text-tertiary">Cargando mapa...</div> },
);

export function ExecutiveMapWidget() {
  const { selectField, openDetailPanel, sync } = useExecutive();

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border-default">
      <ExecutiveMapInner
        fields={MOCK_FIELD_DETAIL}
        selectedFieldId={sync.selectedFieldId}
        onSelectField={(id) => { selectField(id); openDetailPanel(); }}
      />
    </div>
  );
}
