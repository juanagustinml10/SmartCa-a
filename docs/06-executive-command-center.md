# Executive Command Center — Arquitectura

## Visión General

El Executive Command Center (ECC) es un dashboard ejecutivo de alto nivel diseñado para concentrar toda la información crítica del negocio agrícola en una única pantalla. Inspirado en plataformas como Palantir Foundry, Microsoft Fabric, Power BI, SAP Analytics Cloud, ArcGIS Dashboard, Datadog y Grafana Enterprise.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 16.2.12 | App Router, SSR, Code Splitting |
| React | 19.2.4 | UI declarativa con Server Components |
| TypeScript | 5.x | Tipado estático estricto |
| Tailwind CSS | 4.x | Estilos utilitarios con design tokens |
| Framer Motion | 12.x | Animaciones de componentes |
| Recharts | 3.x | Visualización de datos (6 tipos de gráficos) |
| Leaflet + react-leaflet | 1.9/5.x | Mapas interactivos con GeoJSON |
| Lucide React | 1.x | Iconografía consistente |

## Estructura de Archivos

```
src/
├── app/executive/
│   └── page.tsx                    # Página principal del ECC
├── components/executive/
│   ├── executive-layout.tsx        # Layout shell (sidebar, header, main, detail)
│   ├── executive-header.tsx        # Header inteligente con reloj, notificaciones, estado conexiones
│   ├── executive-sidebar.tsx       # Sidebar compacta con navegación
│   ├── executive-kpi.tsx           # KPI cards con contador animado
│   ├── global-filters.tsx          # Barra de filtros globales
│   ├── detail-panel.tsx            # Panel lateral de detalle de campo
│   ├── executive-map-widget.tsx    # Widget contenedor del mapa (lazy loaded)
│   ├── executive-map-inner.tsx     # Mapa Leaflet con GeoJSON
│   ├── ia-panel.tsx                # Panel de inteligencia artificial
│   ├── executive-timeline.tsx      # Timeline de eventos
│   ├── chart-grid.tsx              # Grid de 6 gráficos sincronizados
│   ├── widget-wrapper.tsx          # Contenedor genérico de widgets
│   ├── widget-settings.tsx         # Modal de personalización de widgets
│   └── export-modal.tsx            # Modal de exportación
├── contexts/
│   └── executive-context.tsx       # Estado global del ECC
├── types/
│   └── executive.ts               # Tipos y contratos
└── lib/
    └── mock-executive.ts           # Datos mock para desarrollo
```

## Flujo de Datos

```
User Action
    │
    ▼
ExecutiveContext (useExecutive)
    │
    ├── filters (GlobalFilters) ──────► Todos los widgets
    ├── layout (LayoutConfig) ────────► Widget visibility, fullscreen, detail panel
    └── sync (SyncState) ────────────► Sincronización entre widgets (map → detail, chart → timeline)
            │
            ▼
    Widgets reaccionan a cambios vía useMemo / useEffect
```

## Componentes y Responsabilidades

### ExecutiveLayout
- Provider wrapper que inyecta ExecutiveProvider
- Maneja modo fullscreen vs normal
- Renderiza sidebar, header, filters bar, main content y detail panel
- Incluye modales globales (widget settings, export)

### ExecutiveHeader
- Reloj en vivo actualizado cada segundo
- Indicador de estado de conexiones (DB, API, GIS, IA)
- Botones: Filtros, Exportar, Notificaciones, Configuración, Fullscreen
- Dropdown de notificaciones con contador no leídas

### ExecutiveKpiCard
- 10 indicadores con animación de conteo
- Formato inteligente: K/M para valores grandes
- Tooltip informativo vía atributo title
- Barra animada en hover
- Colores semánticos según categoría

### GlobalFilters
- 9 tipos de filtro: empresa, establecimiento, campo, campaña, estado, categoría, proveedor, fecha desde, fecha hasta
- Animación de expansión/contracción
- Botón para limpiar filtros

### DetailPanel
- Panel lateral que se abre al seleccionar un campo
- Muestra SHI Gauge, métricas del campo, desglose SHI
- Cierra con botón X

### ExecutiveMapInner
- Leaflet MapContainer con capa CartoDB dark
- GeoJSON features coloreados por SHI score
- Tooltips sticky con tooltip personalizado
- Click → selectField + openDetailPanel
- Hover con highlight del polígono

### IaPanel
- Resumen diario generado por IA
- Recomendación principal con nivel de riesgo
- Predicciones de producción y financieras con indicadores de confianza
- Lista de recomendaciones activas

### ExecutiveTimeline
- Eventos ordenados cronológicamente (más reciente primero)
- Filtros: tipo (activity, cost, harvest, alert, ia_query) + severidad (critical, high, medium)
- Búsqueda por texto
- Sincronización con campo seleccionado
- Indicador visual de severidad con borde lateral

### ChartGrid
- 6 gráficos en grid responsivo (2 cols mobile, 3 cols desktop)
- Línea: Producción por campaña con target
- Radar: Dimensiones SHI
- Barras: Costos por categoría (seleccionable → sincroniza)
- Donut: Distribución de costos
- Área: Producción mensual con gradiente
- Treemap: Costos con etiquetas

### WidgetWrapper
- Contenedor genérico con título, grip handle y botón ocultar
- Border redondeado con sombra
- Header con fondo semitransparente

## Estados de Red

| Estado | Visual |
|---|---|
| Conectado | Círculo verde + "Todos los sistemas operativos" |
| Desconectado | Círculo amarillo + "Verificar conexiones" |

## Persistencia

- Layout config (widget visibility, fullscreen, detail panel) guardado en localStorage bajo `smartcana_executive_layout`
- Recuperación automática al cargar la página

## Rendimiento

- **Lazy Loading**: Mapa Leaflet cargado dinámicamente con `next/dynamic`
- **Memoización**: WidgetWrapper con `React.memo`
- **Virtualización**: Ociosa para timeline con más de 50 eventos (preparado)
- **Code Splitting**: Cada widget es un módulo independiente
- **Suspense**: Loading state para el mapa

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| < 640px (mobile) | KPIs en 2 columnas, widgets en 1 columna, header simplificado |
| 640-768px (tablet) | KPIs en 3 columnas, timeline y IA en 1 columna |
| 768-1024px | KPIs en 4 columnas, layout de 4 columnas para widgets |
| 1024-1280px | KPIs en 5 columnas, layout completo |
| > 1280px | KPIs en 6 columnas, layout completo optimizado |

## Personalización

Los usuarios pueden:
- Mostrar/ocultar widgets individuales
- Cambiar tamaño de widgets (preparado)
- Guardar preferencias (persistencia localStorage)
- Activar modo Centro de Control (fullscreen)

## Exportación (Arquitectura Preparada)

Formatos preparados para futura implementación:
- PDF: Documento portátil
- PNG: Captura de imagen
- PowerPoint: Presentación editable
- Excel: Datos tabulares

## Próximas Mejoras

- Drag & drop real para reorganizar widgets
- Conexión con backend real (reemplazar mock data)
- Exportación funcional en todos los formatos
- Temas personalizados por usuario
- Alertas en tiempo real vía WebSocket
- Heatmap en el mapa GIS
