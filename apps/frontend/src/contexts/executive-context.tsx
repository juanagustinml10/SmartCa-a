'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { GlobalFilters, LayoutConfig, WidgetConfig, SyncState, WidgetId } from '@/types/executive';

const LAYOUT_KEY = 'smartcana_executive_layout';

function defaultLayoutConfig(): LayoutConfig {
  return {
    fullscreen: false,
    sidebarCompact: false,
    detailPanel: false,
    filtersVisible: true,
    detailPanelWidth: 400,
    widgets: {
      kpis: { id: 'kpis', visible: true, order: 0, size: 'xl' },
      map: { id: 'map', visible: true, order: 1, size: 'lg' },
      ia: { id: 'ia', visible: true, order: 2, size: 'md' },
      timeline: { id: 'timeline', visible: true, order: 3, size: 'md' },
      charts: { id: 'charts', visible: true, order: 4, size: 'xl' },
      alerts: { id: 'alerts', visible: true, order: 5, size: 'md' },
    },
  };
}

function getInitialLayout(): LayoutConfig {
  if (typeof window === 'undefined') return defaultLayoutConfig();
  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (stored) return JSON.parse(stored) as LayoutConfig;
  } catch {}
  return defaultLayoutConfig();
}

interface ExecutiveContextType {
  filters: GlobalFilters;
  layout: LayoutConfig;
  sync: SyncState;
  settingsOpen: boolean;
  exportOpen: boolean;
  setFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  resetFilters: () => void;
  toggleWidget: (id: WidgetId) => void;
  setWidgetSize: (id: WidgetId, size: WidgetConfig['size']) => void;
  setFullscreen: (value: boolean) => void;
  toggleFilters: () => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  selectField: (fieldId: string | null) => void;
  selectCategory: (category: string | null) => void;
  selectCampaign: (campaign: string | null) => void;
  setSettingsOpen: (value: boolean) => void;
  setExportOpen: (value: boolean) => void;
}

const defaultFilters: GlobalFilters = {
  companyId: null,
  farmId: null,
  fieldId: null,
  campaignId: null,
  dateFrom: null,
  dateTo: null,
  category: null,
  supplierId: null,
  status: null,
};

const ExecutiveContext = createContext<ExecutiveContextType | undefined>(undefined);

export function ExecutiveProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);
  const [layout, setLayout] = useState<LayoutConfig>(getInitialLayout);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sync, setSync] = useState<SyncState>({
    selectedCategory: null,
    selectedFieldId: null,
    selectedCampaign: null,
  });

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  const setFilter = useCallback(<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const toggleWidget = useCallback((id: WidgetId) => {
    setLayout((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [id]: { ...prev.widgets[id], visible: !prev.widgets[id].visible },
      },
    }));
  }, []);

  const setWidgetSize = useCallback((id: WidgetId, size: WidgetConfig['size']) => {
    setLayout((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [id]: { ...prev.widgets[id], size },
      },
    }));
  }, []);

  const setFullscreen = useCallback((value: boolean) => {
    setLayout((prev) => ({ ...prev, fullscreen: value }));
  }, []);

  const toggleFilters = useCallback(() => {
    setLayout((prev) => ({ ...prev, filtersVisible: !prev.filtersVisible }));
  }, []);

  const openDetailPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, detailPanel: true }));
  }, []);

  const closeDetailPanel = useCallback(() => {
    setLayout((prev) => ({ ...prev, detailPanel: false }));
  }, []);

  const selectField = useCallback((fieldId: string | null) => {
    setSync((prev) => ({ ...prev, selectedFieldId: fieldId }));
  }, []);

  const selectCategory = useCallback((category: string | null) => {
    setSync((prev) => ({ ...prev, selectedCategory: category }));
  }, []);

  const selectCampaign = useCallback((campaign: string | null) => {
    setSync((prev) => ({ ...prev, selectedCampaign: campaign }));
  }, []);

  return (
    <ExecutiveContext.Provider
      value={{
        filters,
        layout,
        sync,
        settingsOpen,
        exportOpen,
        setFilter,
        resetFilters,
        toggleWidget,
        setWidgetSize,
        setFullscreen,
        toggleFilters,
        openDetailPanel,
        closeDetailPanel,
        selectField,
        selectCategory,
        selectCampaign,
        setSettingsOpen,
        setExportOpen,
      }}
    >
      {children}
    </ExecutiveContext.Provider>
  );
}

export function useExecutive(): ExecutiveContextType {
  const context = useContext(ExecutiveContext);
  if (!context) throw new Error('useExecutive debe usarse dentro de <ExecutiveProvider>');
  return context;
}
